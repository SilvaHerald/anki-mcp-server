import { Module } from '@nestjs/common';
import { AnkiConnectModule } from '@src/modules/anki-connect/anki-connect.module';
import { AnkiMcpToolsService } from '@src/modules/anki-mcp-tools/anki-mcp-tools.service';

@Module({
  imports: [AnkiConnectModule],
  providers: [AnkiMcpToolsService],
  exports: [AnkiMcpToolsService],
})
export class AnkiMcpToolsModule {}
