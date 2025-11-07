// functions/src/redeemJoules.ts

import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {ethers} from 'ethers';
import type {PlayerData} from './lib/types';
import {Request} from 'firebase-functions/v2/https'; // <-- THE FIX
import type {Response} from 'express'; // <-- THE FIX

// (Firebase Admin Setup... no changes)


const RPC_URL = process.env.POLYGON_RPC_URL!;
const USDC_CONTRACT_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const JOULES_TO_USDC_RATE = 1000;
const USDC_ABI = ['function transfer(address to, uint256 amount) returns (bool)'];

export const redeemJoulesHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  // (Rest of the function is identical)
  const db = getFirestore();
  const auth = getAuth();
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

  const {amount} = request.body;
  const joulesToRedeem = parseInt(amount, 10);

  if (!joulesToRedeem || joulesToRedeem <= 0) {
    response.status(400).json({error: 'Invalid amount'});
    return;
  }

  const playerRef = db.collection('Players').doc(userId);
  const logRef = db.collection('Transactions').doc();

  let playerWalletAddress = '';
  let stablecoinAmount = 0;

  try {
    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error('Player document not found');
      }

      const playerData = playerDoc.data() as PlayerData;

      if (!playerData.walletAddress) {
        throw new Error('No wallet address linked to this account.');
      }
      if (playerData.joules < joulesToRedeem) {
        throw new Error('Insufficient Joules balance.');
      }

      playerWalletAddress = playerData.walletAddress;
      stablecoinAmount = joulesToRedeem / JOULES_TO_USDC_RATE;

      t.update(playerRef, {
        joules: FieldValue.increment(-joulesToRedeem),
        updatedAt: FieldValue.serverTimestamp(),
      });

      t.set(logRef, {
        transactionId: logRef.id,
        userId: userId,
        amount: joulesToRedeem,
        currency: 'JOULES',
        transactionType: 'withdrawal_pending',
        status: 'pending',
        timestamp: FieldValue.serverTimestamp(),
        toWallet: playerWalletAddress,
        toAmount: stablecoinAmount,
        toCurrency: 'USDC',
      });
    });

    const hotWalletKey = process.env.HOT_WALLET_PRIVATE_KEY;
    if (!hotWalletKey) {
      throw new Error('Server hot wallet not configured.');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const hotWallet = new ethers.Wallet(hotWalletKey, provider);
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, hotWallet);

    const usdcAmountInSmallestUnit = ethers.parseUnits(stablecoinAmount.toString(), 6);

    console.log(`API: Sending ${stablecoinAmount} USDC to ${playerWalletAddress}...`);

    const tx = await usdcContract.transfer(playerWalletAddress, usdcAmountInSmallestUnit);
    const txHash = tx.hash;

    await logRef.update({
      status: 'processing',
      transactionType: 'withdrawal_processing',
      txHash: txHash,
    });

    console.log(`API: Withdrawal successful. TxHash: ${txHash}`);
    response.status(200).json({success: true, txHash: txHash});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to redeem joules for user ${userId}:`, errorMessage);

    await playerRef.update({joules: FieldValue.increment(joulesToRedeem)});
    await logRef.update({status: 'failed', transactionType: 'withdrawal_failed', errorMessage: errorMessage});

    response.status(500).json({error: errorMessage});
  }
};
