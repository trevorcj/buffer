import { z } from 'zod';

export const paySchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    merchantName: z.string(),
  }),
});

export type PayDto = z.infer<typeof paySchema>['body'];
