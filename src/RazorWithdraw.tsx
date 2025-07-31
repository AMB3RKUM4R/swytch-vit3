// src/components/RazorTransaction.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Wallet } from 'lucide-react';
import { MEMBERSHIP_TIERS, SupportedCurrency, Transaction, TransactionStatus, TransactionType } from '@/lib/types';
import { doc, setDoc, serverTimestamp, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import QRCode from 'react-qr-code';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null;
  transactionType: TransactionType | null;
  userId: string | null;
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: (message: string) => void;
}

const RazorTransaction: FC<RazorTransactionProps> = ({
  amount,
  currency,
  itemId,
  transactionType,
  userId,
  onSuccess,
  setShowMessage,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });
  const [{ isPending: isPayPalPending }] = usePayPalScriptReducer();

  // Your hard-coded Ethereum mainnet address for deposits
  const METAMASK_DEPOSIT_ADDRESS = "0xDE9978913D9a969d799A2ba9381FB82450b92CE0";

  const handlePayPalSubmission = useCallback(async (paypalOrderId: string) => {
    if (!userId) return;
    try {
      const transaction: Transaction = {
        transactionId: `paypal_${paypalOrderId}`,
        userId: userId,
        amount: amount,
        currency: 'USD',
        transactionType: 'deposit',
        status: 'pending',
        timestamp: serverTimestamp(),
        paypalOrderId: paypalOrderId,
        paymentMethod: 'PayPal',
      };
      await addDoc(collection(db, 'Transactions'), transaction);
      onSuccess(itemId);
    } catch (err: any) {
      console.error('Failed to log PayPal transaction:', err);
      setError('Failed to log PayPal transaction. Contact support.');
      setShowMessage('⚠️ An error occurred with your PayPal transaction.');
    }
  }, [userId, amount, itemId, onSuccess, setShowMessage]);

  const createPayPalOrder = useCallback(async (_data: any, _actions: any) => {
    if (!userId) {
      throw new Error('User not authenticated.');
    }
    setLoading(true);
    try {
      const response = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, userId, depositType: itemId || 'deposit' }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error);
      return order.id;
    } catch (err: any) {
      setError(err.message);
      setShowMessage(`⚠️ PayPal error: ${err.message}`);
      setLoading(false);
      throw err;
    }
  }, [userId, amount, currency, itemId, setShowMessage]);

  const onApprovePayPalOrder = useCallback(async (data: any, _actions: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/capture-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID, userId, amount, depositType: itemId || 'deposit' }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      await handlePayPalSubmission(data.orderID);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setShowMessage(`⚠️ PayPal error: ${err.message}`);
      setLoading(false);
    }
  }, [userId, amount, itemId, setShowMessage, handlePayPalSubmission]);
  
  useEffect(() => {
    if (isConfirmed && hash) {
      const finalizeCryptoTransaction = async () => {
        if (!userId) return;
        try {
          const transaction: Transaction = {
            transactionId: `crypto_${hash}`,
            userId: userId,
            amount: amount,
            currency: currency,
            transactionType: transactionType || 'deposit',
            status: 'pending',
            timestamp: serverTimestamp(),
            paymentMethod: 'Crypto',
            paypalOrderId: hash,
            walletAddress: connectedAddress,
          };
          await addDoc(collection(db, 'Transactions'), transaction);
          onSuccess(itemId);
        } catch (err: any) {
          console.error('Failed to log crypto transaction:', err);
          setError('Failed to log crypto transaction. Contact support.');
          setShowMessage('⚠️ An error occurred with your crypto transaction.');
        }
      };
      finalizeCryptoTransaction();
    } else if (txError) {
      setError(txError.message);
      setShowMessage(`⚠️ Crypto transaction failed: ${txError.message}`);
    }
  }, [isConfirmed, hash, txError, userId, amount, currency, transactionType, itemId, onSuccess, setShowMessage, connectedAddress]);

  const handleCryptoSubmission = useCallback(() => {
    if (!isConnected) {
      setError('Please connect your crypto wallet.');
      setShowMessage('⚠️ Please connect your crypto wallet.');
      return;
    }
    if (amount <= 0) {
      setError('Please enter a valid amount.');
      setShowMessage('⚠️ Please enter a valid amount.');
      return;
    }
    
    sendTransaction({
        to: METAMASK_DEPOSIT_ADDRESS as `0x${string}`,
        value: parseEther(amount.toString()),
    });
  }, [isConnected, amount, sendTransaction, setShowMessage]);

  const handleWithdrawalRequest = async () => {
    if (!userId || amount <= 0) return;
    try {
      const transaction: Transaction = {
        transactionId: `withdraw_${userId}_${Date.now()}`,
        userId: userId,
        amount: amount,
        currency: currency,
        transactionType: 'withdraw',
        status: 'pending',
        timestamp: serverTimestamp(),
        paymentMethod: 'Crypto',
        walletAddress: connectedAddress,
      };
      await addDoc(collection(db, 'Transactions'), transaction);
      onSuccess(itemId);
    } catch (err: any) {
      console.error('Failed to log withdrawal request:', err);
      setError('Failed to log withdrawal request. Contact support.');
      setShowMessage('⚠️ An error occurred with your withdrawal request.');
    }
  };

  if (transactionType === 'deposit' || transactionType === 'membership') {
    return (
      <div className="space-y-4">
        <div className="data-panel p-4 rounded-lg border border-border/50">
          <h3 className="text-xl font-bold text-foreground text-glow-primary mb-2">PayPal (USD)</h3>
          {isPayPalPending ? (
            <p className="text-center text-muted-foreground">PayPal is loading...</p>
          ) : userId && amount > 0 ? (
            <PayPalButtons
              style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' }}
              createOrder={createPayPalOrder}
              onApprove={onApprovePayPalOrder}
              onCancel={() => {
                setShowMessage('ℹ️ PayPal payment cancelled.');
                setLoading(false);
              }}
              onError={(err: any) => {
                setError(err.message);
                setShowMessage(`⚠️ PayPal error: ${err.message}`);
                setLoading(false);
              }}
              disabled={loading}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center">Enter a valid amount to pay with PayPal.</p>
          )}
        </div>

        <div className="data-panel p-4 rounded-lg border border-border/50">
          <h3 className="text-xl font-bold text-foreground text-glow-primary mb-2">Crypto (ETH)</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center break-all">
            Deposit to: <br/> <span className="text-secondary text-glow-secondary font-system">{METAMASK_DEPOSIT_ADDRESS}</span>
          </p>
          {amount > 0 ? (
            <Web3QR address={METAMASK_DEPOSIT_ADDRESS} amount={amount} currency={currency} />
          ) : (
            <p className="text-sm text-muted-foreground text-center">Enter a valid amount to generate QR code.</p>
          )}
          <motion.button
              className="btn-primary w-full mt-4"
              onClick={handleCryptoSubmission}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || isTxPending || !amount || amount <= 0 || !isConnected}
          >
              {isTxPending ? 'Confirming in Wallet...' : 'Initiate Crypto Payment'}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-rose-400 text-sm text-center mt-4 font-inter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  } else if (transactionType === 'withdraw') {
    return (
        <div className="data-panel p-4 rounded-lg border border-border/50">
            <h3 className="text-xl font-bold text-foreground text-glow-primary mb-2">Withdraw Request</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Requests are manually reviewed by an admin.
            </p>
            <motion.button
              className="btn-primary w-full mt-4"
              onClick={handleWithdrawalRequest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || isTxPending || !amount || amount <= 0 || !isConnected}
            >
              Request Withdrawal
            </motion.button>
             <AnimatePresence>
              {error && (
                <motion.p
                  className="text-rose-400 text-sm text-center mt-4 font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
        </div>
    );
  }
  return null;
};

// New conceptual Web3QR component for generating crypto QR codes
const Web3QR: FC<{ address: string; amount: number; currency: SupportedCurrency }> = ({ address, amount, currency }) => {
  const qrValue = `ethereum:${address}?value=${amount}&currency=${currency}`;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-2 border border-border/50 rounded-lg">
        <QRCode value={qrValue} size={128} level="H" />
      </div>
      <p className="text-sm text-muted-foreground">Scan with a Web3 wallet</p>
    </div>
  );
};

export default RazorTransaction;