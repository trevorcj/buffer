import { Request, Response } from 'express';
import { WalletService } from './wallet.service';
import { AuthRequest } from '@shared/middleware/requireAuth';

export class WalletController {
  private service = new WalletService();

  getWallet = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const wallet = await this.service.getWallet(req.user.id);
      res.status(200).json(wallet);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  fundWallet = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const updatedWallet = await this.service.fundWallet(req.user.id, req.body);
      res.status(200).json({ message: 'Wallet funded successfully', wallet: updatedWallet });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
