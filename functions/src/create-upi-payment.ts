// functions/src/create-upi-payment.ts
import * as crypto from 'crypto';

import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {PlayerData, MEMBERSHIP_TIERS} from './lib/types';
import {Request} from 'firebase-functions/v2/https';
import type {Response} from 'express';

const db = getFirestore();

// Standardized export name
export const createUpiPaymentWebhook = async (request: Request, response: Response) => {
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET) {
    console.error('API: Razorpay secrets are not set on the server.');
    response.status(500).json({error: 'Server payment configuration error.'});
    return;
  }

  const signature = request.headers['x-razorpay-signature'];
  if (typeof signature !== 'string') {
    response.status(400).json({error: 'Signature missing or invalid'});
    return;
  }

  // Signature verification (Security check)
  const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
  shasum.update(request.rawBody);
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    console.warn('API: Invalid Razorpay signature received.');
    response.status(401).json({error: 'Invalid signature'});
    return;
  }

  const {event, payload} = request.body;

  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    const paymentId = payment.id;
    const notes = payment.notes;
    const userId = notes.userId;
    const depositType = notes.depositType;
    const itemId = notes.itemId;
    const amountInPaise = payment.amount;
    const currency = payment.currency;
    const amount = amountInPaise / 100;

    if (!userId) {
      console.error('API: \'userId\' not found in Razorpay payment notes.');
      response.status(200).json({success: false, error: 'User ID missing'});
      return;
    }

    try {
      await db.runTransaction(async (t) => {
        const transactionRefId = `razorpay_${paymentId}`;
        const transactionRef = db.collection('Transactions').doc(transactionRefId);

        const isItemPurchase = depositType === 'item-purchase' && itemId;
        const isMembership = depositType === 'membership';

        t.set(transactionRef, {
          transactionId: transactionRefId,
          userId: userId,
          amount: amount,
          currency: currency,
          transactionType: depositType || 'deposit',
          status: 'success',
          timestamp: FieldValue.serverTimestamp(),
          paymentGatewayId: paymentId,
          paymentMethod: 'Razorpay/UPI',
          itemId: itemId || null,
        }, {merge: true});

        const playerRef = db.collection('Players').doc(userId);
        const playerDoc = await t.get(playerRef);
        if (!playerDoc.exists) {
          throw new Error('Player not found');
        }
        const playerData = playerDoc.data() as PlayerData;

        const updates: { [key: string]: any } = {
          updatedAt: FieldValue.serverTimestamp(),
        };

        if (isItemPurchase) {
          const newItemInstanceRef = playerRef.collection('InventoryItems').doc();
          t.set(newItemInstanceRef, {
            itemId: itemId,
            acquiredAt: FieldValue.serverTimestamp(),
          });
        }

        if (isMembership && (!playerData || !playerData.isPETMember)) {
          const tierKey = itemId as keyof typeof MEMBERSHIP_TIERS;
          if (tierKey && MEMBERSHIP_TIERS[tierKey]) {
            updates.isPETMember = true;
            updates.membership = tierKey;
            updates.level = MEMBERSHIP_TIERS[tierKey].level;
          }
        }

        if (depositType === 'deposit') {
          const joulesToAdd = amount * 10;
          updates.joules = FieldValue.increment(joulesToAdd);
        }

        if (Object.keys(updates).length > 1) {
          t.update(playerRef, updates);
        }
      });

      console.log(`Successfully processed Razorpay payment ${paymentId} for user ${userId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`API: Firestore transaction failed for Razorpay payment ${paymentId}: ${errorMessage}`);
      response.status(500).json({success: false, error: 'Database update failed'});
      return;
    }
  }

  response.status(200).json({success: true});
};
