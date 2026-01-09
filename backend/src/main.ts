import { NestFactory } from '@nestjs/core';
import { AppModule, corsWhitelist } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: corsWhitelist });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
