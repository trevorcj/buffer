"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("./transaction.service");
class TransactionController {
    service = new transaction_service_1.TransactionService();
    pay = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.processPayment(req.user.id, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getTransactions = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const transactions = await this.service.getTransactions(req.user.id);
            res.status(200).json(transactions);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.TransactionController = TransactionController;
