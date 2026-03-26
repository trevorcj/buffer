"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferController = void 0;
const transfer_service_1 = require("./transfer.service");
class TransferController {
    service = new transfer_service_1.TransferService();
    listBanks = async (req, res) => {
        try {
            const banks = await this.service.listBanks();
            res.status(200).json(banks);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    resolveAccount = async (req, res) => {
        try {
            const result = await this.service.resolveAccount(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    sendMoney = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.sendMoney(req.user.id, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getTransferStatus = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const reference = Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference;
            const result = await this.service.getTransferStatus(req.user.id, reference);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
}
exports.TransferController = TransferController;
