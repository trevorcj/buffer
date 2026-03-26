"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
class AuthRepository {
    async createUser(data) {
        return prisma_1.default.user.create({
            data,
        });
    }
    async findUserByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    }
    // Create initial wallet and settings on registration inside a transaction
    async initializeUser(data) {
        return prisma_1.default.$transaction(async (tx) => {
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
exports.AuthRepository = AuthRepository;
