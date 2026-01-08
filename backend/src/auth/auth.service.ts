import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RefreshTokenService } from './refresh-token.service.js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: data.user.id, email: data.user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();

    await this.refreshTokenService.storeRefreshToken(
      data.user.id,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const userId =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Invalidate old refresh token
    await this.refreshTokenService.invalidateRefreshToken(refreshToken);

    const newRefreshToken = this.generateRefreshToken();
    await this.refreshTokenService.storeRefreshToken(userId, newRefreshToken);

    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenService.invalidateRefreshToken(refreshToken);
  }

  private generateRefreshToken(): string {
    return this.jwtService.sign(
      { type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      },
    );
  }
}
