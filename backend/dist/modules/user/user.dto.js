"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTransactionPinSchema = exports.setTransactionPinSchema = exports.updateSettingsSchema = exports.verifyIdentitySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.verifyIdentitySchema = zod_1.z.object({
    body: zod_1.z.object({
        bvn: zod_1.z.string().optional(),
        nin: zod_1.z.string().optional(),
    }).refine(data => data.bvn || data.nin, {
        message: "Either bvn or nin is required",
        path: ["bvn", "nin"]
    }),
});
exports.updateSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        savingMode: zod_1.z.nativeEnum(client_1.SavingMode).optional(),
        percentage: zod_1.z.number().min(0).max(100).optional(),
        roundUpThreshold: zod_1.z.number().optional(),
    }),
});
const transactionPinSchema = zod_1.z.string().regex(/^\d{4}$/u, 'Transaction PIN must be exactly 4 digits');
exports.setTransactionPinSchema = zod_1.z.object({
    body: zod_1.z.object({
        pin: transactionPinSchema,
    }),
});
exports.changeTransactionPinSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPin: transactionPinSchema,
        newPin: transactionPinSchema,
    }),
});
