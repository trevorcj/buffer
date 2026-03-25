import prisma from '@infrastructure/db/prisma';
import { CardStatus } from '@prisma/client';
import { InterswitchClient } from '@modules/interswitch/interswitch.service';
import { encrypt, decrypt } from '@shared/utils/encryption';

export class CardService {
  private interswitch = new InterswitchClient();
  async createCard(userId: string) {
    const existingActiveCard = await prisma.card.findFirst({
      where: { userId, status: CardStatus.ACTIVE }
    });

    if (existingActiveCard) {
      throw new Error('User already has an active virtual card');
    }

    const cardDetails = await this.interswitch.issueVirtualCard(userId);

    return prisma.card.create({
      data: {
        userId,
        pan: encrypt(cardDetails.pan),
        maskedPan: cardDetails.maskedPan,
        expiryDate: cardDetails.expiryDate,
        cvv: encrypt(cardDetails.cvv),
        status: CardStatus.ACTIVE,
      },
    });
  }

  async getCards(userId: string) {
    const cards = await prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return cards.map(card => ({
      ...card,
      pan: decrypt(card.pan) || card.pan,
      cvv: decrypt(card.cvv) || card.cvv,
    }));
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
