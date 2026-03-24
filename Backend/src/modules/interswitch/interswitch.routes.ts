import { Router } from 'express';
import { InterswitchController } from './interswitch.controller';

const router = Router();
const controller = new InterswitchController();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Async callbacks from external providers
 */

/**
 * @swagger
 * /interswitch/webhook:
 *   post:
 *     summary: Handle async Interswitch event callbacks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Event acknowledged
 */
router.post('/webhook', controller.handleWebhook);

export default router;
