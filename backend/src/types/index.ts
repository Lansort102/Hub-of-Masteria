import { Request } from 'express';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface User {
  id: string;
  discord_id: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  email: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  discordId: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user?: User;
}

