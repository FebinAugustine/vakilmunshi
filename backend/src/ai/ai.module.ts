import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { AiDraftingService } from './ai-drafting.service';
import { AiController } from './ai.controller';
import { CasesModule } from '../cases/cases.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [CasesModule, DbModule],
  controllers: [AiController],
  providers: [OpenRouterService, AiDraftingService],
  exports: [OpenRouterService, AiDraftingService],
})
export class AiModule {}
