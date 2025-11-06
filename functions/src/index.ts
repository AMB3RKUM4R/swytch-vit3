// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "us-central1" });

// Import all handlers
import { grantGameRewardHandler } from "./grantGameReward";
import { grantLootOnKillHandler } from "./grantLootOnKill";
import { grantUserRewardHandler } from "./grantUserReward";
import { redeemJoulesHandler } from "./redeemJoules";
import { generateWebSessionHandler } from "./generateWebSession";
import { redeemWebTokenHandler } from "./redeemWebToken";
import { createCustomTokenHandler } from "./createCustomToken";
import { createUpiOrderHandler } from "./create-upi-order";
import { createUpiPaymentHandler } from "./create-upi-payment";
import { handleDepositWebhookHandler } from "./handle-deposit-webhook";

// Export all functions
export const grantGameReward = onRequest(grantGameRewardHandler as any);
export const grantLootOnKill = onRequest(grantLootOnKillHandler as any);
export const grantUserReward = onRequest(grantUserRewardHandler as any);
export const redeemJoules = onRequest(redeemJoulesHandler as any);
export const handleDepositWebhook = onRequest(handleDepositWebhookHandler as any);
export const generateWebSession = onRequest(generateWebSessionHandler as any);
export const redeemWebToken = onRequest(redeemWebTokenHandler as any);
export const createCustomToken = onRequest(createCustomTokenHandler as any);
export const createUpiOrder = onRequest(createUpiOrderHandler as any);
export const createUpiPayment = onRequest(createUpiPaymentHandler as any);