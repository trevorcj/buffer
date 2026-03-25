import { Request, Response } from 'express';
import { CushionService } from './cushion.service';
import { AuthRequest } from '@shared/middleware/requireAuth';

export class CushionController {
  private service = new CushionService();

  getCushionBalance = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const balance = await this.service.getCushionBalance(req.user.id);
      res.status(200).json(balance);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  withdraw = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.withdraw(req.user.id, req.body);
      res.status(200).json({ message: 'Withdrawal successful', transaction: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  payBill = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.payBill(req.user.id, req.body);
      res.status(200).json({ message: 'Bill payment successful', transaction: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
