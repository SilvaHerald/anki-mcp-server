import { Injectable } from '@nestjs/common';
import { type Context, Tool } from '@rekog/mcp-nest';
import {
  type CreateCardsParams,
  CreateCardsParamsSchema,
} from '@src/common/schemas/anki-card.schema';
import { AnkiConnectService } from '@src/modules/anki-connect/anki-connect.service';
import type { Request } from 'express';

@Injectable()
export class AnkiMcpToolsService {
  constructor(private readonly ankiConnectService: AnkiConnectService) {}

  @Tool({
    name: 'create-anki-cards',
    description: 'Create one or many Anki notes (Basic or Cloze) from structured JSON',
    parameters: CreateCardsParamsSchema,
  })
  async createAnkiCards({ cards }: CreateCardsParams, _context: Context, _request: Request) {
    const notes = cards.map(c => this.ankiConnectService.toAnkiNote(c));

    const result = await this.ankiConnectService.addNotes(notes); // returns array of ids or nulls

    return result;
  }
}
