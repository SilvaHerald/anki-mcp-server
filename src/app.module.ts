import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { HttpClientModule } from '@src/common/modules/http-client/http-client.module';
import { AnkiConnectModule } from '@src/modules/anki-connect/anki-connect.module';
import { AnkiMcpPromptsModule } from '@src/modules/anki-mcp-prompts/anki-mcp-prompts.module';
import { AnkiMcpToolsModule } from '@src/modules/anki-mcp-tools/anki-mcp-tools.module';

@Module({
  imports: [
    AnkiConnectModule,
    HttpClientModule,
    McpModule.forRoot({
      name: 'anki-mcp-server',
      version: '0.0.1',
      transport: McpTransportType.STDIO,
      // Use stream HTTP for remote connections
      // streamableHttp: {
      //   enableJsonResponse: false,
      //   sessionIdGenerator: () => randomUUID(),
      //   statelessMode: false, // Enables session management
      // },
    }),
    AnkiMcpToolsModule,
    AnkiMcpPromptsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
