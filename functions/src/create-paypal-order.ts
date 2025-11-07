// functions/src/create-paypal-order.ts

import {Buffer} from 'buffer';
import {Request} from 'firebase-functions/v2/https';
import {Response} from 'express';

// Note: These should be configured as Firebase Environment Variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE_URL = process.env.PAYPAL_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
const APP_URL = process.env.VITE_APP_URL || 'https://swytchpet.io';

// Use an export constant wrapper for deployment as a Firebase Function
export const createPayPalOrder = async (request: Request, response: Response) => {
  console.log('API: createPayPalOrder route hit.');

  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }

  let reqBody;
  try {
    reqBody = request.body;
  } catch (e) {
    response.status(400).json({error: 'Invalid JSON body'});
    return;
  }

  const {amount, currency, userId, depositType} = reqBody;

  if (!amount || !currency || !userId || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error('API: Missing required fields or environment variables.');
    response.status(400).json({error: 'Missing required fields or server configuration'});
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error('API: Invalid amount received:', amount);
    response.status(400).json({error: 'Invalid amount provided'});
    return;
  }

  try {
    const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    // 1. Fetch PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('API: PayPal access token error:', tokenError);
      throw new Error(`Failed to get PayPal access token: ${tokenError}`);
    }

    // --- LINT FIX 1: Destructure and rename access_token to accessToken ---
    const {access_token: accessToken} = await tokenResponse.json();
    if (!accessToken) {
      throw new Error('PayPal access token missing in response');
    }

    // 2. Create the PayPal Order
    const paypalResponse = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // --- LINT FIX 2: Use the camelCase variable ---
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: parsedAmount.toFixed(2),
            },
            description: depositType === 'membership' ? 'Swytch PET Membership' : 'Swytch PET Funds',
            reference_id: `${depositType}_${userId}_${Date.now()}`,
          },
        ],
        application_context: {
          return_url: `${APP_URL}/vault`,
          cancel_url: `${APP_URL}/vault`,
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    });

    if (!paypalResponse.ok) {
      const errorBody = await paypalResponse.text();
      console.error('API: PayPal API Error Response Body:', errorBody);
      throw new Error(`PayPal API Error: ${errorBody}`);
    }

    const order = await paypalResponse.json();
    if (!order.id) {
      console.error('API: PayPal order response missing ID:', order);
      throw new Error('Invalid order response from PayPal: Missing ID');
    }

    // 3. Success: Send Order ID back to client
    response.status(200).json({id: order.id});
  } catch (error: unknown) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    console.error('API: Create PayPal order API route caught error:', errorMessage);
    response.status(500).json({error: errorMessage || 'Error creating PayPal order'});
  }
};
