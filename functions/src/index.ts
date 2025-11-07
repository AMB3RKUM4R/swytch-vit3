// functions/src/index.ts
import {initializeApp} from 'firebase-admin/app';
import {https} from 'firebase-functions/v2';

// Initialize the Firebase Admin SDK
initializeApp();

// --- Import all your function handlers ---
import {grantLootOnKillHandler} from './grantLootOnKill';
import {redeemWebTokenHandler} from './redeemWebToken';
import {createCustomTokenHandler} from './createCustomToken';
import {generateWebSessionHandler} from './generateWebSession';
import {redeemJoulesHandler} from './redeemJoules';
import {grantGameRewardHandler} from './grantGameReward';
import {grantUserRewardHandler} from './grantUserReward';
import {handleDepositWebhookHandler} from './handle-deposit-webhook';

// --- Import Payment Handlers ---
import {createPayPalOrder} from './create-paypal-order';
import {capturePayPalOrder} from './capture-paypal-order';
import {createUpiOrder} from './create-upi-order';
import {createUpiPaymentWebhook} from './create-upi-payment';
// ---

// --- Export them as callable HTTPS functions ---

// Game/Loot functions
export const grantLootOnKill = https.onRequest(grantLootOnKillHandler);
export const redeemWebToken = https.onRequest(redeemWebTokenHandler);
export const generateWebSession = https.onRequest(generateWebSessionHandler);
export const grantGameReward = https.onRequest(grantGameRewardHandler);
export const grantUserReward = https.onRequest(grantUserRewardHandler);

// Wallet/Auth functions
export const createCustomToken = https.onRequest(createCustomTokenHandler);
export const redeemJoules = https.onRequest(redeemJoulesHandler);

// Webhook functions
export const handleDepositWebhook = https.onRequest(handleDepositWebhookHandler);
export const razorpayWebhook = https.onRequest(createUpiPaymentWebhook);

// PayPal API functions (called by frontend)
export const createPayPalOrderApi = https.onRequest(createPayPalOrder);
export const capturePayPalOrderApi = https.onRequest(capturePayPalOrder);

// Razorpay API functions (called by frontend)
export const createUpiOrderApi = https.onRequest(createUpiOrder);
