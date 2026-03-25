"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const client_1 = require("@prisma/client");
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
}
exports.UserService = UserService;
