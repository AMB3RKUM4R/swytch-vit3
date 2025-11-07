// functions/src/capture-paypal-order.ts

import {Buffer} from 'buffer';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
// --- REMOVED: initializeApp, getApps, cert imports ---
import {getApps, initializeApp} from 'firebase-admin/app'; // <-- Keep this one
import {Request} from 'firebase-functions/v2/https';
import {Response} from 'express';

// --- REMOVED: ServiceAccount interface and serviceAccount object ---
// --- REMOVED: initializeFirebaseAdmin function ---

// Re-initialize app cleanly without explicit service account
// This uses Google's implicit credentials during deployment/runtime
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Use an export constant wrapper for deployment as a Firebase Function
export const capturePayPalOrder = async (request: Request, response: Response) => {
  console.log('API: capture-paypal-order route hit.');

  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }

  let reqBody;
  try {
    reqBody = request.body;
  } catch (e) {
    response.status(400).json({error: 'Invalid JSON body'});
    return;
  }

  // --- REST OF THE FUNCTION (UNCHANGED LOGIC) ---
  const {orderID, userId, amount, depositType, itemId} = reqBody;

  if (!orderID || !userId || !amount) {
    console.error('API: Missing required fields for PayPal order capture:', {orderID, userId, amount});
    response.status(400).json({error: 'Missing required fields for capture'});
    return;
  }

  if (depositType === 'item-purchase' && !itemId) {
    console.error('API: Missing \'itemId\' for an \'item-purchase\' depositType.');
    response.status(400).json({error: 'Missing itemId for item purchase'});
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error('API: Invalid amount received for capture:', amount);
    response.status(400).json({error: 'Invalid amount provided for capture'});
    return;
  }

  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
  const PAYPAL_API_BASE_URL = process.env.PAYPAL_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

  try {
    const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    // 1. Get Access Token
    const tokenResponse = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('API: PayPal access token error during capture:', tokenError);
      throw new Error(`Failed to get PayPal access token for capture: ${tokenError}`);
    }
    const {access_token: accessToken} = await tokenResponse.json();

    // 2. Capture the Order
    const captureResponse = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!captureResponse.ok) {
      const errorBody = await captureResponse.text();
      console.error('API: PayPal order capture failed:', errorBody);
      throw new Error(`Failed to capture PayPal order: ${errorBody}`);
    }

    const captureResult = await captureResponse.json();

    if (captureResult.status === 'COMPLETED') {
      // 3. Update Firestore
      await db.runTransaction(async (t) => {
        const transactionRefId = `paypal_${orderID}`;
        const transactionRef = db.collection('Transactions').doc(transactionRefId);

        const isItemPurchase = depositType === 'item-purchase' && itemId;

        t.set(transactionRef, {
          transactionId: transactionRefId,
          userId: userId,
          amount: parsedAmount,
          currency: captureResult.purchase_units[0].payments.captures[0].amount.currency_code,
          transactionType: depositType || 'deposit',
          status: isItemPurchase ? 'completed' : 'pending',
          timestamp: FieldValue.serverTimestamp(),
          paypalOrderId: orderID,
          paymentMethod: 'PayPal',
          paypalCaptureId: captureResult.purchase_units[0].payments.captures[0].id,
          itemId: itemId || null,
        }, {merge: true});

        // Grant item if it was a direct purchase
        if (isItemPurchase) {
          const playerRef = db.collection('Players').doc(userId);
          const newItemInstanceRef = playerRef.collection('InventoryItems').doc();

          const newInventoryItem = {
            itemId: itemId,
            acquiredAt: FieldValue.serverTimestamp(),
          };

          t.set(newItemInstanceRef, newInventoryItem);
        }
      });

      const message = (depositType === 'item-purchase' && itemId) ?
        'Payment successful! Your item has been added to your inventory.' :
        'Payment captured and awaiting admin approval.';

      response.status(200).json({success: true, message: message});
    } else {
      console.error('API: PayPal order not completed after capture:', captureResult);
      response.status(400).json({success: false, error: 'PayPal payment not completed'});
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API: Capture PayPal order API route caught error:', errorMessage);
    response.status(500).json({success: false, error: errorMessage || 'Error capturing PayPal order'});
  }
};
