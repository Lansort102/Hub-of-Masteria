import { Response } from 'express';
import { RequestWithUser } from '../types';
import { DiscordService } from '../services/discord.service';
import { UserService } from '../services/user.service';
import { JWTService } from '../services/jwt.service';

export class AuthController {
  static async getDiscordAuthUrl(req: Request, res: Response) {
    try {
      const authUrl = DiscordService.getAuthUrl();
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  }

  static async handleDiscordCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'No authorization code provided' });
      }

      // Обмен кода на access token
      const accessToken = await DiscordService.exchangeCodeForToken(code);

      // Получение информации о пользователе
      const discordUser = await DiscordService.getUserInfo(accessToken);

      // Создание или обновление пользователя в БД
      const user = await UserService.getOrCreateUser(discordUser);

      // Генерация JWT токена
      const token = JWTService.generateToken({
        userId: user.id,
        discordId: user.discord_id,
        role: user.role,
      });

      // Редирект на фронтенд с токеном
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (error) {
      console.error('Error in Discord callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
      res.redirect(`${frontendUrl}?error=auth_failed`);
    }
  }

  static async getCurrentUser(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Возвращаем пользователя без чувствительных данных
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
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  }
}

