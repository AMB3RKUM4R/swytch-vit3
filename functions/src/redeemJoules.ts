// functions/src/redeemJoules.ts

import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {ethers} from 'ethers';
import type {PlayerData} from './lib/types';
import {Request} from 'firebase-functions/v2/https';
import type {Response} from 'express';

const USDC_CONTRACT_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const JOULES_TO_USDC_RATE = 1000;
const USDC_ABI = ['function transfer(address to, uint256 amount) returns (bool)'];

export const redeemJoulesHandler = async (request: Request, response: Response) => {
  const db = getFirestore();
  const auth = getAuth();
  
  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  
  const authorization = request.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    response.status(401).json({error: 'Unauthorized'});
    return;
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error: any) {
    response.status(401).json({error: 'Invalid token'});
    return;
  }
  const userId = decodedToken.uid;

  const {amount, targetAddress} = request.body;
  const joulesToRedeem = parseInt(amount, 10);

  if (!joulesToRedeem || joulesToRedeem <= 0) {
    response.status(400).json({error: 'Invalid amount'});
    return;
  }
  if (!targetAddress || !ethers.isAddress(targetAddress)) {
      response.status(400).json({error: 'Invalid target crypto address'});
      return;
  }

  const playerRef = db.collection('Players').doc(userId);
  const logRef = db.collection('Transactions').doc();

  const playerWalletAddress = targetAddress;
  const transactionId = logRef.id;
  let stablecoinAmount = 0;

  try {
    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error('Player document not found');
      }

      const playerData = playerDoc.data() as PlayerData;

      if (playerData.joules < joulesToRedeem) {
        throw new Error('Insufficient Joules balance.');
      }

      stablecoinAmount = joulesToRedeem / JOULES_TO_USDC_RATE;

      // 1. Deduct Joules immediately
      t.update(playerRef, {
        joules: FieldValue.increment(-joulesToRedeem),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 2. Log pending transaction
      t.set(logRef, {
        transactionId: transactionId,
        userId: userId,
        amount: -joulesToRedeem,
        currency: 'JOULES',
        transactionType: 'withdraw',
        status: 'withdrawal_pending',
        timestamp: FieldValue.serverTimestamp(),
        toWallet: playerWalletAddress,
        toAmount: stablecoinAmount,
        toCurrency: 'USDT',
      });
    });

    const hotWalletKey = process.env.HOT_WALLET_PRIVATE_KEY;
    if (!hotWalletKey) {
        await playerRef.update({joules: FieldValue.increment(joulesToRedeem)});
        await logRef.update({status: 'withdrawal_failed', errorMessage: 'Server hot wallet not configured.'});
        throw new Error('Server hot wallet not configured. Joules re-credited.');
    }
    const RPC_URL_NON_NULL = process.env.POLYGON_RPC_URL;
    if (!RPC_URL_NON_NULL) {
        await playerRef.update({joules: FieldValue.increment(joulesToRedeem)});
        await logRef.update({status: 'withdrawal_failed', errorMessage: 'Server RPC URL not configured.'});
        throw new Error('Server RPC URL not configured. Joules re-credited.');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL_NON_NULL);
    const hotWallet = new ethers.Wallet(hotWalletKey, provider);
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, hotWallet);

    const usdcAmountInSmallestUnit = ethers.parseUnits(stablecoinAmount.toString(), 6);

    console.log(`API: Sending ${stablecoinAmount} USDC to ${playerWalletAddress}...`);

    const tx = await usdcContract.transfer(playerWalletAddress, usdcAmountInSmallestUnit);
    const txHash = tx.hash;

    // 3. Update log after blockchain transaction initiated
    await logRef.update({
      status: 'withdrawal_processing',
      transactionHash: txHash,
    });

    console.log(`API: Withdrawal successful. TxHash: ${txHash}`);
    response.status(200).json({success: true, txHash: txHash, transactionId: transactionId});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to redeem joules for user ${userId}:`, errorMessage);

    if (!errorMessage.includes('Insufficient Joules')) {
        await playerRef.update({joules: FieldValue.increment(joulesToRedeem)});
        console.log(`API: Joules re-credited to user ${userId} due to external failure.`);
    }

    // Update log to failed state
    await logRef.update({status: 'withdrawal_failed', errorMessage: errorMessage});

    response.status(500).json({error: errorMessage});
  }
};