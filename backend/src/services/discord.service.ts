import axios from 'axios';
import { DiscordUser } from '../types';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export class DiscordService {
  static async exchangeCodeForToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    });

    const response = await axios.post(
      `${DISCORD_API_BASE}/oauth2/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  }

  static async getUserInfo(accessToken: string): Promise<DiscordUser> {
    const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  static getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      response_type: 'code',
      scope: 'identify email',
    });

    if (state) {
      params.append('state', state);
    }

    return `${DISCORD_API_BASE}/oauth2/authorize?${params.toString()}`;
  }
}

