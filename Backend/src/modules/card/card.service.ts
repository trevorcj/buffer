import prisma from '@infrastructure/db/prisma';
import { CardStatus } from '@prisma/client';

export class CardService {
  async createCard(userId: string) {
    const existingActiveCard = await prisma.card.findFirst({
      where: { userId, status: CardStatus.ACTIVE }
    });

    if (existingActiveCard) {
      throw new Error('User already has an active virtual card');
    }

    // Mock physical/virtual card issuance from Interswitch/API
    // Format: 4000 0000 0000 1234
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const middleSection = "0000 0000";
    const pan = `4000 ${middleSection} ${suffix}`;
    const maskedPan = `4000********${suffix}`;
    const expiryDate = "03/28"; // Static future date for demo
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    return prisma.card.create({
      data: {
        userId,
        pan,
        maskedPan,
        expiryDate,
        cvv,
        status: CardStatus.ACTIVE,
      },
    });
  }

  async getCards(userId: string) {
    return prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async freezeCard(userId: string, cardId: string) {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== userId) throw new Error('Card not found');

    return prisma.card.update({
      where: { id: cardId },
      data: { status: CardStatus.FROZEN },
    });
  }

  async unfreezeCard(userId: string, cardId: string) {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== userId) throw new Error('Card not found');

    return prisma.card.update({
      where: { id: cardId },
      data: { status: CardStatus.ACTIVE },
    });
  }
}
