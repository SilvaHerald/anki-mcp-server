import { Injectable } from '@nestjs/common';
import { HttpClientService } from '@src/common/modules/http-client/http-client.service';
import { CardOut } from '@src/common/schemas/anki-card.schema';
import {
  AnkiConnectPayload,
  AnkiConnectResponse,
} from '@src/modules/anki-connect/anki-connect.interface';

@Injectable()
export class AnkiConnectService {
  private readonly ANKI_URL = 'http://localhost:8765'; // this is default Anki-Connect URL, replace with your own one

  constructor(private readonly httpClientService: HttpClientService) {}

  async anki<T extends AnkiConnectResponse = any, D = any>(
    action: string,
    params: AnkiConnectPayload['params'],
  ) {
    const data = await this.httpClientService.post<T, AnkiConnectPayload<D>>(
      this.ANKI_URL,
      { action, version: 6, params },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return data;
  }

  async findDuplicateInDeck(deck: string, term: string) {
    const query = `deck:"${deck.replace(/"/g, '\\"')}" "${term}"`;
    const ids = await this.anki('findNotes', { query });
    return ids.length > 0;
  }

  async addNotes(notes: ReturnType<typeof this.toAnkiNote>[]) {
    return this.anki<AnkiConnectResponse, ReturnType<typeof this.toAnkiNote>[]>('addNotes', {
      notes,
    });
  }

  toAnkiNote(c: CardOut) {
    const { deck, model, tags, fields } = c;

    const mappedFields =
      model === 'Basic'
        ? {
            Front: fields.Front ?? '',
            Back: fields.Back ?? '',
          }
        : {
            Text: fields.Text ?? '',
            'Back Extra': fields.BackExtra ?? '',
          };

    return {
      deckName: deck,
      modelName: model, // "Basic" | "Cloze"
      fields: mappedFields,
      tags,
      options: {
        allowDuplicate: false,
        duplicateScope: 'deck',
      },
    };
  }
}
