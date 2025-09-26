import { Injectable, Scope } from '@nestjs/common';
import { Prompt } from '@rekog/mcp-nest';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class AnkiMcpPromptsService {
  // Need to improve the prompt for small AI models because they are not smart enought to understand all of these contexts
  @Prompt({
    name: 'get-effective-cards-prompt',
    description: 'Create effective Anki cards for English vocabulary using active recall',
    parameters: z.object({
      words: z.string().describe('Words/phrases to create cards for'),
      language: z.string().describe('Target language for translations (e.g., vi, es)'),
    }),
  })
  getEffectiveCardsPrompt({ words, language }: { words: string; language: string }) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are to output ONLY a valid JSON object. No code fences. No extra text. No explanations. No thoughts/reasoning.

Schema (MUST MATCH):
type CardOut = {
  deck: "Languages::English::New Words"
      | "Languages::English::Phrasal Verbs"
      | "Languages::English::Idioms"
      | "Languages::English::Collocations"
      | "Languages::English::Slangs";
  model: "Basic" | "Cloze";
  fields: {
    // Basic (recognition)
    Front?: string;   // required when model = "Basic"
    Back?: string;    // required when model = "Basic"
    // Cloze (production)
    Text?: string;        // required when model = "Cloze"
    BackExtra?: string;   // required when model = "Cloze"
  };
  tags: string[]; // exactly: ["english", one_of(new_word|phrasal_verb|idiom|collocations|slang)]
};

Return shape: { "cards": CardOut[] }

STRICT RULES — if any rule cannot be met, return {"cards": []}:
- Output must be valid JSON only. No markdown. No comments. No code fences. No reasoning or extra prose.
- For EACH input item, create EXACTLY TWO cards:
  (1) Recognition = Basic
  (2) Production = Cloze
  Exception: if the item is an idiom or slang that is awkward for cloze, create TWO Basic cards instead.
- Item type mapping:
  - single word (e.g., "buy", "take", "burn") → deck New Words, tag new_word
  - phrasal verb (verb + particle, e.g., "take off") → deck Phrasal Verbs, tag phrasal_verb
  - idiom → deck Idioms, tag idiom
  - slang → deck Slangs, tag slang
  - collocation → deck Collocations, tag collocations
- BASIC card fields:
  - model = "Basic"
  - fields.Front = A natural sentence that uses the target word/phrase in context, then a blank line, then the exact question: "What does the word/phrase '<target>' mean here?"
    Example: "They burned the letter to hide the evidence. What does the word 'burn' mean here?"
  - fields.Back = "Definition (EN): <clear>\nDefinition (${language}): <translation>\nExample: <another natural sentence>\nSynonyms: <comma-separated or '-' if none>"
    Example: "Definition (EN): to set something on fire or damage by fire\nDefinition (${language}): đốt; thiêu\nExample: The chef burned the toast by mistake.\nSynonyms: ignite, scorch, set on fire"

- CLOZE card fields:
  - model = "Cloze"
  - fields.Text = a natural sentence where the target is clozed using EXACTLY the first three letters of the target as the hint, contiguous:
      Examples:
        target "buy"   → "I plan to {{c1::buy}} a new phone."
        target "take"  → "Could you {{c1::tak}}e this upstairs?"
        target "thought" → "His {{c1::tho}}ught was surprising."
  - fields.BackExtra = the same sentence fully written with the target visible (no cloze)
      Examples:
        target "buy"   → "I plan to buy a new phone."
        target "take"  → "Could you take this upstairs?"
        target "thought" → "His thought was surprising."
- tags must be exactly ["english", "<mapped_tag>"] with the mapped tag chosen from: new_word | phrasal_verb | idiom | collocations | slang.
- No duplicate cards. No missing required fields for the chosen model.
- Use simple ASCII quotes (') not curly quotes.

Generate cards for these items: ${words}
Target translation language: ${language}

Return ONLY:
{ "cards": [ ... ] }
`,
          },
        },
      ],
    };
  }
}
