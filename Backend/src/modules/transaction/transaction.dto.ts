import { z } from 'zod';

export const paySchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    title: z.string().optional(),
    merchantName: z.string(),
  }),
});

export type PayDto = z.infer<typeof paySchema>['body'];
