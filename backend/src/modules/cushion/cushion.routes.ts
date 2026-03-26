import { Router } from 'express';
import { CushionController } from './cushion.controller';
import { requireAuth } from '@shared/middleware/requireAuth';
import { validateRequest } from '@shared/middleware/validateRequest';
import { payBillSchema, withdrawSchema, moveToMainSchema } from './cushion.dto';

const router = Router();
const controller = new CushionController();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Cushion
 *   description: Savings Cushion Wallet management
 */

/**
 * @swagger
 * /cushion:
 *   get:
 *     summary: Retrieve your cushion balance
 *     security:
 *       - bearerAuth: []
 *     tags: [Cushion]
 *     responses:
 *       200:
 *         description: Cushion balance object
 */
router.get('/', controller.getCushionBalance);

/**
 * @swagger
 * /cushion/withdraw:
 *   post:
 *     summary: Withdraw saved cushion funds to external bank account
 *     security:
 *       - bearerAuth: []
 *     tags: [Cushion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               accountNumber:
 *                 type: string
 *               bankCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: Insufficient funds or invalid bank integration
 */
router.post('/withdraw', validateRequest(withdrawSchema), controller.withdraw);

/**
 * @swagger
 * /cushion/pay-bill:
 *   post:
 *     summary: Pay a utility bill using cushion funds
 *     security:
 *       - bearerAuth: []
 *     tags: [Cushion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               billerId:
 *                 type: string
 *               customerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bill successfully paid
 *       400:
 *         description: Insufficient funds or invalid biller info
 */
router.post('/pay-bill', validateRequest(payBillSchema), controller.payBill);

/**
 * @swagger
 * /cushion/move-to-main:
 *   post:
 *     summary: Move funds from cushion balance back to the main wallet
 *     security:
 *       - bearerAuth: []
 *     tags: [Cushion]
 */
router.post('/move-to-main', validateRequest(moveToMainSchema), controller.moveToMain);

export default router;
