## 📂 Project Structure

```grapql
src/
├─ app.module.ts # Root NestJS module, imports and wires all feature modules
├─ main.ts # Application entrypoint, bootstraps NestJS + MCP server
├─ mcp-client.ts # Local MCP client for testing/connecting prompts & tools

├─ common/ # Shared utilities and building blocks
│ ├─ errors/
│ │ └─ axios.error.ts # Custom Axios error wrapper (normalizes error shape for MCP tools)
│ ├─ helpers/
│ │ └─ llm.ts # Helper functions for calling LLMs (Ollama/OpenAI-compatible client)
│ ├─ modules/
│ │ └─ http-client/ # Reusable HTTP client module
│ │ ├─ http-client.module.ts
│ │ ├─ http-client.service.ts
│ │ └─ http-client.types.ts
│ └─ schemas/
│ └─ anki-card.schema.ts # Zod schemas & TS types for card validation (Basic/Cloze)

├─ modules/ # Feature-specific modules
│ ├─ anki-connect/ # Bridge to Anki via AnkiConnect API
│ │ ├─ anki-connect.interface.ts # TS interfaces for Anki request/response
│ │ ├─ anki-connect.module.ts # NestJS module definition
│ │ └─ anki-connect.service.ts # Service with methods to call AnkiConnect (addNotes, etc.)
│ │
│ ├─ anki-mcp-prompts/ # MCP Prompt definitions
│ │ ├─ anki-mcp-prompts.module.ts
│ │ └─ anki-mcp-prompts.service.ts # Provides structured prompts for AI → card generation
│ │
│ └─ anki-mcp-tools/ # MCP Tool definitions
│ ├─ anki-mcp-tools.module.ts
│ └─ anki-mcp-tools.service.ts # Implements tools that insert cards into Anki (via AnkiConnect)
```

---

### 🔎 Explanation

- **`app.module.ts`** – Central NestJS root module, imports `AnkiConnectModule`, `AnkiMcpPromptsModule`, `AnkiMcpToolsModule`, and any shared modules.
- **`main.ts`** – Application bootstrap, initializes NestJS application as an MCP server.
- **`mcp-client.ts`** – A lightweight client for testing prompts/tools from the same codebase.

#### Common utilities (`common/`)
- **`errors/axios.error.ts`** – Custom error class to safely serialize Axios/HTTP errors.
- **`helpers/llm.ts`** – Abstraction for calling local/cloud LLMs (Ollama, OpenAI, etc.).
- **`modules/http-client/`** – Encapsulates Axios/fetch logic in a clean NestJS service.
- **`schemas/anki-card.schema.ts`** – Defines `CardOut`, validation rules, and Zod schemas for strict type safety.

#### Core modules (`modules/`)
- **`anki-connect/`** – Handles communication with AnkiConnect JSON-RPC API.
- **`anki-mcp-prompts/`** – Declares MCP Prompts that generate structured flashcards from AI.
- **`anki-mcp-tools/`** – Declares MCP Tools that actually insert generated cards into Anki.

---

👉 This structure cleanly separates **infrastructure** (`common/`), **domain logic** (`modules/`), and **entrypoints** (`main.ts`, `mcp-client.ts`).

