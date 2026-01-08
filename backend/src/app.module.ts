import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisThrottlerStorage } from '@nestjs-redis/throttler-storage';
import { createClient } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { CasesModule } from './cases/cases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{ ttl: 60000, limit: 10 }],
        storage: new RedisThrottlerStorage(
          createClient({
            socket: {
              host: configService.get('REDIS_HOST'),
              port: configService.get('REDIS_PORT'),
            },
            username: configService.get('REDIS_USERNAME'),
            password: configService.get('REDIS_PASSWORD'),
          }),
        ),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ClientsModule,
    CasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
