// src/api/handle-deposit-webhook.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { PlayerData, MEMBERSHIP_TIERS } from "@/lib/types"; // Assuming types are accessible

// Initialize Firebase Admin (copy from your other API files [cite: capture-paypal-order.ts])
interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized.");
}

const db = getFirestore();

// --- THIS IS A MOCKED PAYLOAD ---
// Replace this with the *actual* payload structure from your provider (e.g., Alchemy)
// You can get this by logging the first webhook request.
interface WebhookPayload {
  // ... (Webhook provider's wrapper)
  event: {
    data: {
      // These are the parameters from our 'DepositMade' event
      user: string; // "0x..."
      tier: string; // e.g., "1" (as a string)
      amountInUSD: string; // e.g., "10000000000000000000" (as a string)
      sharesMinted: string; // (as a string)
    };
    transaction: {
      hash: string; // "0x..."
    };
  };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  // TODO: Add Webhook Signature Verification here for security
  // This is CRITICAL to ensure the request is from your Node Provider
  // const signature = request.headers.get("X-Alchemy-Signature");
  // if (!isValidSignature(signature, request.body)) {
  //   return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  // }

  const body = (await request.json()) as WebhookPayload;

  // --- Extract data from the webhook ---
  // Note: This path will change based on your provider's payload structure
  const eventData = body.event.data;
  const txHash = body.event.transaction.hash;
  const userWalletAddress = eventData.user.toLowerCase(); // Normalize address
  const tier = parseInt(eventData.tier, 10);
  const amountUSD = parseFloat(eventData.amountInUSD) / 1e18; // Assuming 18 decimals

  console.log(`Processing deposit for user: ${userWalletAddress}, tier: ${tier}`);

  try {
    // 1. Find the player in Firestore by their wallet address
    const playersRef = db.collection("Players");
    const playerQuery = await playersRef.where("walletAddress", "==", userWalletAddress).limit(1).get();

    if (playerQuery.empty) {
      console.error(`No player found with wallet address: ${userWalletAddress}`);
      // Return 200 so the webhook doesn't retry. This is a business logic error.
      return new Response(JSON.stringify({ success: false, error: "Player not found" }), { status: 200 });
    }

    const playerDoc = playerQuery.docs[0];
    const playerId = playerDoc.id;
    const playerData = playerDoc.data() as PlayerData;

    // 2. Run a Firestore transaction to update player and log transaction
    await db.runTransaction(async (t) => {
      const playerRef = db.collection("Players").doc(playerId);
      
      // --- This is your custom game logic ---
      // Here, we grant benefits based on the tier deposited into.
      const updates: Partial<PlayerData> = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (tier === 1 && !playerData.isPETMember) { // Tier 1 = Ecosystem Explorer
          updates.isPETMember = true;
          updates.membership = "ecosystem";
          updates.level = MEMBERSHIP_TIERS.ecosystem.level;
      } else if (tier === 2) { // Tier 2 = Gamer Elite
          updates.isPETMember = true;
          updates.membership = "gamers";
          updates.level = MEMBERSHIP_TIERS.gamers.level;
      } else if (tier === 3) { // Tier 3 = Gold Sovereign
          updates.isPETMember = true;
          updates.membership = "gold";
          updates.level = MEMBERSHIP_TIERS.gold.level;
      }
      // --- End of custom logic ---
      
      t.update(playerRef, updates);

      // 3. Log the transaction (just like in capture-paypal-order.ts)
      const transactionRef = db.collection("Transactions").doc(`eth_${txHash}`);
      t.set(transactionRef, {
        transactionId: `eth_${txHash}`,
        userId: playerId,
        amount: amountUSD, // Log the USD value
        currency: "USD", // Or "ETH" if you log the ETH amount
        transactionType: "deposit",
        status: "success",
        timestamp: FieldValue.serverTimestamp(),
        paymentGatewayId: "blockchain",
        smartContractAddress: process.env.DEPOSITORY_CONTRACT_ADDRESS, // Add your address to env
        transactionHash: txHash,
        itemId: `tier_${tier}`,
      });
    });

    console.log(`Successfully processed deposit for user: ${playerId}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process webhook: ${errorMessage}`);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), { status: 500 });
  }
}
