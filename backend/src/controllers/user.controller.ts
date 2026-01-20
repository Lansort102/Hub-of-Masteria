import { Response } from 'express';
import { RequestWithUser } from '../types';

export class UserController {
  static async getMe(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id, discord_id, username, discriminator, avatar, email, role, created_at } = req.user;
      res.json({
        id,
        discord_id,
        username,
        discriminator,
        avatar,
        email,
        role,
        created_at,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  }
}

