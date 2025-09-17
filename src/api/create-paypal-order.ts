// src/api/create-paypal-order.ts
import { Buffer } from "buffer";

export default async function handler(request: Request): Promise<Response> {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  const PAYPAL_API_BASE_URL = process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const VITE_APP_URL = process.env.VITE_APP_URL || "https://swytchpet.io";

  console.log("API: create-paypal-order route hit.");

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const reqBody = await request.json();
  const { amount, currency, userId, depositType } = reqBody;

  console.log("API: Request body received:", { amount, currency, userId, depositType });

  if (!amount || !currency || !userId || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error("API: Missing required fields or environment variables.");
    return new Response(JSON.stringify({ error: "Missing required fields or server configuration" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error("API: Invalid amount received:", amount);
    return new Response(JSON.stringify({ error: "Invalid amount provided" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    console.log("API: Fetching PayPal access token...");
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
      console.error("API: PayPal access token error:", tokenError);
      throw new Error(`Failed to get PayPal access token: ${tokenError}`);
    }

    const { access_token } = await tokenResponse.json();
    if (!access_token) {
      throw new Error("PayPal access token missing in response");
    }
    console.log("API: PayPal access token fetched successfully.");

    console.log("API: Attempting to create PayPal order with amount:", parsedAmount.toFixed(2), "currency:", currency);
    const paypalResponse = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: parsedAmount.toFixed(2),
            },
            description: depositType === "membership" ? "Swytch PET Membership" : "Swytch PET Funds",
            reference_id: `${depositType}_${userId}_${Date.now()}`,
          },
        ],
        application_context: {
          return_url: `${VITE_APP_URL}/vault`,
          cancel_url: `${VITE_APP_URL}/vault`,
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });

    console.log("API: PayPal API Response Status:", paypalResponse.status);
    if (!paypalResponse.ok) {
      const errorBody = await paypalResponse.text();
      console.error("API: PayPal API Error Response Body:", errorBody);
      throw new Error(`PayPal API Error: ${errorBody}`);
    }

    const order = await paypalResponse.json();
    if (!order.id) {
      console.error("API: PayPal order response missing ID:", order);
      throw new Error("Invalid order response from PayPal: Missing ID");
    }

    console.log("API: PayPal order created successfully. Order ID:", order.id);
    return new Response(JSON.stringify({ id: order.id }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    console.error("API: Create PayPal order API route caught error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage || "Error creating PayPal order" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}