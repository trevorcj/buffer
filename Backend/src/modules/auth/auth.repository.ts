import prisma from '@infrastructure/db/prisma';
import { Prisma, User } from '@prisma/client';

export class AuthRepository {
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Create initial wallet and settings on registration inside a transaction
  async initializeUser(data: Prisma.UserCreateInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data,
      });

      const wallet = await tx.wallet.create({
        data: { userId: user.id },
      });

      const settings = await tx.userSettings.create({
        data: { userId: user.id },
      });

      return { user, wallet, settings };
    });
  }
}
