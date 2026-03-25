import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';
import { AuthRequest } from '@shared/middleware/requireAuth';

export class TransactionController {
  private service = new TransactionService();

  pay = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.processPayment(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getTransactions = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const transactions = await this.service.getTransactions(req.user.id);
      res.status(200).json(transactions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
