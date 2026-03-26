"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToMainSchema = exports.payBillSchema = exports.withdrawSchema = void 0;
const zod_1 = require("zod");
exports.withdrawSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        accountNumber: zod_1.z.string().min(10).max(10),
        bankCode: zod_1.z.string(),
        transactionPin: zod_1.z.string().regex(/^\d{4}$/u, 'Transaction PIN must be exactly 4 digits'),
    }),
});
exports.payBillSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        billerId: zod_1.z.string(),
        customerId: zod_1.z.string(), // E.g., Phone number or meter number
    }),
});
exports.moveToMainSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
    }),
});
