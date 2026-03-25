import prisma from '@infrastructure/db/prisma';
import { Prisma, User, KycStatus, UserSettings } from '@prisma/client';

export class UserRepository {
  async findProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        settings: true,
      },
    });
  }

  async updateKyc(userId: string, bvn?: string, nin?: string, status: KycStatus = KycStatus.VERIFIED) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        bvn,
        nin,
        kycStatus: status,
      },
    });
  }

  async findSettings(userId: string) {
    return prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async updateSettings(userId: string, data: Prisma.UserSettingsUpdateInput) {
    return prisma.userSettings.update({
      where: { userId },
      data,
    });
  }
}
