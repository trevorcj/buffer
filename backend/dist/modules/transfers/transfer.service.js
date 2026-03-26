"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferService = void 0;
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
const interswitch_service_1 = require("../interswitch/interswitch.service");
const user_service_1 = require("../user/user.service");
const ledger_service_1 = require("../wallet/ledger.service");
const client_1 = require("@prisma/client");
class TransferService {
    interswitch = new interswitch_service_1.InterswitchClient();
    userService = new user_service_1.UserService();
    ledgerService = new ledger_service_1.LedgerService();
    async listBanks() {
        return this.interswitch.getBanks();
    }
    async resolveAccount(dto) {
        return this.interswitch.resolveAccount(dto.accountNumber, dto.bankCode);
    }
    async sendMoney(userId, dto) {
        await this.userService.verifyTransactionPin(userId, dto.transactionPin);
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });
        if (!user?.wallet)
            throw new Error('Wallet not found');
        if (Number(user.wallet.balance) < dto.amount) {
            throw new Error('Insufficient funds in main wallet');
        }
        const recipient = await this.interswitch.resolveAccount(dto.accountNumber, dto.bankCode);
        const transferResponse = await this.interswitch.transferFund({
            accountNumber: dto.accountNumber,
            bankCode: dto.bankCode,
            accountName: recipient.accountName,
            narration: dto.narration,
        }, dto.amount);
        return prisma_1.default.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: dto.amount,
                    status: transferResponse.status,
                    type: client_1.TransactionType.PAYMENT,
                    reference: transferResponse.reference,
                },
            });
            if (transferResponse.status !== client_1.TransactionStatus.SUCCESS) {
                return transaction;
            }
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.DEBIT_MAIN, dto.amount, `Transfer to ${transferResponse.recipientName ?? recipient.accountName}`);
            return transaction;
        });
    }
    async getTransferStatus(userId, reference) {
        const transaction = await prisma_1.default.transaction.findFirst({
            where: { userId, reference, type: client_1.TransactionType.PAYMENT },
        });
        if (!transaction)
            throw new Error('Transfer not found');
        const providerStatus = await this.interswitch.getTransferStatus(transaction.reference);
        if (providerStatus.status !== transaction.status) {
            return prisma_1.default.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: providerStatus.status,
                },
            });
        }
        return transaction;
    }
}
exports.TransferService = TransferService;
