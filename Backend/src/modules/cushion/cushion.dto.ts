import { z } from 'zod';

export const withdrawSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    accountNumber: z.string().min(10).max(10),
    bankCode: z.string(),
  }),
});

export const payBillSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    billerId: z.string(),
    customerId: z.string(), // E.g., Phone number or meter number
  }),
});

export type WithdrawDto = z.infer<typeof withdrawSchema>['body'];
export type PayBillDto = z.infer<typeof payBillSchema>['body'];
