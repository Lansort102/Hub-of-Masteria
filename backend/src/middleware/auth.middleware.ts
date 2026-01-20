import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service';
import { UserModel } from '../models/User';
import { RequestWithUser } from '../types';

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const payload = JWTService.verifyToken(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

