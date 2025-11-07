// functions/src/capture-paypal-order.ts
import {Buffer} from 'buffer';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {initializeApp, getApps} from 'firebase-admin/app';
import type {Request, Response} from 'express';
import * as cors from 'cors';

if (!getApps().length) initializeApp();
const db = getFirestore();

const corsHandler = cors({
  origin: 'https://www.swytchpet.io',
  methods: ['POST'],
  credentials: true,
});

interface CaptureBody {
  orderID: string;
  userId: string;
  amount: string | number;
  depositType?: string;
  itemId?: string;
}

export const capturePayPalOrder = async (request: Request, response: Response) => {
  corsHandler(request, response, async () => {
    try {
      console.log('API: capturePayPalOrder (LIVE) hit.');

      if (request.method !== 'POST') {
        return response.status(405).json({error: 'Method Not Allowed'});
      }

      let body: CaptureBody;
      try {
        body = request.body;
      } catch {
        return response.status(400).json({error: 'Invalid JSON'});
      }

      const {orderID, userId, amount, depositType, itemId} = body;

      if (!orderID || !userId || !amount) {
        return response.status(400).json({error: 'Missing orderID, userId, or amount'});
      }

      const parsedAmount = parseFloat(String(amount));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return response.status(400).json({error: 'Invalid amount'});
      }

      if (depositType === 'item-purchase' && !itemId) {
        return response.status(400).json({error: 'itemId required'});
      }

      const clientId = 'AWXzq_rqRIkO289lxmHnRl65RPuVHG-RErvnok3LpO6n9qkSVWJPCD1ngL3kEnC5clOeT_I3yN2CkUNH'!;
      const clientSecret = 'ELv56PJPn4R1_XGToAi2znp4UhdCMSj03E0DyuFE_svStMuBOlo7V4PtCw2kQD__2HaoJ65hEVAAHrHY'!;
      const isProd = process.env.PAYPAL_ENV === 'production';
      const baseUrl = isProd ?
        'https://api-m.paypal.com' :
        'https://api-m.sandbox.paypal.com';

      const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!tokenRes.ok) {
        const txt = await tokenRes.text();
        console.error('Token error:', txt);
        return response.status(502).json({error: 'Auth failed', details: txt});
      }
      const {access_token: accessToken} = await tokenRes.json();

      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'PayPal-Request-Id': `capture-${orderID}-${Date.now()}`,
        },
      });

      const captureData = await captureRes.json();

      if (!captureRes.ok) {
        console.error('Capture failed:', captureData);
        return response.status(502).json({error: 'PayPal capture failed', details: captureData});
      }

      if (captureData.status !== 'COMPLETED') {
        return response.status(400).json({error: 'Payment not completed', status: captureData.status});
      }

      await db.runTransaction(async (t) => {
        const txId = `paypal_${orderID}`;
        const txRef = db.collection('Transactions').doc(txId);
        const capture = captureData.purchase_units[0].payments.captures[0];
        const isItemPurchase = depositType === 'item-purchase' && itemId;

        t.set(
            txRef,
            {
              transactionId: txId,
              userId,
              amount: parsedAmount,
              currency: capture.amount.currency_code,
              transactionType: depositType || 'deposit',
              status: isItemPurchase ? 'completed' : 'pending',
              timestamp: FieldValue.serverTimestamp(),
              paypalOrderId: orderID,
              paymentMethod: 'PayPal',
              paypalCaptureId: capture.id,
              itemId: itemId || null,
            },
            {merge: true}
        );

        if (isItemPurchase) {
          const playerRef = db.collection('Players').doc(userId);
          const itemRef = playerRef.collection('InventoryItems').doc();
          t.set(itemRef, {itemId, acquiredAt: FieldValue.serverTimestamp()});
        }
      });

      const message = depositType === 'item-purchase' && itemId ?
        'Item purchased!' :
        'Deposit received. Awaiting approval.';

      return response.status(200).json({success: true, message});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown';
      console.error('capturePayPalOrder error:', msg);
      return response.status(500).json({success: false, error: 'Server error'});
    }
  });
};
