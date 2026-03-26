import prisma from '@infrastructure/db/prisma';
import { InterswitchClient } from '@modules/interswitch/interswitch.service';
import { UserService } from '@modules/user/user.service';
import { LedgerService } from '@modules/wallet/ledger.service';
import { LedgerType, TransactionStatus, TransactionType } from '@prisma/client';
import { ResolveAccountDto, SendMoneyDto } from './transfer.dto';

export class TransferService {
  private interswitch = new InterswitchClient();
  private userService = new UserService();
  private ledgerService = new LedgerService();

  async listBanks() {
    return this.interswitch.getBanks();
  }

  async resolveAccount(dto: ResolveAccountDto) {
    return this.interswitch.resolveAccount(dto.accountNumber, dto.bankCode);
  }

  async sendMoney(userId: string, dto: SendMoneyDto) {
    await this.userService.verifyTransactionPin(userId, dto.transactionPin);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user?.wallet) throw new Error('Wallet not found');
    if (Number(user.wallet.balance) < dto.amount) {
      throw new Error('Insufficient funds in main wallet');
    }

    const recipient = await this.interswitch.resolveAccount(dto.accountNumber, dto.bankCode);
    const transferResponse = await this.interswitch.transferFund(
      {
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
        accountName: recipient.accountName,
        narration: dto.narration,
      },
      dto.amount
    );

    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: dto.amount,
          status: transferResponse.status,
          type: TransactionType.PAYMENT,
          reference: transferResponse.reference,
        },
      });

      if (transferResponse.status !== TransactionStatus.SUCCESS) {
        return transaction;
      }

      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.DEBIT_MAIN,
        dto.amount,
        `Transfer to ${transferResponse.recipientName ?? recipient.accountName}`
      );

      return transaction;
    });
  }

  async getTransferStatus(userId: string, reference: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { userId, reference, type: TransactionType.PAYMENT },
    });

    if (!transaction) throw new Error('Transfer not found');

    const providerStatus = await this.interswitch.getTransferStatus(transaction.reference);
    if (providerStatus.status !== transaction.status) {
      return prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: providerStatus.status,
        },
      });
    }

    return transaction;
  }
}
