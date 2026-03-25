"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundWalletSchema = void 0;
const zod_1 = require("zod");
exports.fundWalletSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
    }),
});
