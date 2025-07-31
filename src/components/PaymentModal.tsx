// src/components/PaymentModal.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { PaymentModalProps, SupportedCurrency } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';

const PaymentModal: FC<PaymentModalProps> = ({
  userId,
  setShowMessage,
  setActiveModal,
}) => {
  const { isDarkMode } = useTheme();
  const { address, isConnected } = useAccount();

  const [paymentMethod] = useState<'crypto'>('crypto');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('USDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentInitiate = async () => {
    setError(null);
    if (!userId) {
      setError('User not authenticated.');
      setShowMessage('⚠️ Please sign in to make a payment.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      setShowMessage('⚠️ Please enter a valid amount.');
      return;
    }
    if (!isConnected || !address) {
      setError('No wallet connected. Please connect your wallet to make a crypto payment.');
      setShowMessage('⚠️ No wallet connected.');
      return;
    }

    setLoading(true);
    setShowMessage(`Initiating payment for ${amount} ${currency}...`);

    try {
      // This is a secure payment request. A Cloud Function would handle the actual transaction.
      const paymentRequestId = `${userId}_payment_${Date.now()}`;
      await addDoc(collection(db, 'payment_requests'), {
        paymentRequestId,
        userId,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        walletAddress: address,
        status: 'pending',
        timestamp: serverTimestamp(),
      });

      setShowMessage(`✅ Payment request submitted. Please complete the transaction in your wallet.`);
      // The payment provider's modal or wallet transaction would be initiated here.
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setShowMessage('⚠️ Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'} p-6 rounded-lg max-w-sm w-full mx-4 border border-cyan-400/20`}
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
        >
          <motion.button
            className={`absolute top-4 right-4 text-foreground`}
            onClick={() => setActiveModal(null)}
            whileHover={{ scale: 1.1 }}
            aria-label="Close Modal"
          >
            <X className="w-6 h-6" />
          </motion.button>

          <h2 className="text-2xl font-bold font-poppins text-primary mb-4 flex items-center justify-center gap-2">
            <HandCoins className="w-7 h-7" /> Make a Payment
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="paymentAmount" className="text-gray-300 text-sm">Amount:</label>
              <div className="flex items-center gap-2">
                <input
                  id="paymentAmount"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input flex-grow"
                  disabled={loading}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="input w-24"
                  disabled={loading}
                >
                  <option value="USDT">USDT</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            <motion.button
              className="btn-primary w-full"
              onClick={handlePaymentInitiate}
              disabled={loading || !amount || parseFloat(amount) <= 0 || !address}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Initiating Payment...' : `Pay with ${currency}`}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;