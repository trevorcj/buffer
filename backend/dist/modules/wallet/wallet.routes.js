"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("./wallet.controller");
const requireAuth_1 = require("@shared/middleware/requireAuth");
const validateRequest_1 = require("@shared/middleware/validateRequest");
const wallet_dto_1 = require("./wallet.dto");
const router = (0, express_1.Router)();
const controller = new wallet_controller_1.WalletController();
router.use(requireAuth_1.requireAuth);
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
router.post('/fund', (0, validateRequest_1.validateRequest)(wallet_dto_1.fundWalletSchema), controller.fundWallet);
exports.default = router;
