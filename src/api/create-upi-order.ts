import { Buffer } from "buffer";

// This mirrors your create-paypal-order.ts [cite: create-paypal-order.ts]
// It uses your VITE_RAZORPAY_KEY_ID from your .env file [cite: .env]

export default async function handler(request: Request): Promise<Response> {
  // 1. Get Keys. The KEY_ID is public, the SECRET must be on your server.
  const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET; // CRITICAL: This MUST be set in your server's environment variables

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("API: Razorpay Key ID or Secret is not set on the server.");
    return new Response(JSON.stringify({ error: "Server payment configuration error." }), { status: 500 });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  try {
    const reqBody = await request.json();
    const { amount, currency, userId, depositType, itemId } = reqBody;

    if (!amount || !currency || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields (amount, currency, userId)" }), { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    // Razorpay requires the amount in the smallest currency unit (e.g., paise for INR)
    // We multiply by 100.
    const amountInPaise = Math.round(parsedAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency, // e.g., "INR"
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        depositType: depositType || "deposit",
        itemId: itemId || "none",
      },
    };

    // 2. Create the order with Razorpay
    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
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

    const order = await razorpayResponse.json();

    // 3. Send the order_id back to the frontend
    // The frontend will use this to open the Razorpay payment modal.
    return new Response(JSON.stringify({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency
    }), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API: Create Razorpay order failed:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
