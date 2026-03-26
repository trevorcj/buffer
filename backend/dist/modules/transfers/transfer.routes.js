"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const validateRequest_1 = require("../../shared/middleware/validateRequest");
const transfer_controller_1 = require("./transfer.controller");
const transfer_dto_1 = require("./transfer.dto");
const router = (0, express_1.Router)();
const controller = new transfer_controller_1.TransferController();
router.use(requireAuth_1.requireAuth);
/**
 * @swagger
 * tags:
 *   name: Transfers
 *   description: Bank transfer and send-money endpoints
 */
router.get('/banks', controller.listBanks);
router.post('/resolve-account', (0, validateRequest_1.validateRequest)(transfer_dto_1.resolveAccountSchema), controller.resolveAccount);
router.post('/send', (0, validateRequest_1.validateRequest)(transfer_dto_1.sendMoneySchema), controller.sendMoney);
router.get('/:reference', controller.getTransferStatus);
exports.default = router;
