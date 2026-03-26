import { z } from 'zod';

export const resolveAccountSchema = z.object({
  body: z.object({
    accountNumber: z.string().min(10).max(10),
    bankCode: z.string().min(1),
  }),
});

export const sendMoneySchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    accountNumber: z.string().min(10).max(10),
    bankCode: z.string().min(1),
    accountName: z.string().min(1).optional(),
    narration: z.string().min(1).max(100).optional(),
    transactionPin: z.string().regex(/^\d{4}$/u, 'Transaction PIN must be exactly 4 digits'),
  }),
});

export type ResolveAccountDto = z.infer<typeof resolveAccountSchema>['body'];
export type SendMoneyDto = z.infer<typeof sendMoneySchema>['body'];
