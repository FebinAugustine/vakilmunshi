import { Module, Global } from '@nestjs/common';
import { DrizzleProvider, DRIZZLE } from './db.provider';

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DRIZZLE],
})
export class DbModule {}
