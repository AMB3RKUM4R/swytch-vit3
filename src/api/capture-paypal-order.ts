// src/api/capture-paypal-order.ts
import { Buffer } from "buffer";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === "app/duplicate-app") {
        console.warn("Firebase Admin SDK already initialized. Proceeding.");
      } else {
        console.error("Firebase Admin initialization failed:", error);
        throw new Error("Firebase Admin initialization failed: " + error.message);
      }
    }
  }
}

initializeFirebaseAdmin();

const db = getFirestore();

export default async function handler(request: Request): Promise<Response> {
  console.log("API: capture-paypal-order route hit.");

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const reqBody = await request.json();
  const { orderID, userId, amount, depositType } = reqBody;

  if (!orderID || !userId || !amount) {
    console.error("API: Missing required fields for PayPal order capture:", { orderID, userId, amount });
    return new Response(JSON.stringify({ error: "Missing required fields for capture" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error("API: Invalid amount received for capture:", amount);
    return new Response(JSON.stringify({ error: "Invalid amount provided for capture" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
  const PAYPAL_API_BASE_URL = process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

  try {
    const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const tokenResponse = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authString}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("API: PayPal access token error during capture:", tokenError);
      throw new Error(`Failed to get PayPal access token for capture: ${tokenError}`);
    }
    const { access_token } = await tokenResponse.json();

    const captureResponse = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
    });

    if (!captureResponse.ok) {
      const errorBody = await captureResponse.text();
      console.error("API: PayPal order capture failed:", errorBody);
      throw new Error(`Failed to capture PayPal order: ${errorBody}`);
    }

    const captureResult = await captureResponse.json();

    if (captureResult.status === "COMPLETED") {
      const transactionRefId = `paypal_${orderID}`;
      await db.collection("Transactions").doc(transactionRefId).set({
        transactionId: transactionRefId,
        userId: userId,
        amount: parsedAmount,
        currency: captureResult.purchase_units[0].payments.captures[0].amount.currency_code,
        transactionType: depositType || "deposit",
        status: "pending",
        timestamp: FieldValue.serverTimestamp(),
        paypalOrderId: orderID,
        paymentMethod: "PayPal",
        paypalCaptureId: captureResult.purchase_units[0].payments.captures[0].id,
      }, { merge: true });

      return new Response(JSON.stringify({ success: true, message: "Payment captured and awaiting admin approval." }), { status: 200, headers: { "Content-Type": "application/json" } });
    } else {
      console.error("API: PayPal order not completed after capture:", captureResult);
      return new Response(JSON.stringify({ success: false, error: "PayPal payment not completed" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API: Capture PayPal order API route caught error:", errorMessage);
    return new Response(JSON.stringify({ success: false, error: errorMessage || "Error capturing PayPal order" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}