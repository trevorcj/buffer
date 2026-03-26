import { z } from 'zod';
import { KycStatus, SavingMode } from '@prisma/client';

export const verifyIdentitySchema = z.object({
  body: z.object({
    bvn: z.string().optional(),
    nin: z.string().optional(),
  }).refine(data => data.bvn || data.nin, {
    message: "Either bvn or nin is required",
    path: ["bvn", "nin"]
  }),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    savingMode: z.nativeEnum(SavingMode).optional(),
    percentage: z.number().min(0).max(100).optional(),
    roundUpThreshold: z.number().optional(),
  }),
});

const transactionPinSchema = z.string().regex(/^\d{4}$/u, 'Transaction PIN must be exactly 4 digits');

export const setTransactionPinSchema = z.object({
  body: z.object({
    pin: transactionPinSchema,
  }),
});

export const changeTransactionPinSchema = z.object({
  body: z.object({
    currentPin: transactionPinSchema,
    newPin: transactionPinSchema,
  }),
});

export type VerifyIdentityDto = z.infer<typeof verifyIdentitySchema>['body'];
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>['body'];
export type SetTransactionPinDto = z.infer<typeof setTransactionPinSchema>['body'];
export type ChangeTransactionPinDto = z.infer<typeof changeTransactionPinSchema>['body'];
