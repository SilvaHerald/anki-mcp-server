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
    // Basic
    Front?: string;   // required when model = "Basic"
    Back?: string;    // required when model = "Basic"
    // Cloze
    Text?: string;        // required when model = "Cloze"
    BackExtra?: string;   // required when model = "Cloze"
  };
  tags: string[]; // exactly: ["english", one_of(new_word|phrasal_verb|idiom|collocations|slang)]
};

Return shape: { "cards": CardOut[] }

9 STRICT RULES — if any rule cannot be met, return {"cards": []}:
1. Output must be valid JSON only. No markdown. No comments. No code fences. No reasoning or extra prose.
2. For EACH input item, create only TWO cards with models: Basic, Cloze.
3. The natural sentence that uses the target word/phrase in Basic and Cloze cards must be different.
4. Item type mapping:
  - single word (e.g., "buy", "take", "burn") → deck "Languages::English::New Words", tag "new_word".
  - phrasal verb (verb + particle, e.g., "take off") → deck "Languages::English::Phrasal Verbs", tag "phrasal_verb".
  - idiom → deck "Languages::English::Idioms", tag "idiom".
  - slang → deck "Languages::English::Slangs", tag "slang".
  - collocation → deck "Languages::English::Collocations", tag "collocations".
5. tags must be exactly ["english", "<mapped_tag>"] with the mapped tag chosen from: new_word | phrasal_verb | idiom | collocations | slang.
6. NO DUPLICATE cards. No missing required fields for the chosen model.
7. Use simple ASCII quotes (') not curly quotes.
8. BASIC card fields:
  - model = "Basic"
  - fields.Front = A random natural sentence that uses the target word/phrase in context, then a blank line, then the exact question: "What does the word/phrase '<target>' mean here?"
    Example: "They burned the letter to hide the evidence. What does the word 'burn' mean here?"
  - fields.Back = "Definition (EN): <clear>\nDefinition (${language}): <translation>\nExample: <another natural sentence>\nSynonyms: <comma-separated or '-' if none>"
    Example: "Definition (EN): to set something on fire or damage by fire\nDefinition (${language}): đốt; thiêu\nExample: The chef burned the toast by mistake.\nSynonyms: ignite, scorch, set on fire"
9. CLOZE card fields:
  - model = "Cloze"
  - fields.Text = a random real-life sentence where the target is clozed using these 5 rules:
     1. Sentence must be different from the setence in Front of Basic card.
     2. The target word/phrase must be clozed. For example: the target word/phrase is "burn" then it must be clozed.
     3. If the target is a word with more than 3 characters then clozed EXACTLY three random letters of the target as the hint.
     4. If the target is a word with less or equal 3 characters then clozed EXACTLY one random letter of the target as the hint.
     5. If the target is a phrasal verb or a idiom then clozed a random part of it as the hint.
      Examples:
        * target word "buy" → "I plan to bu{{c1::y}} a new phone."
        * target word "thought" → "His {{c1::tho}}ught was surprising."
        * target phrasal verb "go off" → "His alarm {{c1::goes}} off at 6am."
        * target idiom "rain dogs and cats" → "It rained {{c1::dogs and cats}} yesterday."
  - fields.BackExtra = the same sentence fully written with the target visible (no cloze)
      Examples:
        * target word "buy" → "I plan to buy a new phone."
        * target word "thought" → "His thought was surprising."
        * target phrasal verb "go off" → "His alarm goes off at 6am."
        * target idiom "rain dogs and cats" → "It rained dogs and cats yesterday."

NOW:
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
