// functions/src/index.ts
import {initializeApp} from 'firebase-admin/app';
import {https} from 'firebase-functions/v2';

// Initialize Firebase Admin SDK
initializeApp();

// === GAME & LOOT FUNCTIONS ===
import {grantLootOnKillHandler} from './grantLootOnKill';
import {redeemWebTokenHandler} from './redeemWebToken';
import {generateWebSessionHandler} from './generateWebSession';
import {grantGameRewardHandler} from './grantGameReward';
import {grantUserRewardHandler} from './grantUserReward';

// === WALLET & AUTH FUNCTIONS ===
import {createCustomTokenHandler} from './createCustomToken';
import {redeemJoulesHandler} from './redeemJoules';


import {createUpiPaymentWebhook} from './create-upi-payment';

// === ADMIN FUNCTIONS ===

// === PAYMENT: RAZORPAY / UPI (Frontend API) ===
import {createUpiOrder} from './create-upi-order';

// ────────────────────────────────────────────────────────────────
// EXPORT HTTPS ENDPOINTS
// ────────────────────────────────────────────────────────────────

// ── Game & Loot ─────────────────────────────────────────────────
export const grantLootOnKill = https.onRequest(grantLootOnKillHandler);
export const redeemWebToken = https.onRequest(redeemWebTokenHandler);
export const generateWebSession = https.onRequest(generateWebSessionHandler);
export const grantGameReward = https.onRequest(grantGameRewardHandler);
export const grantUserReward = https.onRequest(grantUserRewardHandler);

// ── Wallet & Auth ───────────────────────────────────────────────
export const createCustomToken = https.onRequest(createCustomTokenHandler);
export const redeemJoules = https.onRequest(redeemJoulesHandler);

// ── Webhooks (No Auth, Public POST) ─────────────────────────────

export const razorpayWebhook = https.onRequest(createUpiPaymentWebhook);

// ── Admin Tools (Requires Authentication Check) ─────────────────
// FIX: Explicit wrapper to force return type to Promise<void>


// ── Razorpay / UPI API (Called by Frontend) ─────────────────────
export const createUpiOrderApi = https.onRequest(createUpiOrder);

// ── Withdrawal API (Called by Frontend) ─────────────────────
// FIX: Apply the wrapper to resolve TypeScript error 2345

