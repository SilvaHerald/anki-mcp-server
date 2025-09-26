import { Module } from '@nestjs/common';
import { AnkiConnectService } from '@src/modules/anki-connect/anki-connect.service';

@Module({
  imports: [],
  providers: [AnkiConnectService],
  exports: [AnkiConnectService],
})
export class AnkiConnectModule {}
