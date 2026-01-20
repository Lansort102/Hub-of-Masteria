import pool from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findByDiscordId(discordId: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE discord_id = $1',
      [discordId]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(userData: {
    discord_id: string;
    username: string;
    discriminator?: string;
    avatar?: string;
    email?: string;
    role?: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (discord_id, username, discriminator, avatar, email, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userData.discord_id,
        userData.username,
        userData.discriminator || null,
        userData.avatar || null,
        userData.email || null,
        userData.role || 'user',
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, userData: {
    username?: string;
    discriminator?: string;
    avatar?: string;
    email?: string;
    role?: string;
  }): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(userData.username);
    }
    if (userData.discriminator !== undefined) {
      updates.push(`discriminator = $${paramCount++}`);
      values.push(userData.discriminator);
    }
    if (userData.avatar !== undefined) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(userData.avatar);
    }
    if (userData.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(userData.role);
    }

    if (updates.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async upsert(userData: {
    discord_id: string;
    username: string;
    discriminator?: string;
    avatar?: string;
    email?: string;
    role?: string;
  }): Promise<User> {
    const existing = await this.findByDiscordId(userData.discord_id);
    
    if (existing) {
      return this.update(existing.id, {
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
      });
    }
    
    return this.create(userData);
  }
}

