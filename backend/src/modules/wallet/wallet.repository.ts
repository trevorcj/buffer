import prisma from '@infrastructure/db/prisma';

export class WalletRepository {
  async getWalletByUserId(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
    });
  }

  // Uses LedgerService behind the scenes in the Service layer
}
