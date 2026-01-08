import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { CaseContextService } from './case-context.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [CasesController],
  providers: [CasesService, CaseContextService],
  exports: [CasesService, CaseContextService],
})
export class CasesModule {}
