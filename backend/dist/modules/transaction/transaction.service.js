"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const prisma_1 = __importDefault(require("../../infrastructure/db/prisma"));
const interswitch_service_1 = require("../interswitch/interswitch.service");
const ledger_service_1 = require("../wallet/ledger.service");
const client_1 = require("@prisma/client");
class TransactionService {
    interswitch = new interswitch_service_1.InterswitchClient();
    ledgerService = new ledger_service_1.LedgerService();
    calculateSavings(amount, settings) {
        if (settings.savingMode === client_1.SavingMode.AGBA) {
            // Percentage based
            const percentage = Number(settings.percentage) || 2; // Default 2%
            return Number(Math.floor((amount * percentage) / 100));
        }
        else if (settings.savingMode === client_1.SavingMode.YAKUBU) {
            // Round-Up based
            const threshold = Number(settings.roundUpThreshold) || 100; // nearest 50, 100, 500
            const remainder = amount % threshold;
            if (remainder === 0)
                return 0; // Already a perfect multiple
            return threshold - remainder;
        }
        return 0;
    }
    async processPayment(userId, dto) {
        // 1. Fetch user data (Wallet, Settings, Cards)
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { wallet: true, settings: true, cards: true },
        });
        if (!user || !user.wallet || !user.settings) {
            throw new Error('User data incomplete');
        }
        // 2. Calculate savings
        const savingsAmount = this.calculateSavings(dto.amount, user.settings);
        const totalRequired = dto.amount + savingsAmount;
        if (Number(user.wallet.balance) < totalRequired) {
            throw new Error('Insufficient funds in main wallet for this transaction + savings');
        }
        // Mock an active card for interswitch processing
        const activeCard = user.cards.find(c => c.status === 'ACTIVE') || { maskedPan: '4222********1111' };
        // 3. Initiate Interswitch Mock Payment
        const paymentResponse = await this.interswitch.authorizePayment(activeCard, dto.amount);
        // 4. Wrap database inserts and Ledger operations inside a single transaction
        return prisma_1.default.$transaction(async (tx) => {
            // Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: dto.amount,
                    status: paymentResponse.status === 'SUCCESS' ? client_1.TransactionStatus.SUCCESS : client_1.TransactionStatus.FAILED,
                    type: client_1.TransactionType.PAYMENT,
                    reference: paymentResponse.reference,
                },
            });
            if (paymentResponse.status !== 'SUCCESS') {
                return { transaction, saved: 0 };
            }
            // Record Ledger: DEBIT MAIN for payment value
            await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.DEBIT_MAIN, dto.amount, `Payment to ${dto.merchantName}`);
            // Process Savings
            if (savingsAmount > 0) {
                // Create RoundUp Record
                await tx.roundUp.create({
                    data: {
                        transactionId: transaction.id,
                        originalAmount: dto.amount,
                        calculatedSavings: savingsAmount,
                        mode: user.settings.savingMode,
                    },
                });
                // Record Ledger: DEBIT MAIN for savings
                await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.DEBIT_MAIN, savingsAmount, `Savings Deduction (${user.settings.savingMode} Mode)`);
                // Record Ledger: CREDIT CUSHION for savings
                await this.ledgerService.recordTransaction(tx, userId, client_1.LedgerType.CREDIT_CUSHION, savingsAmount, `Savings Added to Cushion`);
            }
            return { transaction, savedAmount: savingsAmount, totalDeducted: totalRequired };
        });
    }
    async getTransactions(userId) {
        return prisma_1.default.transaction.findMany({
            where: { userId },
            include: { roundUp: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.TransactionService = TransactionService;
