import { z } from 'zod';

const cardPunctuation = /\p{P}$/u;
const consecutiveBlanksPattern = /_{2,}/;
const blankCount = (content: string): number => (content.match(/_/g) ?? []).length;

const cardContentSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (content) => cardPunctuation.test(content),
    'Cards must end with punctuation, such as a period or question mark.'
  );

export const customDeckInputSchema = z.strictObject({
  name: z.string().trim().min(1).max(80),
  watermark: z.string().trim().min(1).max(6),
});

export const customDeckUpdateSchema = customDeckInputSchema.partial();

export const whiteCardInputSchema = z.strictObject({ content: cardContentSchema });

export const blackCardInputSchema = z
  .strictObject({
    content: cardContentSchema
      .refine(
        (content) => !consecutiveBlanksPattern.test(content),
        'Use a single underscore for each blank; consecutive underscores are not allowed.'
      )
      .refine((content) => !/\b(?:a|an|the) _/i.test(content), 'Do not put an article before a blank.'),
    pickCount: z.number().int().min(1),
  })
  .refine(
    (card) => {
      const blanks = blankCount(card.content);
      return blanks === 0 ? card.pickCount === 1 : card.pickCount <= blanks;
    },
    {
      path: ['pickCount'],
      message: 'If there are blanks, pick count must be less than or equal to the number of blanks.',
    }
  );

export const deckWithCardsSchema = z.strictObject({
  id: z.number().int().nonnegative(),
  name: z.string(),
  watermark: z.string().min(1).max(6),
  type: z.enum(['official', 'custom']),
  whiteCards: z.array(z.strictObject({ id: z.number().int(), content: z.string() })),
  blackCards: z.array(z.strictObject({ id: z.number().int(), content: z.string(), pickCount: z.number().int() })),
});

export const customDeckWithCardsSchema = deckWithCardsSchema.extend({
  type: z.literal('custom'),
});

export const cardTextDecksQuerySchema = z.strictObject({
  type: z.enum(['white', 'black']),
  content: z.string().min(1).max(500),
  excludeDeckId: z.coerce.number().int().positive().optional(),
});

export type CustomDeckInput = z.infer<typeof customDeckInputSchema>;
export type DeckWithCards = z.infer<typeof deckWithCardsSchema>;
export type CustomDeckWithCards = z.infer<typeof customDeckWithCardsSchema>;
export type WhiteCardInput = z.infer<typeof whiteCardInputSchema>;
export type BlackCardInput = z.infer<typeof blackCardInputSchema>;
