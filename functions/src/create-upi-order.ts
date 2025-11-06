// functions/src/create-upi-order.ts
import { Buffer } from "buffer";
import fetch from "node-fetch"; // Requires @types/node-fetch
import { Request } from "firebase-functions/v2/https"; // <-- THE FIX
import type { Response } from "express"; // <-- THE FIX

export const createUpiOrderHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
  const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("API: Razorpay Key ID or Secret is not set on the server.");
    response.status(500).json({ error: "Server payment configuration error." });
    return;
  }
  // (Rest of the function is identical)
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { amount, currency, userId, depositType, itemId } = request.body;

    if (!amount || !currency || !userId) {
      response.status(400).json({ error: "Missing required fields (amount, currency, userId)" });
      return;
    }

    const parsedAmount = parseFloat(amount);
    const amountInPaise = Math.round(parsedAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        depositType: depositType || "deposit",
        itemId: itemId || "none",
      },
    };

    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    
    const razorpayResponse = await (fetch as any)("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(options),
    });

    if (!razorpayResponse.ok) {
      const errorBody = await razorpayResponse.text();
      console.error("API: Razorpay order creation failed:", errorBody);
      throw new Error(`Razorpay API Error: ${errorBody}`);
    }

    const order = await razorpayResponse.json() as any;

    response.status(200).json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API: Create Razorpay order failed:", errorMessage);
    response.status(500).json({ error: errorMessage });
  }
};