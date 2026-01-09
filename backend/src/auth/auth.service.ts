import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RefreshTokenService } from './refresh-token.service.js';
import { EmailService } from '../email/email.service.js';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private redis: Redis;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
    private emailService: EmailService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      username: this.configService.get('REDIS_USERNAME'),
      password: this.configService.get('REDIS_PASSWORD'),
    });
  }

  async sendOtp(email: string, isRegister: boolean = false) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    await this.redis.set(`otp:${email}`, otp, 'EX', 300); // 5 minutes
    await this.redis.set(
      `otp_type:${email}`,
      isRegister ? 'register' : 'login',
      'EX',
      300,
    );
    try {
      await this.emailService.sendOtp(email, otp);
    } catch (error) {
      await this.redis.del(`otp:${email}`);
      await this.redis.del(`otp_type:${email}`);
      throw new UnauthorizedException('Failed to send OTP');
    }
  }

  async verifyOtp(email: string, token: string, isRegister: boolean = false) {
    const storedOtp = await this.redis.get(`otp:${email}`);
    const otpType = await this.redis.get(`otp_type:${email}`);

    if (!storedOtp || storedOtp !== token) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Delete OTP
    await this.redis.del(`otp:${email}`);
    await this.redis.del(`otp_type:${email}`);

    // Handle auth
    let user;
    if (otpType === 'register' || isRegister) {
      // Sign up
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password: token, // Use OTP as temporary password
      });
      if (error || !data.user) {
        throw new UnauthorizedException('Failed to create account');
      }
      user = data.user;
    } else {
      // Sign in - get user by email
      const { data, error } = await this.supabase.auth.admin.listUsers();
      if (error || !data.users) {
        throw new UnauthorizedException('Failed to get users');
      }
      user = data.users.find((u) => u.email === email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();

    await this.refreshTokenService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
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
