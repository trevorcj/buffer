"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CushionController = void 0;
const cushion_service_1 = require("./cushion.service");
class CushionController {
    service = new cushion_service_1.CushionService();
    getCushionBalance = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const balance = await this.service.getCushionBalance(req.user.id);
            res.status(200).json(balance);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    withdraw = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.withdraw(req.user.id, req.body);
            res.status(200).json({ message: 'Withdrawal successful', transaction: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    payBill = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.payBill(req.user.id, req.body);
            res.status(200).json({ message: 'Bill payment successful', transaction: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.CushionController = CushionController;
