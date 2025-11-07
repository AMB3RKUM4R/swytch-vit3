// src/components/PaymentModal.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, AlertTriangle, CreditCard, Droplet, QrCode } from 'lucide-react'; // Added QrCode
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, isAddress } from 'viem';

import { SupportedCurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// ────────────────────────────────────────────────────────────────
// CONFIGURATION
// ────────────────────────────────────────────────────────────────
const STATIC_PAYPAL_LINK = 'https://www.paypal.com/ncp/payment/TZ5XEBCG8NFGW';

// 1. Your Wallet Address for direct ETH transfers
const RECEIVER_ETH_ADDRESS = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0' as `0x${string}`;

// 2. Your Static UPI ID for Intent/QR generation
const STATIC_UPI_ID = 'deamonstillaliv3@icici'; 

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
const PaymentModal: FC = () => {
  const { userId, logTransaction } = usePlayer();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const { isConnected } = useAccount();

  // Set default to UPI
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'upi'>('upi');
  const [amount, setAmount] = useState<string>('10.00');
  const [error, setError] = useState<string | null>(null);
  
  // --- CRYPTO PAYMENT LOGIC ---
  const ethValue = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 ? 0n : parseEther(amount);
  
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } =
    useWaitForTransactionReceipt({ hash });

  // ── UPI Payment Handler ────────────────
  const handleUpiPayment = useCallback(() => {
    setError(null);
    if (!userId || !amount || parseFloat(amount) <= 0) {
      setError('Please log in and enter a valid amount.');
      return;
    }

    const parsedAmount = parseFloat(amount).toFixed(2);
    
    // Construct UPI Intent deep link URL
    const intentUrl = `upi://pay?pa=${STATIC_UPI_ID}&pn=SwytchPETverse&am=${parsedAmount}&cu=INR&tn=Deposit%20for%20user%20${userId}`;

    // 1. Log Transaction as Pending (Crucial for Admin Approval)
    // Generate a hex-prefixed placeholder so it satisfies the `0x${string}` type expected for transactionHash.
    const upiTxHash = `0x${Date.now().toString(16)}` as `0x${string}`;
    logTransaction({
        userId: userId!,
        amount: parseFloat(parsedAmount),
        currency: 'INR' as SupportedCurrency,
        transactionType: 'deposit',
        status: 'pending', 
        itemId: 'upi-deposit-direct',
        paymentGatewayId: STATIC_UPI_ID, 
        transactionHash: upiTxHash, 
    });

    // 2. Show success message (instruct user on manual approval)
    setShowMessage(`UPI payment initiated! Please complete the payment via the UPI app. Your account will be credited by an admin upon confirmation.`);
    
    // 3. Close modal and initiate UPI deep link redirect
    setActiveModal(null);
    window.location.href = intentUrl; 
    
  }, [userId, amount, logTransaction, setActiveModal, setShowMessage]);


  // ── Crypto confirmation handling ─────────────────
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage('Crypto deposit confirmed! Your balance will be updated shortly (requires manual admin approval).');
      logTransaction({
        userId: userId!,
        amount: parseFloat(amount),
        currency: 'ETH' as SupportedCurrency,
        transactionType: 'deposit',
        status: 'pending',
        itemId: 'eth-deposit-direct',
        paymentGatewayId: RECEIVER_ETH_ADDRESS, 
        transactionHash: hash,
      });
      setActiveModal(null);
    }

    const anyError =
      txError || (hash === null && !isTxPending && sendTransaction)
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
    sendTransaction,
  ]);

  // ── Crypto payment handler ─────────
  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected || !amount || parseFloat(amount) <= 0) {
      setError('Please connect your wallet and enter a valid amount.');
      return;
    }
    
    if (!isAddress(RECEIVER_ETH_ADDRESS)) {
        setError('Configuration error: Invalid ETH receiver address.');
        return;
    }

    sendTransaction({
        to: RECEIVER_ETH_ADDRESS,
        value: ethValue,
    });
  };

  const isLoading = isTxPending || isConfirming;

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

            {/* Payment method tabs (REARRANGED: UPI, PayPal, Crypto) */}
            <div className="flex items-center justify-center gap-2 mb-4 p-1 bg-black/20 rounded-lg">
              
              {/* 1. UPI Intent Button */}
              <button
                onClick={() => {
                  setPaymentMethod('upi');
                  setError(null);
                }}
                className={cn(
                  'w-1/3 p-2 rounded-md text-sm font-semibold transition-colors',
                  paymentMethod === 'upi'
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-white/10'
                )}
              >
                <QrCode className="inline-block w-4 h-4 mr-1" />
                UPI Intent
              </button>

              {/* 2. PayPal Button */}
              <button
                onClick={() => {
                  setPaymentMethod('paypal');
                  setError(null);
                }}
                className={cn(
                  'w-1/3 p-2 rounded-md text-sm font-semibold transition-colors',
                  paymentMethod === 'paypal'
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-white/10'
                )}
              >
                <CreditCard className="inline-block w-4 h-4 mr-1" />
                PayPal
              </button>
              
              {/* 3. Crypto Button */}
              <button
                onClick={() => {
                  setPaymentMethod('crypto');
                  setError(null);
                }}
                className={cn(
                  'w-1/3 p-2 rounded-md text-sm font-semibold transition-colors',
                  paymentMethod === 'crypto'
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-white/10'
                )}
              >
                <Droplet className="inline-block w-4 h-4 mr-1" />
                Crypto
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="paymentAmount" className="text-gray-300 text-sm">
                  Amount ({paymentMethod === 'crypto' ? 'ETH' : paymentMethod === 'upi' ? 'INR' : 'USD'}):
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

              {/* UPI Intent Button (Display) */}
              {paymentMethod === 'upi' && (
                <motion.button
                  className="btn-primary w-full"
                  onClick={handleUpiPayment}
                  disabled={
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    isLoading
                  }
                >
                  Pay with UPI Intent / QR
                </motion.button>
              )}

              {/* PayPal static link button (Display) */}
              {paymentMethod === 'paypal' && (
                <div className="min-h-[50px] flex justify-center">
                  <a
                    href={STATIC_PAYPAL_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center py-2 px-4 rounded-md font-semibold transition-colors"
                    onClick={() => setActiveModal(null)}
                  >
                    Pay with PayPal
                  </a>
                </div>
              )}
              
              {/* Crypto button (Display) */}
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
                    ? 'Confirm in Wallet...'
                    : isConfirming
                    ? 'Processing...'
                    : `Pay ${amount} ETH to Wallet`}
                </motion.button>
              )}
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-rose-400 text-sm text-center mt-4 font-inter flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
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