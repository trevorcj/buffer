"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
const client_1 = require("@prisma/client");
class UserRepository {
    async findProfile(userId) {
        return prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                settings: true,
            },
        });
    }
    async updateKyc(userId, bvn, nin, status = client_1.KycStatus.VERIFIED) {
        return prisma_1.default.user.update({
            where: { id: userId },
            data: {
                bvn,
                nin,
                kycStatus: status,
            },
        });
    }
    async findSettings(userId) {
        return prisma_1.default.userSettings.findUnique({
            where: { userId },
        });
    }
    async updateSettings(userId, data) {
        return prisma_1.default.userSettings.update({
            where: { userId },
            data,
        });
    }
}
exports.UserRepository = UserRepository;
