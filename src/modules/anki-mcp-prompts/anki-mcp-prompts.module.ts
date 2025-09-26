import { Module } from '@nestjs/common';
import { AnkiConnectModule } from '@src/modules/anki-connect/anki-connect.module';
import { AnkiMcpPromptsService } from '@src/modules/anki-mcp-prompts/anki-mcp-prompts.service';

@Module({
  imports: [AnkiConnectModule],
  providers: [AnkiMcpPromptsService],
  exports: [AnkiMcpPromptsService],
})
export class AnkiMcpPromptsModule {}
