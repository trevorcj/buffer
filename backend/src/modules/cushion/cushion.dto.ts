import { z } from 'zod';

export const withdrawSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    accountNumber: z.string().min(10).max(10),
    bankCode: z.string(),
    transactionPin: z.string().regex(/^\d{4}$/u, 'Transaction PIN must be exactly 4 digits'),
  }),
});

export const payBillSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    billerId: z.string(),
    customerId: z.string(), // E.g., Phone number or meter number
  }),
});

export const moveToMainSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  }),
});

export type WithdrawDto = z.infer<typeof withdrawSchema>['body'];
export type PayBillDto = z.infer<typeof payBillSchema>['body'];
export type MoveToMainDto = z.infer<typeof moveToMainSchema>['body'];
