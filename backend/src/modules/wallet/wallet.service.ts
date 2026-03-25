import { WalletRepository } from './wallet.repository';
import { LedgerService } from './ledger.service';
import prisma from '@infrastructure/db/prisma';
import { LedgerType } from '@prisma/client';
import { FundWalletDto } from './wallet.dto';

export class WalletService {
  private repository = new WalletRepository();
  private ledgerService = new LedgerService();

  async getWallet(userId: string) {
    const wallet = await this.repository.getWalletByUserId(userId);
    if (!wallet) throw new Error('Wallet not found');
    return wallet;
  }

  async fundWallet(userId: string, dto: FundWalletDto) {
    // Wrap entire fund action in a transaction
    return prisma.$transaction(async (tx) => {
      // Create CREDIT_MAIN ledger entry which securely increments balance
      await this.ledgerService.recordTransaction(
        tx,
        userId,
        LedgerType.CREDIT_MAIN,
        dto.amount,
        'External Wallet Funding'
      );

      return tx.wallet.findUnique({ where: { userId } });
    });
  }
}
