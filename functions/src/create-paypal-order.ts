// functions/src/create-paypal-order.ts

import {Buffer} from 'buffer';
import {Request} from 'firebase-functions/v2/https';
import {Response} from 'express';
import * as cors from 'cors'; // <-- NEW IMPORT

// Initialize CORS middleware
const corsHandler = cors({origin: true}); // origin: true allows all origins (easiest for development)
// For production, you would use: cors({ origin: 'https://www.swytchpet.io' })


// ... (rest of configuration and function setup) ...

// Use an export constant wrapper for deployment as a Firebase Function
export const createPayPalOrder = (request: Request, response: Response) => { // Removed 'async' from outer wrapper
  // 1. Wrap the core logic in the CORS handler
  corsHandler(request, response, async () => {
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

    // ... (rest of the code moved inside the async block) ...

    const {amount, currency, userId, depositType} = reqBody as {
            amount?: number;
            currency?: string;
            userId?: string;
            depositType?: string;
        };

    // Use the destructured values (at minimum log them) so they aren't reported as unused.
    console.log('createPayPalOrder payload:', {amount, currency, userId, depositType});

    // ... (validation and logic) ...

    try {
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
      const order = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency || 'USD',
              value: amount?.toString() || '0',
            },
          }],
        }),
      }).then((res) => res.json());

      // 3. Success: Send Order ID back to client
      // No need to use JSON.stringify here, response.json() handles it
      response.status(200).json({id: order.id});
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      console.error('API: Create PayPal order API route caught error:', errorMessage);
      response.status(500).json({error: errorMessage || 'Error creating PayPal order'});
    }
  }); // End of corsHandler wrapper
};
