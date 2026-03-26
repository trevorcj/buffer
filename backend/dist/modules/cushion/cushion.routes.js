"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cushion_controller_1 = require("./cushion.controller");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const validateRequest_1 = require("../../shared/middleware/validateRequest");
const cushion_dto_1 = require("./cushion.dto");
const router = (0, express_1.Router)();
const controller = new cushion_controller_1.CushionController();
router.use(requireAuth_1.requireAuth);
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
router.post('/withdraw', (0, validateRequest_1.validateRequest)(cushion_dto_1.withdrawSchema), controller.withdraw);
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
router.post('/pay-bill', (0, validateRequest_1.validateRequest)(cushion_dto_1.payBillSchema), controller.payBill);
/**
 * @swagger
 * /cushion/move-to-main:
 *   post:
 *     summary: Move funds from cushion balance back to the main wallet
 *     security:
 *       - bearerAuth: []
 *     tags: [Cushion]
 */
router.post('/move-to-main', (0, validateRequest_1.validateRequest)(cushion_dto_1.moveToMainSchema), controller.moveToMain);
exports.default = router;
