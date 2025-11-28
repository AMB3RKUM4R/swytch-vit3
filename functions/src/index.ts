// functions/src/index.ts
import {initializeApp} from 'firebase-admin/app';
import {https} from 'firebase-functions/v2';

// Initialize Firebase Admin
initializeApp();

// Import Handlers
import {grantLootOnKillHandler} from './grantLootOnKill';
import {redeemWebTokenHandler} from './redeemWebToken';
import {generateWebSessionHandler} from './generateWebSession';
import {grantGameRewardHandler} from './grantGameReward';
import {grantUserRewardHandler} from './grantUserReward';
import {createCustomTokenHandler} from './createCustomToken';
import {redeemJoulesHandler} from './redeemJoules';
import {createUpiPaymentWebhook} from './create-upi-payment';
import {createUpiOrder} from './create-upi-order';

// Export Functions
export const grantLootOnKill = https.onRequest(grantLootOnKillHandler);
export const redeemWebToken = https.onRequest(redeemWebTokenHandler);
export const generateWebSession = https.onRequest(generateWebSessionHandler);
export const grantGameReward = https.onRequest(grantGameRewardHandler);
export const grantUserReward = https.onRequest(grantUserRewardHandler);
export const createCustomToken = https.onRequest(createCustomTokenHandler);
export const redeemJoules = https.onRequest(redeemJoulesHandler);
export const razorpayWebhook = https.onRequest(createUpiPaymentWebhook);
export const createUpiOrderApi = https.onRequest(createUpiOrder);