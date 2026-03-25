import { PayDto } from './transaction.dto';
import prisma from '@infrastructure/db/prisma';
import { InterswitchClient } from '@modules/interswitch/interswitch.service';
import { LedgerService } from '@modules/wallet/ledger.service';
import { SavingMode, TransactionStatus, TransactionType, LedgerType, UserSettings, Prisma } from '@prisma/client';

export class TransactionService {
  private interswitch = new InterswitchClient();
  private ledgerService = new LedgerService();

  private calculateSavings(amount: number, settings: UserSettings): number {
    if (settings.savingMode === SavingMode.AGBA) {
      // Percentage based
      const percentage = Number(settings.percentage) || 2; // Default 2%
      return Number(Math.floor((amount * percentage) / 100));
    } else if (settings.savingMode === SavingMode.YAKUBU) {
      // Round-Up based
      const threshold = Number(settings.roundUpThreshold) || 100; // nearest 50, 100, 500
      const remainder = amount % threshold;
      if (remainder === 0) return 0; // Already a perfect multiple
      return threshold - remainder;
    }
    return 0;
  }

  async processPayment(userId: string, dto: PayDto) {
    // 1. Fetch user data (Wallet, Settings, Cards)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true, settings: true, cards: true },
    });

    if (!user || !user.wallet || !user.settings) {
      throw new Error('User data incomplete');
    }

    // 2. Calculate savings
    const savingsAmount = this.calculateSavings(dto.amount, user.settings);
    const totalRequired = dto.amount + savingsAmount;

    if (Number(user.wallet.balance) < totalRequired) {
      throw new Error('Insufficient funds in main wallet for this transaction + savings');
    }

    // Mock an active card for interswitch processing
    const activeCard = user.cards.find(c => c.status === 'ACTIVE') || { maskedPan: '4222********1111' };

    // 3. Initiate Interswitch Mock Payment
    const paymentResponse = await this.interswitch.authorizePayment(activeCard, dto.amount);
    
    // 4. Wrap database inserts and Ledger operations inside a single transaction
    return prisma.$transaction(async (tx) => {
      // Create Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: dto.amount,
          status: paymentResponse.status === 'SUCCESS' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
          type: TransactionType.PAYMENT,
          reference: paymentResponse.reference,
        },
      });

      if (paymentResponse.status !== 'SUCCESS') {
        return { transaction, saved: 0 };
      }

      // Record Ledger: DEBIT MAIN for payment value
      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.DEBIT_MAIN,
        dto.amount,
        `Payment to ${dto.merchantName}`
      );

      // Process Savings
      if (savingsAmount > 0) {
        // Create RoundUp Record
        await tx.roundUp.create({
          data: {
            transactionId: transaction.id,
            originalAmount: dto.amount,
            calculatedSavings: savingsAmount,
            mode: user.settings!.savingMode,
          },
        });

        // Record Ledger: DEBIT MAIN for savings
        await this.ledgerService.recordTransaction(
          tx,
          userId,
          LedgerType.DEBIT_MAIN,
          savingsAmount,
          `Savings Deduction (${user.settings!.savingMode} Mode)`
        );

        // Record Ledger: CREDIT CUSHION for savings
        await this.ledgerService.recordTransaction(
          tx,
          userId,
          LedgerType.CREDIT_CUSHION,
          savingsAmount,
          `Savings Added to Cushion`
        );
      }

      return { transaction, savedAmount: savingsAmount, totalDeducted: totalRequired };
    });
  }

  async getTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { roundUp: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
