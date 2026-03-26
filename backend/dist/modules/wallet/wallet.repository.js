"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
class WalletRepository {
    async getWalletByUserId(userId) {
        return prisma_1.default.wallet.findUnique({
            where: { userId },
        });
    }
}
exports.WalletRepository = WalletRepository;
