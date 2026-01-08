import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';

@Injectable()
export class CaseContextService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async getAggregatedContext(caseId: string, advocateId: string) {
    // First, verify the case exists and belongs to the advocate
    const [case_] = await this.db
      .select()
      .from(schema.cases)
      .where(eq(schema.cases.id, caseId))
      .limit(1);

    if (!case_ || case_.advocateId !== advocateId) {
      throw new NotFoundException('Case not found');
    }

    // Get law points from legalPoints table
    const lawPointsFromTable = await this.db
      .select()
      .from(schema.legalPoints)
      .where(
        and(
          eq(schema.legalPoints.caseId, caseId),
          eq(schema.legalPoints.pointType, 'law_point'),
        ),
      );

    // Get arguments from legalPoints table
    const argumentsFromTable = await this.db
      .select()
      .from(schema.legalPoints)
      .where(
        and(
          eq(schema.legalPoints.caseId, caseId),
          eq(schema.legalPoints.pointType, 'argument'),
        ),
      );

    // Extract from caseContext jsonb
    const caseContext = case_.caseContext as any;
    const lawPointsFromContext = caseContext?.winning_points || [];
    const previousArgumentsFromContext = caseContext?.previous_arguments || [];

    // Aggregate law points
    const allLawPoints = [
      ...lawPointsFromContext,
      ...lawPointsFromTable.map((point) => point.content),
    ];

    // Aggregate previous arguments
    const allPreviousArguments = [
      ...previousArgumentsFromContext,
      ...argumentsFromTable.map((point) => point.content),
    ];

    return {
      caseId,
      lawPoints: allLawPoints,
      previousArguments: allPreviousArguments,
    };
  }
}
