"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const prisma_1 = __importDefault(require("@infrastructure/db/prisma"));
const client_1 = require("@prisma/client");
class CardService {
    async createCard(userId) {
        const existingActiveCard = await prisma_1.default.card.findFirst({
            where: { userId, status: client_1.CardStatus.ACTIVE }
        });
        if (existingActiveCard) {
            throw new Error('User already has an active virtual card');
        }
        // Mock physical/virtual card issuance from Interswitch/API
        // Format: 4222 **** **** 1234
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const maskedPan = `4222********${suffix}`;
        return prisma_1.default.card.create({
            data: {
                userId,
                maskedPan,
                status: client_1.CardStatus.ACTIVE,
            },
        });
    }
    async getCards(userId) {
        return prisma_1.default.card.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async freezeCard(userId, cardId) {
        const card = await prisma_1.default.card.findUnique({ where: { id: cardId } });
        if (!card || card.userId !== userId)
            throw new Error('Card not found');
        return prisma_1.default.card.update({
            where: { id: cardId },
            data: { status: client_1.CardStatus.FROZEN },
        });
    }
    async unfreezeCard(userId, cardId) {
        const card = await prisma_1.default.card.findUnique({ where: { id: cardId } });
        if (!card || card.userId !== userId)
            throw new Error('Card not found');
        return prisma_1.default.card.update({
            where: { id: cardId },
            data: { status: client_1.CardStatus.ACTIVE },
        });
    }
}
exports.CardService = CardService;
