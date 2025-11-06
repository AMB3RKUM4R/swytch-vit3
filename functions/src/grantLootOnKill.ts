// functions/src/grantLootOnKill.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { InventoryItem } from '@/lib/types';
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

interface EnemyDefinition {
  id: string;
  baseJoules: number;
  baseXp: number;
  lootTable?: {
    itemId: string;
    dropChance: number;
  }[];
}

export const grantLootOnKillHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
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
  const { enemyId, enemyJouleBonus, arenaJouleBonus, playerJouleBonus } = request.body;

  if (!enemyId) {
    response.status(400).json({ error: 'Missing enemyId' });
    return;
  }

  try {
    const enemyDefRef = db.collection('EnemyDefinitions').doc(enemyId);
    const enemyDefSnap = await enemyDefRef.get();

    if (!enemyDefSnap.exists) {
      console.error(`API: Invalid enemyId ${enemyId} from user ${userId}`);
      response.status(400).json({ error: 'Invalid enemy' });
      return;
    }
    
    const enemyDef = enemyDefSnap.data() as EnemyDefinition;
    const playerRef = db.collection('Players').doc(userId);

    const totalJouleBonus = (enemyJouleBonus || 0) + (arenaJouleBonus || 0) + (playerJouleBonus || 0);
    const finalJoules = Math.ceil(enemyDef.baseJoules * (1 + totalJouleBonus));
    const finalXp = enemyDef.baseXp;
    
    const updates: { [key: string]: any } = {
      joules: FieldValue.increment(finalJoules),
      xp: FieldValue.increment(finalXp),
      updatedAt: FieldValue.serverTimestamp(),
    };

    let grantedItemId: string | null = null;
    if (enemyDef.lootTable) {
      for (const item of enemyDef.lootTable) {
        if (Math.random() <= item.dropChance) {
          grantedItemId = item.itemId;
          const newItemId = `item_${Date.now()}`;
          const newInventoryItem: InventoryItem = {
            itemId: grantedItemId,
            acquiredAt: FieldValue.serverTimestamp() as any,
            isListed: false,
          };
          updates[`inventory.items.${newItemId}`] = newInventoryItem;
          break;
        }
      }
    }

    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error("Player document not found");
      }
      
      t.update(playerRef, updates);

      const logRef = db.collection('Transactions').doc();
      t.set(logRef, {
        transactionId: logRef.id,
        userId: userId,
        amount: finalJoules,
        currency: "JOULES",
        transactionType: "loot_drop",
        status: "success",
        timestamp: FieldValue.serverTimestamp(),
        enemyId: enemyId,
        grantedItemId: grantedItemId,
      });
    });

    response.status(200).json({ success: true, joules: finalJoules, xp: finalXp, item: grantedItemId });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to grant loot for user ${userId}:`, errorMessage);
    response.status(500).json({ error: 'Internal server error' });
  }
};