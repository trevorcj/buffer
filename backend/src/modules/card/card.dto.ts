import { z } from 'zod';

export const createCardSchema = z.object({
  body: z.object({
    // potentially options like label, limit, etc.
  }),
});

export const freezeCardSchema = z.object({
  body: z.object({
    cardId: z.string().uuid(),
  }),
});

export type CreateCardDto = z.infer<typeof createCardSchema>['body'];
export type FreezeCardDto = z.infer<typeof freezeCardSchema>['body'];
