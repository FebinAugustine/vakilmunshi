import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CasesService } from '../cases/cases.service';
import { CaseContextService } from '../cases/case-context.service';
import { OpenRouterService } from './openrouter.service';
import { DRIZZLE } from '../db/db.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';

@Injectable()
export class AiDraftingService {
  constructor(
    private casesService: CasesService,
    private caseContextService: CaseContextService,
    private openRouterService: OpenRouterService,
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async generateWinningArgument(
    caseId: string,
    advocateId: string,
    templateType: string,
  ): Promise<string> {
    // Fetch case details
    const caseDetails = await this.casesService.findOne(caseId, advocateId);

    // Aggregate context
    const context = await this.caseContextService.getAggregatedContext(
      caseId,
      advocateId,
    );

    // Build structured prompt with Indian law context
    const prompt = this.buildPrompt(caseDetails, context);

    // Integrate with OpenRouterService
    const aiContent = await this.openRouterService.logic(prompt);

    // Save the result to the drafts table
    await this.db.insert(schema.drafts).values({
      caseId,
      advocateId,
      templateType,
      content: aiContent,
    });

    // Return the AI-generated content
    return aiContent;
  }

  private buildPrompt(caseDetails: any, context: any): string {
    return `
You are an expert legal AI assistant specializing in Indian law. Based on the following case details and context, generate a compelling winning argument for the court.

Case Details:
- Title: ${caseDetails.title}
- CNR Number: ${caseDetails.cnrNumber || 'N/A'}
- Status: ${caseDetails.status}
- Next Hearing: ${caseDetails.nextHearing || 'N/A'}

Relevant Law Points:
${context.lawPoints.map((point) => `- ${point}`).join('\n')}

Previous Arguments:
${context.previousArguments.map((arg) => `- ${arg}`).join('\n')}

Instructions:
- Structure the argument logically with introduction, main points, and conclusion.
- Cite relevant Indian laws, sections, and precedents where applicable.
- Make the argument persuasive, concise, and professional.
- Focus on winning strategies based on the provided context.
- Ensure the language is formal and suitable for court submissions.

Generate the winning argument:
`;
  }
}
