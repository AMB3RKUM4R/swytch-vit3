// src/components/PaymentModal.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, AlertTriangle, CreditCard, Droplet } from 'lucide-react';
// Updated imports for Crypto payment: useSendTransaction and removed useWriteContract
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, isAddress } from 'viem';

import { SupportedCurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// --- ADDED: Razorpay window definition ---
declare global {
  interface Window {
    Razorpay: any;
  }
}
// -----------------------------------------

// ────────────────────────────────────────────────────────────────
// CONFIGURATION
// ────────────────────────────────────────────────────────────────
const STATIC_PAYPAL_LINK = 'https://www.paypal.com/ncp/payment/TZ5XEBCG8NFGW';

// 1. Your Wallet Address for direct ETH transfers
const RECEIVER_ETH_ADDRESS = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0' as `0x${string}`;

// 2. Razorpay Key ID (must be exposed in the frontend environment, e.g., Vite/Next public env)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyId';

// 3. API Endpoint to create a Razorpay Order
const CREATE_ORDER_API = '/api/createUpiOrderApi'; // Assumes routing handles the path to createUpiOrder

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
  const [upiLoading, setUpiLoading] = useState(false); // New state for UPI loading

  // --- CRYPTO PAYMENT LOGIC (UPDATED) ---
  const ethValue = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 ? 0n : parseEther(amount);
  
  // Use useSendTransaction for a simple ETH transfer
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } =
    useWaitForTransactionReceipt({ hash });

  // ── Load Razorpay Script (NEW) ────────────────────────────────────
  useEffect(() => {
    if (paymentMethod === 'upi' && typeof window.Razorpay === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [paymentMethod]);

  // ── UPI Payment Handler (NEW) ─────────────────────────────────────
  const handleUpiPayment = useCallback(async () => {
    setError(null);
    if (!userId || !amount || parseFloat(amount) <= 0) {
      setError('Please log in and enter a valid amount.');
      return;
    }
    
    setUpiLoading(true);

    try {
      // 1. Call your Cloud Function to create a Razorpay Order
      const response = await fetch(CREATE_ORDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount, // Send as string/float
          currency: 'INR', // UPI is usually INR
          userId: userId,
          depositType: 'deposit',
          itemId: 'none',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order.');
      }

      const orderData = await response.json();
      const orderId = orderData.id;
      const amountInPaise = orderData.amount; // Amount in paise from server

      // 2. Open Razorpay Checkout (supports UPI Intent/QR)
      const options = {
        key: RAZORPAY_KEY_ID, // Your Public Key ID
        amount: amountInPaise, 
        currency: orderData.currency,
        name: 'Game Deposit',
        description: 'In-game currency deposit',
        order_id: orderId,
        handler: function (response: any) {
          // This handler is called upon successful payment.
          // The webhook (createUpiPaymentWebhook) handles the rest on the backend.
          setShowMessage('Payment successful! Your account balance will be updated shortly.');
          logTransaction({
            userId: userId!,
            amount: parseFloat(amount), // Use the amount entered by user
            currency: 'INR' as SupportedCurrency,
            transactionType: 'deposit',
            status: 'pending', // Pending until webhook confirms
            itemId: 'razorpay-deposit',
            paymentGatewayId: 'Razorpay/UPI',
            // FIX: Removed the custom 'paymentId' field. Razorpay's payment_id is unique.
            // We use the transactionHash for the *final* payment ID for traceability.
            transactionHash: response.razorpay_payment_id, 
          });
          setActiveModal(null);
        },
        modal: {
            ondismiss: function() {
                setUpiLoading(false); 
                console.log('Razorpay modal closed');
            }
        },
        display: {
            preference: ['upi', 'netbanking', 'card'],
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err: any) {
      console.error('UPI Payment error:', err);
      setError(err.message || 'Payment initiation failed.');
      setShowMessage(`Warning: Payment initiation failed.`);
    } finally {
      setUpiLoading(false);
    }
  }, [userId, amount, logTransaction, setActiveModal, setShowMessage]);


  // ── Crypto confirmation handling (UPDATED) ─────────────────
  useEffect(() => {
    if (isConfirmed && hash) {
      // NOTE: For direct ETH transfer, the backend will need a separate monitoring service
      // or manual approval via the Admin page to update the balance.
      setShowMessage('Crypto deposit confirmed! Your balance will be updated shortly (requires manual admin approval).');
      logTransaction({
        userId: userId!,
        amount: parseFloat(amount),
        currency: 'ETH' as SupportedCurrency,
        transactionType: 'deposit',
        status: 'pending', // Set to pending as balance update is now manual/off-chain
        itemId: 'eth-deposit-direct',
        // FIX: Removed 'receiverAddress'. The receiver's address is stored here for context.
        paymentGatewayId: RECEIVER_ETH_ADDRESS, 
        transactionHash: hash, // The actual transaction hash
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

  // ── Crypto payment handler (UPDATED TO USE sendTransaction) ─────────
  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected || !amount || parseFloat(amount) <= 0) {
      setError('Please connect your wallet and enter a valid amount.');
      return;
    }
    
    // Check if the receiver address is valid before sending
    if (!isAddress(RECEIVER_ETH_ADDRESS)) {
        setError('Configuration error: Invalid ETH receiver address.');
        return;
    }

    // Direct ETH transfer to your wallet
    sendTransaction({
        to: RECEIVER_ETH_ADDRESS, // Your ETH wallet
        value: ethValue,
    });
  };

  const isLoading = isTxPending || isConfirming || upiLoading;

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

            {/* Payment method tabs (Updated) */}
            <div className="flex items-center justify-center gap-2 mb-4 p-1 bg-black/20 rounded-lg">
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
                <CreditCard className="inline-block w-4 h-4 mr-1" />
                UPI/Card
              </button>
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

              {/* Crypto button (UPDATED) */}
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

              {/* UPI Button (NEW) */}
              {paymentMethod === 'upi' && (
                <motion.button
                  className="btn-primary w-full"
                  onClick={handleUpiPayment}
                  disabled={
                    isLoading ||
                    !amount ||
                    parseFloat(amount) <= 0
                  }
                >
                  {upiLoading
                    ? 'Initializing Razorpay...'
                    : 'Pay with UPI / Card'}
                </motion.button>
              )}

              {/* PayPal static link button (UNCHANGED) */}
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
            </div>

            {/* Error message (Unchanged) */}
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