"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("./transaction.controller");
const requireAuth_1 = require("@shared/middleware/requireAuth");
const validateRequest_1 = require("@shared/middleware/validateRequest");
const transaction_dto_1 = require("./transaction.dto");
const router = (0, express_1.Router)();
const controller = new transaction_controller_1.TransactionController();
router.use(requireAuth_1.requireAuth);
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
router.post('/pay', (0, validateRequest_1.validateRequest)(transaction_dto_1.paySchema), controller.pay);
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
exports.default = router;
