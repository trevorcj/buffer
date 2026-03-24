import prisma from '@infrastructure/db/prisma';
import { Prisma, User, KycStatus, UserSettings } from '@prisma/client';
import { encrypt, decrypt } from '@shared/utils/encryption';

export class UserRepository {
  async findProfile(userId: string) {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        settings: true,
        cards: true,
      },
    });

    if (profile) {
      if (profile.bvn) profile.bvn = decrypt(profile.bvn) || profile.bvn;
      if (profile.nin) profile.nin = decrypt(profile.nin) || profile.nin;
    }

    return profile;
  }

  async updateKyc(userId: string, bvn?: string, nin?: string, status: KycStatus = KycStatus.VERIFIED) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        bvn: bvn ? encrypt(bvn) : undefined,
        nin: nin ? encrypt(nin) : undefined,
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
