// src/components/PaymentModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, Loader2, AlertTriangle, CreditCard, Droplet } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

import { SupportedCurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// ────────────────────────────────────────────────────────────────
// CONFIGURATION – **LIVE** PayPal client-id
// ────────────────────────────────────────────────────────────────
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ||
  'AerajJLPX6bi0id_jGZIyB7YRcGoUj8xTNGsrX_8WyTPG2I5EgQeqSwukPgr7kuaSWvAZPjDZFLp6zSz';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  'https://us-central1-swytch-pet.cloudfunctions.net';

// ────────────────────────────────────────────────────────────────
// Contract (unchanged)
// ────────────────────────────────────────────────────────────────
const DEPOSITORY_CONTRACT_ADDRESS = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0' as `0x${string}`;
const DEPOSITORY_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint64', name: '_tier', type: 'uint64' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
const PaymentModal: FC = () => {
  const { userId, logTransaction } = usePlayer();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const { isConnected } = useAccount();

  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal'>('paypal');
  const [amount, setAmount] = useState<string>('10.00');
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending: isTxPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } =
    useWaitForTransactionReceipt({ hash });

  const [{ isPending: isPayPalLoading }] = usePayPalScriptReducer();

  // ── Crypto confirmation handling ─────────────────────────────────────
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage('Crypto deposit confirmed! Your balance will be updated shortly.');
      logTransaction({
        userId: userId!,
        amount: parseFloat(amount),
        currency: 'ETH' as SupportedCurrency,
        transactionType: 'deposit',
        status: 'pending',
        itemId: 'depository-deposit',
        paymentGatewayId: 'smart-contract',
        smartContractAddress: DEPOSITORY_CONTRACT_ADDRESS,
        transactionHash: hash,
      });
      setActiveModal(null);
    }

    const anyError =
      txError || (hash === null && !isTxPending)
        ? new Error('Transaction rejected or failed.')
        : null;
    if (anyError) {
      const msg = anyError.message.includes('User rejected')
        ? 'Wallet transaction was rejected.'
        : 'Crypto transaction failed.';
      setError(msg);
      setShowMessage(`Warning: ${msg}`);
    }
  }, [
    isConfirmed,
    txError,
    hash,
    setShowMessage,
    setActiveModal,
    logTransaction,
    userId,
    amount,
    isTxPending,
  ]);

  // ── Crypto payment ───────────────────────────────────────────────────
  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected || !amount || parseFloat(amount) <= 0) {
      setError('Please connect your wallet and enter a valid amount.');
      return;
    }
    writeContract({
      address: DEPOSITORY_CONTRACT_ADDRESS,
      abi: DEPOSITORY_CONTRACT_ABI,
      functionName: 'deposit',
      args: [parseEther(amount), BigInt(0)],
      value: parseEther(amount),
    });
  };

  // ── PayPal: create order (LIVE) ───────────────────────────────────────
  const createPayPalOrder = async (): Promise<string> => {
    setError(null);
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      const msg = 'Please enter a valid amount for PayPal.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      console.log('Creating PayPal order (LIVE) – amount:', num, 'userId:', userId);
      const res = await fetch(`${FUNCTIONS_BASE_URL}/createPayPalOrderApi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: num,
          currency: 'USD',
          userId,
          depositType: 'deposit',
        }),
      });

      const data = await res.json();
      console.log('PayPal create response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      if (!data.id) {
        throw new Error('No order ID returned');
      }
      return data.id;
    } catch (err: any) {
      console.error('PayPal createOrder error:', err);
      setError(err.message);
      throw err;
    }
  };

  // ── PayPal: capture order (LIVE) ───────────────────────────────────────
  const onPayPalApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      console.log('Capturing PayPal order:', data.orderID);
      const res = await fetch(`${FUNCTIONS_BASE_URL}/capturePayPalOrderApi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          userId,
          amount,
          depositType: 'deposit',
        }),
      });

      const result = await res.json();
      console.log('PayPal capture response:', result);

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Capture failed');
      }

      setShowMessage(
        'PayPal payment successful! Your balance will update after admin confirmation.'
      );
      setActiveModal(null);
    } catch (err: any) {
      console.error('PayPal capture error:', err);
      setError(err.message);
      setShowMessage(`Warning: ${err.message}`);
    }
  };

  const isLoading = isTxPending || isConfirming || isPayPalLoading;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {activeModal === 'payment' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative modal glass-dark p-6 rounded-lg max-w-sm w-full mx-4 border border-cyan-400/20"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <button
              className="absolute top-4 right-4 text-foreground"
              onClick={() => setActiveModal(null)}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold font-poppins text-primary mb-4 flex items-center justify-center gap-2">
              <HandCoins className="w-7 h-7" /> Make a Payment
            </h2>

            {/* Payment method tabs */}
            <div className="flex items-center justify-center gap-2 mb-4 p-1 bg-black/20 rounded-lg">
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={cn(
                  'w-full p-2 rounded-md text-sm font-semibold transition-colors',
                  paymentMethod === 'paypal'
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-white/10'
                )}
              >
                <CreditCard className="inline-block w-4 h-4 mr-2" />
                PayPal (USD)
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={cn(
                  'w-full p-2 rounded-md text-sm font-semibold transition-colors',
                  paymentMethod === 'crypto'
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-white/10'
                )}
              >
                <Droplet className="inline-block w-4 h-4 mr-2" />
                Crypto (ETH)
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="paymentAmount" className="text-gray-300 text-sm">
                  Amount:
                </label>
                <input
                  id="paymentAmount"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input flex-grow"
                  disabled={isLoading}
                />
              </div>

              {/* Crypto button */}
              {paymentMethod === 'crypto' && (
                <motion.button
                  className="btn-primary w-full"
                  onClick={handleCryptoPayment}
                  disabled={
                    isLoading ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    !isConnected
                  }
                >
                  {isTxPending
                    ? 'Confirm...'
                    : isConfirming
                    ? 'Processing...'
                    : 'Pay with ETH'}
                </motion.button>
              )}

              {/* PayPal button */}
              {paymentMethod === 'paypal' && (
                <div className="min-h-[50px]">
                  {isPayPalLoading ? (
                    <Loader2 className="mx-auto animate-spin" />
                  ) : (
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'pay',
                      }}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={(err) => {
                        console.error('PayPal SDK error:', err);
                        setError('PayPal error – please try again.');
                      }}
                      forceReRender={[amount, userId]}
                      disabled={
                        !amount || parseFloat(amount) <= 0 || !userId
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-rose-400 text-sm text-center mt-4 font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertTriangle className="inline-block w-4 h-4 mr-2" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;