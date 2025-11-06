// functions/src/index.ts
import {initializeApp} from 'firebase-admin/app'; // <-- ADD THIS
import {onRequest} from 'firebase-functions/v2/https';
import {setGlobalOptions} from 'firebase-functions/v2';

// --- THIS IS THE FIX ---
// Initialize the Admin SDK *once* here.
// When deployed, Firebase automatically provides the correct credentials.
initializeApp();
// --- END OF FIX ---

setGlobalOptions({region: 'us-central1'});

// Import all handlers
import {grantGameRewardHandler} from './grantGameReward';
import {grantLootOnKillHandler} from './grantLootOnKill';
import {grantUserRewardHandler} from './grantUserReward';
import {redeemJoulesHandler} from './redeemJoules';
import {generateWebSessionHandler} from './generateWebSession';
import {redeemWebTokenHandler} from './redeemWebToken';
import {createCustomTokenHandler} from './createCustomToken';
import {createUpiOrderHandler} from './create-upi-order';
import {createUpiPaymentHandler} from './create-upi-payment';
import {handleDepositWebhookHandler} from './handle-deposit-webhook';

// Export all functions
export const grantGameReward = onRequest(grantGameRewardHandler);
export const grantLootOnKill = onRequest(grantLootOnKillHandler);
export const grantUserReward = onRequest(grantUserRewardHandler);
export const redeemJoules = onRequest(redeemJoulesHandler);
export const handleDepositWebhook = onRequest(handleDepositWebhookHandler);
export const generateWebSession = onRequest(generateWebSessionHandler);
export const redeemWebToken = onRequest(redeemWebTokenHandler);
export const createCustomToken = onRequest(createCustomTokenHandler);
export const createUpiOrder = onRequest(createUpiOrderHandler);
export const createUpiPayment = onRequest(createUpiPaymentHandler);
