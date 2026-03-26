"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const card_controller_1 = require("./card.controller");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const validateRequest_1 = require("../../shared/middleware/validateRequest");
const card_dto_1 = require("./card.dto");
const router = (0, express_1.Router)();
const controller = new card_controller_1.CardController();
router.use(requireAuth_1.requireAuth);
/**
 * @swagger
 * tags:
 *   name: Card
 *   description: Virtual Spending Card Management
 */
/**
 * @swagger
 * /card/create:
 *   post:
 *     summary: Issue a new virtual spending card
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     responses:
 *       201:
 *         description: Card generated
 *       400:
 *         description: User already has active card
 */
router.post('/create', controller.create);
/**
 * @swagger
 * /card:
 *   get:
 *     summary: Get user's virtual cards
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     responses:
 *       200:
 *         description: Array of cards
 */
router.get('/', controller.getAll);
/**
 * @swagger
 * /card/freeze:
 *   post:
 *     summary: Freeze an active card
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card status transitioned to FROZEN
 */
router.post('/freeze', (0, validateRequest_1.validateRequest)(card_dto_1.freezeCardSchema), controller.freeze);
/**
 * @swagger
 * /card/unfreeze:
 *   post:
 *     summary: Unfreeze a frozen card
 *     security:
 *       - bearerAuth: []
 *     tags: [Card]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card status transitioned to ACTIVE
 */
router.post('/unfreeze', (0, validateRequest_1.validateRequest)(card_dto_1.freezeCardSchema), controller.unfreeze);
exports.default = router;
