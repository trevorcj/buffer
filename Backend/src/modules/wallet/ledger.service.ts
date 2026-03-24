import prisma from '@infrastructure/db/prisma';
import { Prisma, LedgerType } from '@prisma/client';

export class LedgerService {
  /**
   * Records a strictly structured double-entry ledger action inside an external Prisma transaction.
   * Modifies the balance directly alongside the ledger to prevent mismatch.
   */
  async recordTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    type: LedgerType,
    amount: Prisma.Decimal | number,
    description: string
  ) {
    // 1. Create Ledger Entry
    const ledger = await tx.ledger.create({
      data: {
        userId,
        type,
        amount,
        description,
      },
    });

    // 2. Update Wallet Balances based on LedgerType
    const walletQuery = { where: { userId } };
    
    switch (type) {
      case LedgerType.CREDIT_MAIN:
        await tx.wallet.update({
          where: walletQuery.where,
          data: { balance: { increment: amount } },
        });
        break;
      case LedgerType.DEBIT_MAIN:
        await tx.wallet.update({
          where: walletQuery.where,
          data: { balance: { decrement: amount } },
        });
        break;
      case LedgerType.CREDIT_CUSHION:
        await tx.wallet.update({
          where: walletQuery.where,
          data: { cushionBalance: { increment: amount } },
        });
        break;
      case LedgerType.DEBIT_CUSHION:
        await tx.wallet.update({
          where: walletQuery.where,
          data: { cushionBalance: { decrement: amount } },
        });
        break;
    }

    return ledger;
  }
}
