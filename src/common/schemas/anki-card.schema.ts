// card.schema.ts
import { z } from 'zod';

export const DeckEnum = z.enum([
  'Languages::English::New Words',
  'Languages::English::Phrasal Verbs',
  'Languages::English::Idioms',
  'Languages::English::Collocations',
  'Languages::English::Slangs',
]);

export const ModelEnum = z.enum(['Basic', 'Cloze']);

const FieldsSchema = z.object({
  // BASIC
  Front: z.string().optional(),
  Back: z.string().optional(),
  Example: z.string().optional(),

  // CLOZE
  Text: z.string().optional(),
  BackExtra: z.string().optional(), // maps to Anki "Back Extra"
});

export const CardOutSchema = z
  .object({
    deck: DeckEnum,
    model: ModelEnum,
    fields: FieldsSchema,
    tags: z.array(z.string()).min(1),
  })
  .superRefine((val, ctx) => {
    if (val.model === 'Basic') {
      if (!val.fields.Front)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Basic requires fields.Front' });
      if (!val.fields.Back)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Basic requires fields.Back' });
    } else {
      if (!val.fields.Text)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cloze requires fields.Text' });
    }
  });

export const CreateCardsParamsSchema = z.object({
  cards: z.array(CardOutSchema).min(1),
});

export type CardOut = z.infer<typeof CardOutSchema>;
export type CreateCardsParams = z.infer<typeof CreateCardsParamsSchema>;
