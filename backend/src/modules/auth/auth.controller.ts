
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        res.status(409).json({ error: error.message });
      } else {
        throw error;
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        throw error;
      }
    }
  };
}
