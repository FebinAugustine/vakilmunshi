import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRATION') },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
