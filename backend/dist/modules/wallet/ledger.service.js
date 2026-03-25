"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const client_1 = require("@prisma/client");
class LedgerService {
    /**
     * Records a strictly structured double-entry ledger action inside an external Prisma transaction.
     * Modifies the balance directly alongside the ledger to prevent mismatch.
     */
    async recordTransaction(tx, userId, type, amount, description) {
        // 1. Create Ledger Entry
        const ledger = await tx.ledger.create({
            data: {
                userId,
                type,
                amount,
                description,
            },
        });
        // 2. Update Wallet Balances based on LedgerType
        const walletQuery = { where: { userId } };
        switch (type) {
            case client_1.LedgerType.CREDIT_MAIN:
                await tx.wallet.update({
                    where: walletQuery.where,
                    data: { balance: { increment: amount } },
                });
                break;
            case client_1.LedgerType.DEBIT_MAIN:
                await tx.wallet.update({
                    where: walletQuery.where,
                    data: { balance: { decrement: amount } },
                });
                break;
            case client_1.LedgerType.CREDIT_CUSHION:
                await tx.wallet.update({
                    where: walletQuery.where,
                    data: { cushionBalance: { increment: amount } },
                });
                break;
            case client_1.LedgerType.DEBIT_CUSHION:
                await tx.wallet.update({
                    where: walletQuery.where,
                    data: { cushionBalance: { decrement: amount } },
                });
                break;
        }
        return ledger;
    }
}
exports.LedgerService = LedgerService;
