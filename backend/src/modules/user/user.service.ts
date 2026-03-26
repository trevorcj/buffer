import { UserRepository } from './user.repository';
import {
  VerifyIdentityDto,
  UpdateSettingsDto,
  SetTransactionPinDto,
  ChangeTransactionPinDto,
} from './user.dto';
import { KycStatus } from '@prisma/client';
import { comparePassword, hashPassword } from '@shared/utils/password';

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

  async setTransactionPin(userId: string, dto: SetTransactionPinDto) {
    const existingPin = await this.repository.findTransactionPinByUserId(userId);
    if (existingPin) throw new Error('Transaction PIN already set');

    const transactionPin = await hashPassword(dto.pin);
    await this.repository.updateTransactionPin(userId, transactionPin);

    return { message: 'Transaction PIN set successfully' };
  }

  async changeTransactionPin(userId: string, dto: ChangeTransactionPinDto) {
    const existingPin = await this.repository.findTransactionPinByUserId(userId);
    if (!existingPin) throw new Error('Transaction PIN not set');

    const isValidPin = await comparePassword(dto.currentPin, existingPin);
    if (!isValidPin) throw new Error('Current transaction PIN is incorrect');

    const transactionPin = await hashPassword(dto.newPin);
    await this.repository.updateTransactionPin(userId, transactionPin);

    return { message: 'Transaction PIN changed successfully' };
  }

  async verifyTransactionPin(userId: string, pin: string) {
    const existingPin = await this.repository.findTransactionPinByUserId(userId);
    if (!existingPin) throw new Error('Transaction PIN not set');

    const isValidPin = await comparePassword(pin, existingPin);
    if (!isValidPin) throw new Error('Invalid transaction PIN');
  }
}
