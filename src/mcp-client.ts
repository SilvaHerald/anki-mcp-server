// client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ollama, OLLAMA_MODEL } from './common/helpers/llm';

// 1) Connect to your MCP server (adjust command/args)
const client = new Client({ name: 'anki-runner', version: '1.0.0' });

async function main() {
  await client.connect(
    new StdioClientTransport({
      command: 'node',
      args: ['dist/main.js'], // your MCP server entry (Nest server wrapper that exposes MCP)
    }),
  );

  // 2) Fetch your prompt by name and args
  const promptName = 'get-effective-cards-prompt';
  const promptArgs = {
    words: 'get cold feet, in hot water, out of the loop, wolf in sheep clothing, sharp as a tack',
    language: 'vietnamese',
  };
  const prompt = await client.getPrompt({ name: promptName, arguments: promptArgs });

  // 3) Send prompt.messages -> Ollama (OpenAI Chat Completions format)
  const chatMessages = prompt.messages.map((m: any) => ({
    role: m.role, // "system" | "user" | "assistant"
    content: typeof m.content === 'string' ? m.content : (m.content?.text ?? ''),
  }));

  const completion = await ollama.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: chatMessages,
    // Important: your MCP prompt should say “RETURN STRICT JSON ONLY”
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  // 4) Parse JSON back into { cards: [...] }
  const raw = completion.choices[0]?.message?.content ?? '';
  console.log(`AI MESSAGE: ${raw}`);
  let payload: { cards: any[] };
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.log('Error while parsing JSON: ', e);
    throw new Error('Model did not return valid JSON. Got:\n' + raw);
  }

  // 5) Call your MCP tool with the parsed JSON
  // Tool name = what you defined, e.g., "create-anki-cards"
  const toolCall = await client.callTool({ name: 'create-anki-cards', arguments: payload });

  // 6) Inspect results (AnkiConnect addNotes returns id/null array)
  console.log('Anki addNotes result:', toolCall?.content ?? toolCall);
}

void main();
