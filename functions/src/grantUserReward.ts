// functions/src/grantUserReward.ts

import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {Request} from 'firebase-functions/v2/https'; // <-- THE FIX
import type {Response} from 'express'; // <-- THE FIX

// (Firebase Admin Setup... no changes)

const db = getFirestore();
const auth = getAuth();
// ---

const AD_REWARDS: { [key: string]: { currency: string, amount: number } } = {
  'ad_reward_small': {currency: 'joules', amount: 100},
  'ad_reward_large': {currency: 'gold', amount: 5},
};

export const grantUserRewardHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  // (Rest of the function is identical)
  const authorization = request.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    response.status(401).json({error: 'Unauthorized'});
    return;
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error: any) {
    response.status(401).json({error: 'Invalid token'});
    return;
  }
  const userId = decodedToken.uid;

  const {rewardType} = request.body;

  if (!rewardType || !AD_REWARDS[rewardType]) {
    console.error(`API: Invalid rewardType ${rewardType} from user ${userId}`);
    response.status(400).json({error: 'Invalid reward type'});
    return;
  }

  const reward = AD_REWARDS[rewardType];
  const playerRef = db.collection('Players').doc(userId);

  try {
    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error('Player document not found');
      }

      t.update(playerRef, {
        [reward.currency]: FieldValue.increment(reward.amount),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const logRef = db.collection('Transactions').doc();
      t.set(logRef, {
        transactionId: logRef.id,
        userId: userId,
        amount: reward.amount,
        currency: reward.currency.toUpperCase(),
        transactionType: 'ad_reward',
        status: 'success',
        timestamp: FieldValue.serverTimestamp(),
        rewardType: rewardType,
      });
    });

    response.status(200).json({success: true, message: `Granted ${reward.amount} ${reward.currency}`});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to grant ad reward for user ${userId}:`, errorMessage);
    response.status(500).json({error: 'Internal server error'});
  }
};
