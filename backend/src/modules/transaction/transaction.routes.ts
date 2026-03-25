import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { requireAuth } from '@shared/middleware/requireAuth';
import { validateRequest } from '@shared/middleware/validateRequest';
import { paySchema } from './transaction.dto';

const router = Router();
const controller = new TransactionController();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Virtual Card Payments and Automated Savings
 */

/**
 * @swagger
 * /transactions/pay:
 *   post:
 *     summary: Simulate a POS/Web payment that triggers savings algorithm
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               merchantName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction successful and savings recorded
 *       400:
 *         description: Insufficient funds or processing error
 */
router.post('/pay', validateRequest(paySchema), controller.pay);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get user transaction history with roundups
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Array of transactions
 */
router.get('/', controller.getTransactions);

export default router;
