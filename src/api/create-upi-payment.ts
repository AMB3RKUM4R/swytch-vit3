import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { PlayerData, MEMBERSHIP_TIERS } from "@/lib/types"; // Make sure types are accessible

// This logic is copied directly from your capture-paypal-order.ts [cite: capture-paypal-order.ts]
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
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(request: Request): Promise<Response> {
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET; // Recommended: Set up a webhook secret for signature verification

  if (!RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET) {
     console.error("API: Razorpay secrets are not set on the server.");
     return new Response(JSON.stringify({ error: "Server payment configuration error." }), { status: 500 });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  const reqBodyText = await request.text();
  const reqBody = JSON.parse(reqBodyText);

  // 1. Verify the webhook signature (CRITICAL FOR SECURITY)
  // This ensures the request is *actually* from Razorpay and not a hacker.
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Signature missing" }), { status: 400 });
  }

  const shasum = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET);
  shasum.update(reqBodyText);
  const digest = shasum.digest("hex");

  if (digest !== signature) {
    console.warn("API: Invalid Razorpay signature received.");
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  // 2. Process the payment event
  const { event, payload } = reqBody;

  if (event === "payment.captured") {
    const payment = payload.payment.entity;
    // const orderId = payment.order_id; // <-- FIX: Removed unused variable
    const paymentId = payment.id;
    const notes = payment.notes;
    const userId = notes.userId;
    const depositType = notes.depositType;
    const itemId = notes.itemId;
    const amountInPaise = payment.amount;
    const currency = payment.currency; // e.g., "INR"
    const amount = amountInPaise / 100;

    if (!userId) {
      console.error("API: 'userId' not found in Razorpay payment notes.");
      return new Response(JSON.stringify({ success: false, error: "User ID missing" }), { status: 200 }); // Return 200 so Razorpay doesn't retry
    }
    
    // 3. Update Firestore (Copied from capture-paypal-order.ts [cite: capture-paypal-order.ts])
    try {
      await db.runTransaction(async (t) => {
        const transactionRefId = `razorpay_${paymentId}`;
        const transactionRef = db.collection("Transactions").doc(transactionRefId);

        const isItemPurchase = depositType === 'item-purchase' && itemId;
        const isMembership = depositType === 'membership';

        // Log the transaction
        t.set(transactionRef, {
          transactionId: transactionRefId,
          userId: userId,
          amount: amount,
          currency: currency,
          transactionType: depositType || "deposit",
          status: "success", // Razorpay only sends webhook on capture
          timestamp: FieldValue.serverTimestamp(),
          paymentGatewayId: paymentId,
          paymentMethod: "Razorpay/UPI",
          itemId: itemId || null,
        }, { merge: true });

        // Grant the item/membership
        const playerRef = db.collection("Players").doc(userId);
        const playerData = (await t.get(playerRef)).data() as PlayerData;

        // FIX: Changed from Partial<PlayerData> to { [key: string]: any }
        // This allows us to use FieldValue.increment()
        const updates: { [key: string]: any } = {
          updatedAt: FieldValue.serverTimestamp(),
        };

        if (isItemPurchase) {
          // This logic is from capture-paypal-order.ts [cite: capture-paypal-order.ts]
          const newItemInstanceRef = playerRef.collection("InventoryItems").doc(); 
          t.set(newItemInstanceRef, {
            itemId: itemId,
            acquiredAt: FieldValue.serverTimestamp(),
          });
        }
        
        if (isMembership && (!playerData || !playerData.isPETMember)) {
            // Find the tier they purchased (e.g., from 'itemId')
            const tierKey = itemId as keyof typeof MEMBERSHIP_TIERS;
            if (tierKey && MEMBERSHIP_TIERS[tierKey]) {
                updates.isPETMember = true;
                updates.membership = tierKey;
                updates.level = MEMBERSHIP_TIERS[tierKey].level;
            }
        }
        
        // Add purchased JOULES (if it was a deposit)
        if (depositType === 'deposit') {
            // Example: 1 INR = 10 JOULES
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
      return new Response(JSON.stringify({ success: false, error: "Database update failed" }), { status: 500 });
    }
  }

  // Acknowledge the webhook
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

