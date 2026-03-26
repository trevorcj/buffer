import prisma from '@infrastructure/db/prisma';
import { WithdrawDto, PayBillDto, MoveToMainDto } from './cushion.dto';
import { InterswitchClient } from '@modules/interswitch/interswitch.service';
import { LedgerService } from '@modules/wallet/ledger.service';
import { LedgerType, TransactionType, TransactionStatus } from '@prisma/client';
import { UserService } from '@modules/user/user.service';

export class CushionService {
  private interswitch = new InterswitchClient();
  private ledgerService = new LedgerService();
  private userService = new UserService();

  async getCushionBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error('Wallet not found');
    return { cushionBalance: wallet.cushionBalance };
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.cushionBalance) < dto.amount) {
      throw new Error('Insufficient cushion balance');
    }

    await this.userService.verifyTransactionPin(userId, dto.transactionPin);

    const transferResponse = await this.interswitch.transferFund(
      { accountNumber: dto.accountNumber, bankCode: dto.bankCode },
      dto.amount
    );

    return prisma.$transaction(async (tx) => {
      // Create Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: dto.amount,
          status: transferResponse.status === 'SUCCESS' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
          type: TransactionType.CUSHION_WITHDRAWAL,
          reference: transferResponse.reference,
        },
      });

      if (transferResponse.status !== 'SUCCESS') {
        throw new Error('Transfer failed at provider');
      }

      // Record Ledger: DEBIT CUSHION
      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.DEBIT_CUSHION,
        dto.amount,
        `Cushion Withdrawal to ${dto.accountNumber}`
      );

      return transaction;
    });
  }

  async payBill(userId: string, dto: PayBillDto) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.cushionBalance) < dto.amount) {
      throw new Error('Insufficient cushion balance');
    }

    // Mock Interswitch BillPay
    const billResponse = await this.interswitch.payBill(dto.customerId, dto.amount, dto.billerId);

    return prisma.$transaction(async (tx) => {
      // Create Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: dto.amount,
          status: billResponse.status === 'SUCCESS' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
          type: TransactionType.CUSHION_BILL_PAYMENT,
          reference: billResponse.reference,
        },
      });

      if (billResponse.status !== 'SUCCESS') {
        throw new Error('Bill payment failed at provider');
      }

      // Record Ledger: DEBIT CUSHION
      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.DEBIT_CUSHION,
        dto.amount,
        `Bill Payment to ${dto.billerId}`
      );

      return transaction;
    });
  }

  async moveToMain(userId: string, dto: MoveToMainDto) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.cushionBalance) < dto.amount) {
      throw new Error('Insufficient cushion balance');
    }

    return prisma.$transaction(async (tx) => {
      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.DEBIT_CUSHION,
        dto.amount,
        'Moved from cushion to main wallet'
      );

      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.CREDIT_MAIN,
        dto.amount,
        'Moved from cushion to main wallet'
      );

      return tx.wallet.findUnique({ where: { userId } });
    });
  }
}
