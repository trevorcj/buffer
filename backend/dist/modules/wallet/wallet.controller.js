"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const wallet_service_1 = require("./wallet.service");
class WalletController {
    service = new wallet_service_1.WalletService();
    getWallet = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const wallet = await this.service.getWallet(req.user.id);
            res.status(200).json(wallet);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    fundWallet = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const updatedWallet = await this.service.fundWallet(req.user.id, req.body);
            res.status(200).json({ message: 'Wallet funded successfully', wallet: updatedWallet });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.WalletController = WalletController;
