import { Response } from 'express';
import { AuthRequest } from '@shared/middleware/requireAuth';
import { TransferService } from './transfer.service';

export class TransferController {
  private service = new TransferService();

  listBanks = async (req: AuthRequest, res: Response) => {
    try {
      const banks = await this.service.listBanks();
      res.status(200).json(banks);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  resolveAccount = async (req: AuthRequest, res: Response) => {
    try {
      const result = await this.service.resolveAccount(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  sendMoney = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.sendMoney(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getTransferStatus = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const reference = Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference;
      const result = await this.service.getTransferStatus(req.user.id, reference);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
