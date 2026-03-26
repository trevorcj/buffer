import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '@shared/middleware/requireAuth';

export class UserController {
  private service = new UserService();

  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const profile = await this.service.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  verifyIdentity = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.verifyIdentity(req.user.id, req.body);
      res.status(200).json({ message: 'Identity verified', ...result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getSettings = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const settings = await this.service.getSettings(req.user.id);
      res.status(200).json(settings);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  updateSettings = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const updated = await this.service.updateSettings(req.user.id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  setTransactionPin = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.setTransactionPin(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  changeTransactionPin = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) throw new Error('Unauthorized');
      const result = await this.service.changeTransactionPin(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
