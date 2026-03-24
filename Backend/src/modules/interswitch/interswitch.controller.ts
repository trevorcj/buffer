import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '@infrastructure/db/prisma';

export class InterswitchController {
  
  // Public webhook for async callbacks from Interswitch
  async handleWebhook(req: Request, res: Response) {
    // 1. Verify Interswitch Signature
    // A production app should securely hash the payload with its secret
    const signature = req.headers['interswitch-signature'];
    
    const payload = req.body;
    console.log('[Webhook] Received Interswitch callback:', payload);

    try {
      // Process successful payment completion event
      if (payload.event === 'PAYMENT_SUCCESS' && payload.reference) {
        
        // Find transaction
        const txToUpdate = await prisma.transaction.findUnique({
          where: { reference: payload.reference }
        });

        if (txToUpdate && txToUpdate.status === 'PENDING') {
          await prisma.transaction.update({
            where: { id: txToUpdate.id },
            data: { status: 'SUCCESS' }
          });
          console.log(`[Webhook] Transaction ${txToUpdate.id} marked as SUCCESS.`);
        }
      }

      res.status(200).json({ status: 'Acknowledged' });
    } catch (error) {
      console.error('[Webhook] Error processing event:', error);
      res.status(500).json({ error: 'Internal processing error' });
    }
  }
}
