// functions/src/grantGameReward.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { Request } from "firebase-functions/v2/https"; // <-- THE FIX
import type { Response } from "express"; // <-- THE FIX

// (Firebase Admin Setup... no changes)
interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();
const auth = getAuth();
// ---

const GAME_REWARDS: { [key: string]: { baseJoules: number, baseXp: number } } = {
  "coin_collector_level_1": { baseJoules: 50, baseXp: 100 },
  "coin_collector_level_2": { baseJoules: 75, baseXp: 150 },
};

export const grantGameRewardHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  // (Rest of the function is identical)
  const authorization = request.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error: any) {
    response.status(401).json({ error: 'Invalid token' });
    return;
  }
  const userId = decodedToken.uid;

  const { gameId, playerJouleBonus } = request.body;

  if (!gameId || !GAME_REWARDS[gameId]) {
    console.error(`API: Invalid gameId ${gameId} from user ${userId}`);
    response.status(400).json({ error: 'Invalid game ID' });
    return;
  }

  const reward = GAME_REWARDS[gameId];
  const finalJoules = Math.ceil(reward.baseJoules * (1 + (playerJouleBonus || 0)));
  const finalXp = reward.baseXp;
  
  const playerRef = db.collection('Players').doc(userId);

  try {
    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error("Player document not found");
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
        currency: "JOULES",
        transactionType: "game_reward",
        status: "success",
        timestamp: FieldValue.serverTimestamp(),
        gameId: gameId,
      });
    });

    response.status(200).json({ success: true, joules: finalJoules, xp: finalXp });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to grant game reward for user ${userId}:`, errorMessage);
    response.status(500).json({ error: 'Internal server error' });
  }
};