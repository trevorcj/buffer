import { Request, Response } from 'express';
import { CardService } from './card.service';
import { AuthRequest } from '@shared/middleware/requireAuth';

export class CardController {
  private service = new CardService();

  create = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.createCard(req.user.id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.getCards(req.user.id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  freeze = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.freezeCard(req.user.id, req.body.cardId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  unfreeze = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.unfreezeCard(req.user.id, req.body.cardId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
