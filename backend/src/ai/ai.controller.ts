import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiDraftingService } from './ai-drafting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiDraftingService: AiDraftingService) {}

  @Post('draft')
  async generateDraft(
    @Body() body: { caseId: string; templateType: string },
    @Request() req,
  ) {
    return this.aiDraftingService.generateWinningArgument(
      body.caseId,
      req.user.userId,
      body.templateType,
    );
  }
}
