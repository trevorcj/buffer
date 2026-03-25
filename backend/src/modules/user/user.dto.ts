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

export type VerifyIdentityDto = z.infer<typeof verifyIdentitySchema>['body'];
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>['body'];
