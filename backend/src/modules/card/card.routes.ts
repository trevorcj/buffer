import { Router } from 'express';
import { CardController } from './card.controller';
import { requireAuth } from '@shared/middleware/requireAuth';
import { validateRequest } from '@shared/middleware/validateRequest';
import { freezeCardSchema } from './card.dto';

const router = Router();
const controller = new CardController();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Card
 *   description: Virtual Spending Card Management
 */

/**
 * @swagger
 * /card/create:
 *   post:
 *     summary: Issue a new virtual spending card
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     responses:
 *       201:
 *         description: Card generated
 *       400:
 *         description: User already has active card
 */
router.post('/create', controller.create);

/**
 * @swagger
 * /card:
 *   get:
 *     summary: Get user's virtual cards
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     responses:
 *       200:
 *         description: Array of cards
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /card/freeze:
 *   post:
 *     summary: Freeze an active card
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card status transitioned to FROZEN
 */
router.post('/freeze', validateRequest(freezeCardSchema), controller.freeze);

/**
 * @swagger
 * /card/unfreeze:
 *   post:
 *     summary: Unfreeze a frozen card
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card status transitioned to ACTIVE
 */
router.post('/unfreeze', validateRequest(freezeCardSchema), controller.unfreeze);

export default router;
