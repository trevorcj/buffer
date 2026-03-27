import { Router } from 'express';
import { requireAuth } from '@shared/middleware/requireAuth';
import { validateRequest } from '@shared/middleware/validateRequest';
import { TransferController } from './transfer.controller';
import { resolveAccountSchema, sendMoneySchema } from './transfer.dto';

const router = Router();
const controller = new TransferController();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Transfers
 *   description: Bank transfer and send-money endpoints
 */
router.get('/banks', controller.listBanks);
router.post('/resolve-account', validateRequest(resolveAccountSchema), controller.resolveAccount);

/**
 * @swagger
 * /transfers/send:
 *   post:
 *     summary: Send money from the main wallet to a bank account
 *     security:
 *       - bearerAuth: []
 *     tags: [Transfers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: User-facing amount in naira. The backend converts it to kobo before calling Interswitch, whose API docs use kobo.
 *               accountNumber:
 *                 type: string
 *               bankCode:
 *                 type: string
 *               accountName:
 *                 type: string
 *               narration:
 *                 type: string
 *               transactionPin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer submitted successfully
 */
router.post('/send', validateRequest(sendMoneySchema), controller.sendMoney);
router.get('/:reference', controller.getTransferStatus);

export default router;
