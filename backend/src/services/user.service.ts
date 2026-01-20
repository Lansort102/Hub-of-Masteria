import { UserModel } from '../models/User';
import { DiscordUser } from '../types';

export class UserService {
  static async getOrCreateUser(discordUser: DiscordUser): Promise<import('../types').User> {
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    return UserModel.upsert({
      discord_id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: avatarUrl,
      email: discordUser.email,
    });
  }
}

