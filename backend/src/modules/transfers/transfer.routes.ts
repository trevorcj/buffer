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
router.post('/send', validateRequest(sendMoneySchema), controller.sendMoney);
router.get('/:reference', controller.getTransferStatus);

export default router;
