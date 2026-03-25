import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { requireAuth } from '@shared/middleware/requireAuth';
import { validateRequest } from '@shared/middleware/validateRequest';
import { fundWalletSchema } from './wallet.dto';

const router = Router();
const controller = new WalletController();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet retrieval and funding
 */

/**
 * @swagger
 * /wallet:
 *   get:
 *     summary: Retrieve the current authenticated user's wallet balances
 *     security:
 *       - bearerAuth: []
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Display main and cushion balances
 */
router.get('/', controller.getWallet);

/**
 * @swagger
 * /wallet/fund:
 *   post:
 *     summary: Fund the main wallet (mocks external top-up)
 *     security:
 *       - bearerAuth: []
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet structured ledger funded
 */
router.post('/fund', validateRequest(fundWalletSchema), controller.fundWallet);

export default router;
