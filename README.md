# 📚 NestJS Anki MCP Server

An **[MCP](https://modelcontextprotocol.io/)** server built with **NestJS** that connects to [AnkiConnect](https://foosoft.net/projects/anki-connect/) and enables AI-assisted **flashcard generation** and management.

This project exposes:
- **MCP Prompts** → generate effective cards (Basic & Cloze) using AI, following active recall & spaced repetition principles.
- **MCP Tools** → create cards directly in Anki via AnkiConnect.

> 🎯 Goal: make vocabulary learning easier by combining local LLMs (via Ollama/DeepSeek/Qwen/etc.), MCP prompts, and Anki.

---

## ✨ Features

- 🧠 **Prompt-based card generation**
  - Define vocabulary words/phrases
  - Get structured Anki-ready JSON cards (Basic + Cloze)
  - Supports tagging & deck mapping (Words, Idioms, Collocations, Phrasal Verbs, Slangs)

- 🛠 **MCP Tools**
  - Create Anki cards programmatically
  - Supports **Basic** and **Cloze** models
  - Bulk note insertion via AnkiConnect

- 🔗 **Seamless AI integration**
  - Works with local LLMs via [Ollama](https://ollama.ai/) (`deepseek-r1`, `qwen2.5`, `llama3.1`, …)
  - Or swap in a cloud model (OpenAI, Anthropic, Gemini)

- 🧩 **NestJS + @rekog/mcp-nest**
  - Strong typing with Zod schemas
  - Clean modular design (`PromptsService`, `ToolsService`, `AnkiConnectService`)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Anki](https://apps.ankiweb.net/) desktop app
- [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin installed in Anki
- Node.js ≥ 22
- pnpm ≥ 9
- (Optional) [Ollama](https://ollama.ai/) for local LLMs

### 2. Clone & install
```bash
git clone https://github.com/<your_username>/anki-mcp-server.git

cd anki-mcp-server

pnpm install
```

### 3. Run MCP server
```bash
pnpm run start:dev
```
This will start a NestJS MCP server exposing:
- Prompts (e.g., get-effective-cards-prompt)
- Tools (e.g., create-anki-cards)

### 4. Connect to a client

- Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector?utm_source=chatgpt.com) to test

```bash
pnpm run mcp:inspect
```
- Or connect via ChatGPT / Claude Desktop if you expose it as a Streamable HTTP MCP server.

### 5. Example usage
Generate cards via MCP Prompt

```json
{
  "cards": [
    {
      "deck": "Languages::English::New Words",
      "model": "Basic",
      "fields": {
        "Front": "They burned the letter to hide the evidence.\nWhat does the word 'burn' mean here?",
        "Back": "Definition (EN): to set something on fire\nDefinition (vi): đốt\nExample: The chef burned the toast.\nSynonyms: ignite, scorch"
      },
      "tags": ["english", "new_word"]
    },
    {
      "deck": "Languages::English::New Words",
      "model": "Cloze",
      "fields": {
        "Text": "They {{c1::bur}}ned the letter to hide the evidence.",
        "BackExtra": "They burned the letter to hide the evidence."
      },
      "tags": ["english", "new_word"]
    }
  ]
}
```
Insert into Anki via MCP Tool

```json
{
  "deck": "Languages::English::New Words",
  "front": "They burned the letter to hide the evidence.\n\nWhat does the word 'burn' mean here?",
  "back": "Definition (EN): ...",
  "tags": ["english", "new_word"]
}
```

## 🛠 Project Structure

Read more at [project structure](docs/project-structure.md).

## 🔄 Architecture

Read more at [architecture](docs/architecture.md)

## 🧪 Development Notes
- Always validate AI output with Zod schemas before sending to AnkiConnect.

- Use temperature: 0 and structured JSON mode in Ollama/OpenAI for consistent results.

- Supported Anki models:

  - Basic: fields → Front, Back

  - Cloze: fields → Text, Back Extra

## 🤝 Contributing
PRs, issues, and discussions are welcome!
Feel free to fork, adapt prompts/tools, or add support for more Anki models.

## 📄 License
MIT — free to use, modify, and distribute.

## 🙌 Acknowledgements
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro)
- [NestJS](https://nestjs.com/)
- [MCP-Nest](https://github.com/rekog-labs/MCP-Nest)
- [Anki](https://apps.ankiweb.net/) + [AnkiConnect](https://git.sr.ht/~foosoft/anki-connect)
- [Ollama](https://ollama.com/) and open-source LLMs (DeepSeek, Qwen, LLaMA, ...etc)
