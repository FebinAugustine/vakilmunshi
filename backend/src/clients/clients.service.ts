import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async create(createClientDto: CreateClientDto, advocateId: string) {
    const [client] = await this.db
      .insert(schema.clients)
      .values({
        advocateId,
        name: createClientDto.name,
        contact: createClientDto.contact,
      })
      .returning();
    return client;
  }

  async findAll(advocateId: string) {
    return this.db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.advocateId, advocateId));
  }

  async findOne(id: string, advocateId: string) {
    const [client] = await this.db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, id))
      .limit(1);

    if (!client || client.advocateId !== advocateId) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    advocateId: string,
  ) {
    const [client] = await this.db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, id))
      .limit(1);

    if (!client || client.advocateId !== advocateId) {
      throw new NotFoundException('Client not found');
    }

    const [updatedClient] = await this.db
      .update(schema.clients)
      .set(updateClientDto)
      .where(eq(schema.clients.id, id))
      .returning();

    return updatedClient;
  }

  async remove(id: string, advocateId: string) {
    const [client] = await this.db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, id))
      .limit(1);

    if (!client || client.advocateId !== advocateId) {
      throw new NotFoundException('Client not found');
    }

    await this.db.delete(schema.clients).where(eq(schema.clients.id, id));
  }
}
