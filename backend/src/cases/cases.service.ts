import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Injectable()
export class CasesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async create(createCaseDto: CreateCaseDto, advocateId: string) {
    const [case_] = await this.db
      .insert(schema.cases)
      .values({
        advocateId,
        clientId: createCaseDto.clientId,
        cnrNumber: createCaseDto.cnrNumber,
        title: createCaseDto.title,
        status: createCaseDto.status,
        nextHearing: createCaseDto.nextHearing,
        caseContext: createCaseDto.caseContext,
      })
      .returning();
    return case_;
  }

  async findAll(advocateId: string) {
    return this.db
      .select()
      .from(schema.cases)
      .where(eq(schema.cases.advocateId, advocateId));
  }

  async findOne(id: string, advocateId: string) {
    const [case_] = await this.db
      .select()
      .from(schema.cases)
      .where(eq(schema.cases.id, id))
      .limit(1);

    if (!case_ || case_.advocateId !== advocateId) {
      throw new NotFoundException('Case not found');
    }

    return case_;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto, advocateId: string) {
    const [case_] = await this.db
      .select()
      .from(schema.cases)
      .where(eq(schema.cases.id, id))
      .limit(1);

    if (!case_ || case_.advocateId !== advocateId) {
      throw new NotFoundException('Case not found');
    }

    const updateData: any = {};
    if (updateCaseDto.clientId !== undefined)
      updateData.clientId = updateCaseDto.clientId;
    if (updateCaseDto.cnrNumber !== undefined)
      updateData.cnrNumber = updateCaseDto.cnrNumber;
    if (updateCaseDto.title !== undefined)
      updateData.title = updateCaseDto.title;
    if (updateCaseDto.status !== undefined)
      updateData.status = updateCaseDto.status;
    if (updateCaseDto.nextHearing !== undefined)
      updateData.nextHearing = updateCaseDto.nextHearing;
    if (updateCaseDto.caseContext !== undefined)
      updateData.caseContext = updateCaseDto.caseContext;

    const [updatedCase] = await this.db
      .update(schema.cases)
      .set(updateData)
      .where(eq(schema.cases.id, id))
      .returning();

    return updatedCase;
  }

  async remove(id: string, advocateId: string) {
    const [case_] = await this.db
      .select()
      .from(schema.cases)
      .where(eq(schema.cases.id, id))
      .limit(1);

    if (!case_ || case_.advocateId !== advocateId) {
      throw new NotFoundException('Case not found');
    }

    await this.db.delete(schema.cases).where(eq(schema.cases.id, id));
  }
}
