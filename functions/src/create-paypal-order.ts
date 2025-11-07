// functions/src/create-paypal-order.ts
import {Buffer} from 'buffer';
import type {Request, Response} from 'express';
import * as cors from 'cors';
import * as functions from 'firebase-functions';

const corsHandler = cors({
  origin: 'https://www.swytchpet.io',
  methods: ['POST'],
  credentials: true,
});

interface CreateOrderBody {
  amount: number;
  currency?: string;
  userId: string;
  depositType?: string;
}

export const createPayPalOrder = async (request: Request, response: Response) => {
  corsHandler(request, response, async () => {
    console.log('API: createPayPalOrder (LIVE) hit.');

    if (request.method !== 'POST') {
      return response.status(405).json({error: 'Method Not Allowed'});
    }

    let body: CreateOrderBody;
    try {
      body = request.body;
    } catch {
      return response.status(400).json({error: 'Invalid JSON'});
    }

    const {amount, currency = 'USD', userId, depositType} = body;

    if (!amount || amount <= 0 || amount > 999999.99) {
      return response.status(400).json({error: 'Invalid amount'});
    }
    if (!userId) {
      return response.status(400).json({error: 'userId required'});
    }

    const clientId = functions.config().paypal.client_id;
    const clientSecret = functions.config().paypal.client_secret;
    const isProd = process.env.PAYPAL_ENV === 'production';
    const baseUrl = isProd ?
      'https://api-m.paypal.com' :
      'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret) {
      console.error('PayPal credentials missing');
      return response.status(500).json({error: 'Server error'});
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'PayPal-Request-Id': `create-${userId}-${Date.now()}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description:
                depositType === 'item-purchase' ? 'SwytchPet Item Purchase' : 'SwytchPet Deposit',
            },
          ],
          application_context: {
            brand_name: 'SwytchPet',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: 'https://www.swytchpet.io/success',
            cancel_url: 'https://www.swytchpet.io/cancel',
          },
        }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        console.error('PayPal create failed:', order);
        return response.status(502).json({error: 'PayPal error', details: order});
      }

      return response.status(200).json({id: order.id});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown';
      console.error('createPayPalOrder error:', msg);
      return response.status(500).json({error: 'Internal error'});
    }
  });
};
