"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freezeCardSchema = exports.createCardSchema = void 0;
const zod_1 = require("zod");
exports.createCardSchema = zod_1.z.object({
    body: zod_1.z.object({
    // potentially options like label, limit, etc.
    }),
});
exports.freezeCardSchema = zod_1.z.object({
    body: zod_1.z.object({
        cardId: zod_1.z.string().uuid(),
    }),
});
