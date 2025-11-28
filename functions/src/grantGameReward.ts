// functions/src/grantGameReward.ts

import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {Request} from 'firebase-functions/v2/https';
import type {Response} from 'express';

const GAME_REWARDS: { [key: string]: { baseJoules: number, baseXp: number } } = {
  'coin_collector_level_1': {baseJoules: 50, baseXp: 100},
  'coin_collector_level_2': {baseJoules: 75, baseXp: 150},
};

export const grantGameRewardHandler = async (request: Request, response: Response) => {
  const db = getFirestore();
  const auth = getAuth();
  
  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }
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

  const {gameId, playerJouleBonus = 0} = request.body;

  if (!gameId || !GAME_REWARDS[gameId]) {
    console.error(`API: Invalid gameId ${gameId} from user ${userId}`);
    response.status(400).json({error: 'Invalid game ID'});
    return;
  }

  const reward = GAME_REWARDS[gameId];
  const finalJoules = Math.ceil(reward.baseJoules * (1 + playerJouleBonus));
  const finalXp = reward.baseXp;

  const playerRef = db.collection('Players').doc(userId);

  try {
    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error('Player document not found');
      }

      t.update(playerRef, {
        joules: FieldValue.increment(finalJoules),
        xp: FieldValue.increment(finalXp),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const logRef = db.collection('Transactions').doc();
      t.set(logRef, {
        transactionId: logRef.id,
        userId: userId,
        amount: finalJoules,
        currency: 'JOULES',
        transactionType: 'game_reward',
        status: 'success',
        timestamp: FieldValue.serverTimestamp(),
        gameId: gameId,
      });
    });

    response.status(200).json({success: true, joules: finalJoules, xp: finalXp});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to grant game reward for user ${userId}:`, errorMessage);
    response.status(500).json({error: 'Internal server error'});
  }
};