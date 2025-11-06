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

// --- Export them as callable HTTPS functions ---

// This name 'grantLootOnKill' is what your Unity EnemyController.cs calls
export const grantLootOnKill = https.onRequest(grantLootOnKillHandler);

// This name 'redeemWebToken' is what your Unity AuthManager.cs calls
export const redeemWebToken = https.onRequest(redeemWebTokenHandler);

// This name 'generateWebSession' is what your web app calls
export const generateWebSession = https.onRequest(generateWebSessionHandler);

// This name 'grantGameReward' is what your HyperCasual_CoinCollector.cs calls
export const grantGameReward = https.onRequest(grantGameRewardHandler);

// This name 'grantUserReward' is what your AdManager.cs calls
export const grantUserReward = https.onRequest(grantUserRewardHandler);

// These are your other web app functions
export const createCustomToken = https.onRequest(createCustomTokenHandler);
export const redeemJoules = https.onRequest(redeemJoulesHandler);
export const handleDepositWebhook = https.onRequest(handleDepositWebhookHandler);
