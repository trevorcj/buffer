import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '@shared/middleware/requireAuth';
import { validateRequest } from '@shared/middleware/validateRequest';
import {
  verifyIdentitySchema,
  updateSettingsSchema,
  setTransactionPinSchema,
  changeTransactionPinSchema,
} from './user.dto';

const router = Router();
const controller = new UserController();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Management and KYC API
 */

router.use(requireAuth);

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
router.post('/verify-identity', validateRequest(verifyIdentitySchema), controller.verifyIdentity);

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
router.put('/settings', validateRequest(updateSettingsSchema), controller.updateSettings);

/**
 * @swagger
 * /user/set-transaction-pin:
 *   post:
 *     summary: Set a 4-digit transaction PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 */
router.post('/set-transaction-pin', validateRequest(setTransactionPinSchema), controller.setTransactionPin);

/**
 * @swagger
 * /user/change-transaction-pin:
 *   put:
 *     summary: Change an existing 4-digit transaction PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 */
router.put('/change-transaction-pin', validateRequest(changeTransactionPinSchema), controller.changeTransactionPin);

export default router;
