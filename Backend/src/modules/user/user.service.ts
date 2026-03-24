import { UserRepository } from './user.repository';
import { VerifyIdentityDto, UpdateSettingsDto } from './user.dto';
import { KycStatus } from '@prisma/client';

export class UserService {
  private repository = new UserRepository();

  async getProfile(userId: string) {
    const profile = await this.repository.findProfile(userId);
    if (!profile) throw new Error('User not found');
    
    // exclude password
    const { password, ...userWithoutPassword } = profile;
    return userWithoutPassword;
  }

  async verifyIdentity(userId: string, dto: VerifyIdentityDto) {
    // In a real app, integrate third-party KYC checks here.
    // For this prototype, we mock success and directly save.
    
    const status = KycStatus.VERIFIED;
    const updatedUser = await this.repository.updateKyc(userId, dto.bvn, dto.nin, status);
    
    return {
      id: updatedUser.id,
      kycStatus: updatedUser.kycStatus,
    };
  }

  async getSettings(userId: string) {
    const settings = await this.repository.findSettings(userId);
    if (!settings) throw new Error('Settings not found');
    return settings;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    // Only update the keys provided
    const updateData: any = {};
    if (dto.savingMode) updateData.savingMode = dto.savingMode;
    if (dto.percentage !== undefined) updateData.percentage = dto.percentage;
    if (dto.roundUpThreshold !== undefined) updateData.roundUpThreshold = dto.roundUpThreshold;

    return this.repository.updateSettings(userId, updateData);
  }
}
