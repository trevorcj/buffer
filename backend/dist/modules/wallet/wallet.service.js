"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const wallet_repository_1 = require("./wallet.repository");
const ledger_service_1 = require("./ledger.service");
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
const client_1 = require("@prisma/client");
class WalletService {
    repository = new wallet_repository_1.WalletRepository();
    ledgerService = new ledger_service_1.LedgerService();
    async getWallet(userId) {
        const wallet = await this.repository.getWalletByUserId(userId);
        if (!wallet)
            throw new Error('Wallet not found');
        return wallet;
    }
    async fundWallet(userId, dto) {
        // Wrap entire fund action in a transaction
        return prisma_1.default.$transaction(async (tx) => {
            // Create CREDIT_MAIN ledger entry which securely increments balance
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.CREDIT_MAIN, dto.amount, 'External Wallet Funding');
            return tx.wallet.findUnique({ where: { userId } });
        });
    }
}
exports.WalletService = WalletService;
