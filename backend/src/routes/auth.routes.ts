import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/discord/url', AuthController.getDiscordAuthUrl);
router.get('/discord/callback', AuthController.handleDiscordCallback);
router.get('/me', authMiddleware, AuthController.getCurrentUser);

export default router;

