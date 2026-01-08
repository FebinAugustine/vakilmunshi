import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: env.FRONTEND_URL });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
