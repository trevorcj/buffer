"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMoneySchema = exports.resolveAccountSchema = void 0;
const zod_1 = require("zod");
exports.resolveAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        accountNumber: zod_1.z.string().min(10).max(10),
        bankCode: zod_1.z.string().min(1),
    }),
});
exports.sendMoneySchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        accountNumber: zod_1.z.string().min(10).max(10),
        bankCode: zod_1.z.string().min(1),
        accountName: zod_1.z.string().min(1).optional(),
        narration: zod_1.z.string().min(1).max(100).optional(),
        transactionPin: zod_1.z.string().regex(/^\d{4}$/u, 'Transaction PIN must be exactly 4 digits'),
    }),
});
