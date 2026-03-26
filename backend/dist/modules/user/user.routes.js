"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const validateRequest_1 = require("../../shared/middleware/validateRequest");
const user_dto_1 = require("./user.dto");
const router = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Management and KYC API
 */
router.use(requireAuth_1.requireAuth);
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 */
router.get('/profile', controller.getProfile);
/**
 * @swagger
 * /user/verify-identity:
 *   post:
 *     summary: Verify identity with BVN or NIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bvn:
 *                 type: string
 *               nin:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC status updated to VERIFIED
 */
router.post('/verify-identity', (0, validateRequest_1.validateRequest)(user_dto_1.verifyIdentitySchema), controller.verifyIdentity);
/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Users configured savings settings
 */
router.get('/settings', controller.getSettings);
/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Update user settings
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               savingMode:
 *                 type: string
 *                 enum: [AGBA, YAKUBU]
 *               percentage:
 *                 type: number
 *               roundUpThreshold:
 *                 type: number
 *     responses:
 *       200:
 *         description: User settings updated
 */
router.put('/settings', (0, validateRequest_1.validateRequest)(user_dto_1.updateSettingsSchema), controller.updateSettings);
/**
 * @swagger
 * /user/set-transaction-pin:
 *   post:
 *     summary: Set a 4-digit transaction PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 */
router.post('/set-transaction-pin', (0, validateRequest_1.validateRequest)(user_dto_1.setTransactionPinSchema), controller.setTransactionPin);
/**
 * @swagger
 * /user/change-transaction-pin:
 *   put:
 *     summary: Change an existing 4-digit transaction PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 */
router.put('/change-transaction-pin', (0, validateRequest_1.validateRequest)(user_dto_1.changeTransactionPinSchema), controller.changeTransactionPin);
exports.default = router;
