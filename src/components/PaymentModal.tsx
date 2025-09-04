// src/components/PaymentModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, Loader2, AlertTriangle, CreditCard, Droplet } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

import { PaymentModalProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const PaymentModal: FC<PaymentModalProps> = ({
  userId,
  setShowMessage,
  setActiveModal,
  activeModal,
}) => {
  const { isConnected } = useAccount();

  // State for both payment methods - Defaulting to PayPal for better UX
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal'>('paypal');
  const [amount, setAmount] = useState<string>('10.00');
  const [error, setError] = useState<string | null>(null);

  // --- Wagmi (Crypto) Hooks ---
  const { data: hash, sendTransaction, isPending: isTxPending, error: sendError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  // --- PayPal Hooks ---
  const [{ isPending: isPayPalLoading }] = usePayPalScriptReducer();
  
  // Effect to handle crypto transaction success/failure messages
  useEffect(() => {
    if (isConfirmed) {
      setShowMessage(`✅ Crypto deposit successful! Your balance will be updated after network confirmation.`);
      setActiveModal(null);
    }
    const anyError = txError || sendError;
    if (anyError) {
        const errorMessage = anyError.message.includes('User rejected the request') 
            ? 'Wallet transaction was rejected.' 
            : 'Crypto transaction failed.';
        setError(errorMessage);
        setShowMessage(`⚠️ ${errorMessage}`);
    }
  }, [isConfirmed, txError, sendError, setShowMessage, setActiveModal]);


  // --- Crypto Payment Logic ---
  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected || !amount || parseFloat(amount) <= 0) {
      setError('Please connect your wallet and enter a valid amount.');
      return;
    }
    
    // --- Admin wallet address for all crypto deposits ---
    const adminDepositAddress = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0' as `0x${string}`;
    
    sendTransaction({
        to: adminDepositAddress,
        value: parseEther(amount),
    });
  };

  // --- PayPal Payment Logic ---
  const createPayPalOrder = async (): Promise<string> => {
    setError(null);
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      const msg = "Please enter a valid amount for the PayPal transaction.";
      setError(msg);
      throw new Error(msg);
    }
    try {
        const response = await fetch('/api/create-paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, currency: 'USD', userId, depositType: 'deposit' }),
        });
        const order = await response.json();
        if (order.id) return order.id;
        throw new Error(order.error || "Failed to create PayPal order.");
    } catch(err: any) {
        setError(err.message);
        throw err;
    }
  };

  const onPayPalApprove = async (data: { orderID: string }): Promise<void> => {
    try {
        const response = await fetch('/api/capture-paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID, userId, amount, depositType: 'deposit' }),
        });
        const result = await response.json();
        if (result.success) {
            setShowMessage("✅ PayPal payment successful! Your balance will update after admin confirmation.");
            setActiveModal(null);
        } else {
            throw new Error(result.error || "Payment capture failed.");
        }
    } catch (err: any) {
        setError(err.message);
        setShowMessage(`⚠️ ${err.message}`);
    }
  };
  
  const isLoading = isTxPending || isConfirming || isPayPalLoading;

  return (
    <AnimatePresence>
      {activeModal === 'payment' && (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative modal glass-dark p-6 rounded-lg max-w-sm w-full mx-4 border border-cyan-400/20"
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
            >
              <button className="absolute top-4 right-4 text-foreground" onClick={() => setActiveModal(null)} aria-label="Close Modal">
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold font-poppins text-primary mb-4 flex items-center justify-center gap-2">
                <HandCoins className="w-7 h-7" /> Make a Payment
              </h2>

                <div className="flex items-center justify-center gap-2 mb-4 p-1 bg-black/20 rounded-lg">
                    <button onClick={() => setPaymentMethod('paypal')} className={cn('w-full p-2 rounded-md text-sm font-semibold transition-colors', paymentMethod === 'paypal' ? 'bg-[hsl(var(--primary))] text-primary-foreground' : 'text-muted-foreground hover:bg-white/10')}>
                        <CreditCard className="inline-block w-4 h-4 mr-2"/> PayPal (USD)
                    </button>
                    <button onClick={() => setPaymentMethod('crypto')} className={cn('w-full p-2 rounded-md text-sm font-semibold transition-colors', paymentMethod === 'crypto' ? 'bg-[hsl(var(--primary))] text-primary-foreground' : 'text-muted-foreground hover:bg-white/10')}>
                        <Droplet className="inline-block w-4 h-4 mr-2"/> Crypto (ETH)
                    </button>
                </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="paymentAmount" className="text-gray-300 text-sm">Amount:</label>
                  <input
                      id="paymentAmount" type="number" step="any" value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount" className="input flex-grow" disabled={isLoading}
                    />
                </div>

                  {paymentMethod === 'crypto' && (
                    <motion.button
                      className="btn-primary w-full"
                      onClick={handleCryptoPayment}
                      disabled={isLoading || !amount || parseFloat(amount) <= 0 || !isConnected}
                    >
                      {isTxPending ? 'Confirm...' : isConfirming ? 'Processing...' : `Pay with ETH`}
                    </motion.button>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="min-h-[50px]">
                        {isPayPalLoading ? <Loader2 className="mx-auto animate-spin" /> : (
                            <PayPalButtons
                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                                createOrder={createPayPalOrder}
                                onApprove={onPayPalApprove}
                                onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    setError("An error occurred with PayPal. Please try again.");
                                }}
                                forceReRender={[amount, userId]}
                                disabled={!amount || parseFloat(amount) <= 0 || !userId}
                            />
                        )}
                    </div>
                  )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p className="text-rose-400 text-sm text-center mt-4 font-inter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AlertTriangle className="inline-block w-4 h-4 mr-2"/> {error}
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