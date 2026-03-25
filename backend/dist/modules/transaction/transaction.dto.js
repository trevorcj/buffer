"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paySchema = void 0;
const zod_1 = require("zod");
exports.paySchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        merchantName: zod_1.z.string(),
    }),
});
