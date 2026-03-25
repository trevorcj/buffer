"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = exports.verifyIdentitySchema = void 0;
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
