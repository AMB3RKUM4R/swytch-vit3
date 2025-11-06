// functions/src/handle-deposit-webhook.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { PlayerData, MEMBERSHIP_TIERS } from '@/lib/types';
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
// ---

interface WebhookPayload {
  event: {
    data: {
      user: string;
      tier: string;
      amountInUSD: string;
      sharesMinted: string;
    };
    transaction: {
      hash: string;
    };
  };
}

export const handleDepositWebhookHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  // (Rest of the function is identical)
  const body = request.body as WebhookPayload;

  try {
    const eventData = body.event.data;
    const txHash = body.event.transaction.hash;
    const userWalletAddress = eventData.user.toLowerCase();
    const tier = parseInt(eventData.tier, 10);
    const amountUSD = parseFloat(eventData.amountInUSD) / 1e18;

    console.log(`Processing deposit for user: ${userWalletAddress}, tier: ${tier}`);

    const playersRef = db.collection("Players");
    const playerQuery = await playersRef.where("walletAddress", "==", userWalletAddress).limit(1).get();

    if (playerQuery.empty) {
      console.error(`No player found with wallet address: ${userWalletAddress}`);
      response.status(200).json({ success: false, error: "Player not found" });
      return;
    }

    const playerDoc = playerQuery.docs[0];
    const playerId = playerDoc.id;
    const playerData = playerDoc.data() as PlayerData;

    await db.runTransaction(async (t) => {
      const playerRef = db.collection("Players").doc(playerId);
      
      const updates: { [key: string]: any } = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (tier === 1 && !playerData.isPETMember) {
          updates.isPETMember = true;
          updates.membership = "ecosystem";
          updates.level = MEMBERSHIP_TIERS.ecosystem.level;
      } else if (tier === 2) {
          updates.isPETMember = true;
          updates.membership = "gamers";
          updates.level = MEMBERSHIP_TIERS.gamers.level;
      } else if (tier === 3) {
          updates.isPETMember = true;
          updates.membership = "gold";
          updates.level = MEMBERSHIP_TIERS.gold.level;
      }
      
      t.update(playerRef, updates);

      const transactionRef = db.collection("Transactions").doc(`eth_${txHash}`);
      t.set(transactionRef, {
        transactionId: `eth_${txHash}`,
        userId: playerId,
        amount: amountUSD,
        currency: "USD",
        transactionType: "deposit",
        status: "success",
        timestamp: FieldValue.serverTimestamp(),
        paymentGatewayId: "blockchain",
        smartContractAddress: process.env.DEPOSITORY_CONTRACT_ADDRESS,
        transactionHash: txHash,
        itemId: `tier_${tier}`,
      });
    });

    console.log(`Successfully processed deposit for user: ${playerId}`);
    response.status(200).json({ success: true });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process webhook: ${errorMessage}`);
    response.status(500).json({ success: false, error: errorMessage });
  }
};