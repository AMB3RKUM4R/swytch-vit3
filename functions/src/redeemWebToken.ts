// functions/src/redeemWebToken.ts

import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {Request} from 'firebase-functions/v2/https';
import type {Response} from 'express';

export const redeemWebTokenHandler = async (request: Request, response: Response) => {
  const db = getFirestore();
  const auth = getAuth();
  
  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  const {token} = request.body;

  if (!token || typeof token !== 'string') {
    response.status(400).json({error: 'Token is missing or invalid'});
    return;
  }

  try {
    const playersRef = db.collection('Players');
    const q = playersRef.where('session.webToken', '==', token).limit(1);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.error(`API: No player found with token: ${token}`);
      response.status(404).json({error: 'Invalid or expired token'});
      return;
    }

    const playerDoc = querySnapshot.docs[0];
    const userId = playerDoc.id;

    await db.runTransaction(async (t) => {
        // 1. Delete the token from the player document
        t.update(playerDoc.ref, {
            'session.webToken': FieldValue.delete(),
            'session.webTokenCreatedAt': FieldValue.delete(),
        });
    });

    // 2. Create the custom token outside the transaction
    const customToken = await auth.createCustomToken(userId);

    console.log(`API: Custom token created for user ${userId} via web redemption.`);
    response.status(200).json({token: customToken});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to redeem web token:`, errorMessage);
    response.status(500).json({error: 'Internal server error'});
  }
};