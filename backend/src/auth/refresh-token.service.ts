import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RefreshTokenService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      username: this.configService.get('REDIS_USERNAME'),
      password: this.configService.get('REDIS_PASSWORD'),
    });
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh:${userId}`;
    await this.redis.set(key, refreshToken, 'EX', 60 * 60 * 24 * 7); // 7 days
  }

  async validateRefreshToken(refreshToken: string): Promise<string | null> {
    // Find the userId by token
    const keys = await this.redis.keys('refresh:*');
    for (const key of keys) {
      const storedToken = await this.redis.get(key);
      if (storedToken === refreshToken) {
        return key.split(':')[1];
      }
    }
    return null;
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    const keys = await this.redis.keys('refresh:*');
    for (const key of keys) {
      const storedToken = await this.redis.get(key);
      if (storedToken === refreshToken) {
        await this.redis.del(key);
        break;
      }
    }
  }
}
