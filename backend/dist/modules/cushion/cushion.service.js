"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CushionService = void 0;
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
const interswitch_service_1 = require("../interswitch/interswitch.service");
const ledger_service_1 = require("../wallet/ledger.service");
const client_1 = require("@prisma/client");
const user_service_1 = require("../user/user.service");
class CushionService {
    interswitch = new interswitch_service_1.InterswitchClient();
    ledgerService = new ledger_service_1.LedgerService();
    userService = new user_service_1.UserService();
    async getCushionBalance(userId) {
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new Error('Wallet not found');
        return { cushionBalance: wallet.cushionBalance };
    }
    async withdraw(userId, dto) {
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId } });
        if (!wallet || Number(wallet.cushionBalance) < dto.amount) {
            throw new Error('Insufficient cushion balance');
        }
        await this.userService.verifyTransactionPin(userId, dto.transactionPin);
        const transferResponse = await this.interswitch.transferFund({ accountNumber: dto.accountNumber, bankCode: dto.bankCode }, dto.amount);
        return prisma_1.default.$transaction(async (tx) => {
            // Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: dto.amount,
                    status: transferResponse.status === 'SUCCESS' ? client_1.TransactionStatus.SUCCESS : client_1.TransactionStatus.FAILED,
                    type: client_1.TransactionType.CUSHION_WITHDRAWAL,
                    reference: transferResponse.reference,
                },
            });
            if (transferResponse.status !== 'SUCCESS') {
                throw new Error('Transfer failed at provider');
            }
            // Record Ledger: DEBIT CUSHION
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.DEBIT_CUSHION, dto.amount, `Cushion Withdrawal to ${dto.accountNumber}`);
            return transaction;
        });
    }
    async payBill(userId, dto) {
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId } });
        if (!wallet || Number(wallet.cushionBalance) < dto.amount) {
            throw new Error('Insufficient cushion balance');
        }
        // Mock Interswitch BillPay
        const billResponse = await this.interswitch.payBill(dto.customerId, dto.amount, dto.billerId);
        return prisma_1.default.$transaction(async (tx) => {
            // Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: dto.amount,
                    status: billResponse.status === 'SUCCESS' ? client_1.TransactionStatus.SUCCESS : client_1.TransactionStatus.FAILED,
                    type: client_1.TransactionType.CUSHION_BILL_PAYMENT,
                    reference: billResponse.reference,
                },
            });
            if (billResponse.status !== 'SUCCESS') {
                throw new Error('Bill payment failed at provider');
            }
            // Record Ledger: DEBIT CUSHION
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.DEBIT_CUSHION, dto.amount, `Bill Payment to ${dto.billerId}`);
            return transaction;
        });
    }
    async moveToMain(userId, dto) {
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId } });
        if (!wallet || Number(wallet.cushionBalance) < dto.amount) {
            throw new Error('Insufficient cushion balance');
        }
        return prisma_1.default.$transaction(async (tx) => {
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.DEBIT_CUSHION, dto.amount, 'Moved from cushion to main wallet');
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.CREDIT_MAIN, dto.amount, 'Moved from cushion to main wallet');
            return tx.wallet.findUnique({ where: { userId } });
        });
    }
}
exports.CushionService = CushionService;
