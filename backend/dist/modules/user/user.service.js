"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const client_1 = require("@prisma/client");
const password_1 = require("../../shared/utils/password");
class UserService {
    repository = new user_repository_1.UserRepository();
    async getProfile(userId) {
        const profile = await this.repository.findProfile(userId);
        if (!profile)
            throw new Error('User not found');
        // exclude password
        const { password, ...userWithoutPassword } = profile;
        return userWithoutPassword;
    }
    async verifyIdentity(userId, dto) {
        // In a real app, integrate third-party KYC checks here.
        // For this prototype, we mock success and directly save.
        const status = client_1.KycStatus.VERIFIED;
        const updatedUser = await this.repository.updateKyc(userId, dto.bvn, dto.nin, status);
        return {
            id: updatedUser.id,
            kycStatus: updatedUser.kycStatus,
        };
    }
    async getSettings(userId) {
        const settings = await this.repository.findSettings(userId);
        if (!settings)
            throw new Error('Settings not found');
        return settings;
    }
    async updateSettings(userId, dto) {
        // Only update the keys provided
        const updateData = {};
        if (dto.savingMode)
            updateData.savingMode = dto.savingMode;
        if (dto.percentage !== undefined)
            updateData.percentage = dto.percentage;
        if (dto.roundUpThreshold !== undefined)
            updateData.roundUpThreshold = dto.roundUpThreshold;
        return this.repository.updateSettings(userId, updateData);
    }
    async setTransactionPin(userId, dto) {
        const existingPin = await this.repository.findTransactionPinByUserId(userId);
        if (existingPin)
            throw new Error('Transaction PIN already set');
        const transactionPin = await (0, password_1.hashPassword)(dto.pin);
        await this.repository.updateTransactionPin(userId, transactionPin);
        return { message: 'Transaction PIN set successfully' };
    }
    async changeTransactionPin(userId, dto) {
        const existingPin = await this.repository.findTransactionPinByUserId(userId);
        if (!existingPin)
            throw new Error('Transaction PIN not set');
        const isValidPin = await (0, password_1.comparePassword)(dto.currentPin, existingPin);
        if (!isValidPin)
            throw new Error('Current transaction PIN is incorrect');
        const transactionPin = await (0, password_1.hashPassword)(dto.newPin);
        await this.repository.updateTransactionPin(userId, transactionPin);
        return { message: 'Transaction PIN changed successfully' };
    }
    async verifyTransactionPin(userId, pin) {
        const existingPin = await this.repository.findTransactionPinByUserId(userId);
        if (!existingPin)
            throw new Error('Transaction PIN not set');
        const isValidPin = await (0, password_1.comparePassword)(pin, existingPin);
        if (!isValidPin)
            throw new Error('Invalid transaction PIN');
    }
}
exports.UserService = UserService;
