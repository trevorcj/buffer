import { z } from 'zod';

export const fundWalletSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  }),
});

export type FundWalletDto = z.infer<typeof fundWalletSchema>['body'];
