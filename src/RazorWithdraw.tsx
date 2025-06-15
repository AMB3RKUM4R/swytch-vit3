import { useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './lib/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorTransactionProps {
  uid: string;
  amount: number;
  mode: 'withdraw' | 'buy' | 'sell';
  itemId?: string;
  from?: 'wallet' | 'gold' | 'inventory';
  to?: 'wallet' | 'inventory';
  screenshot?: File | null;
  onSuccess?: () => void | Promise<void>;
}

const RazorTransaction = ({
  uid,
  amount,
  mode,
  itemId,
  from = 'wallet',
  to = 'wallet',
  screenshot = null,
  onSuccess,
}: RazorTransactionProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animation Variants
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleTransaction = async () => {
    setError(null);
    setLoading(true);

    try {
      const walletRef = doc(db, 'wallets', uid);
      const playerRef = doc(db, 'Players', uid);
      const walletSnap = await getDoc(walletRef);
      const playerSnap = await getDoc(playerRef);

      if (!walletSnap.exists()) throw new Error('Wallet not found');
      if (!playerSnap.exists()) throw new Error('Player profile not found');

      const balance = walletSnap.data()?.balance || 0;
      const gold = playerSnap.data()?.gold || 0;

      if (from === 'wallet' && amount > balance) {
        setError('Insufficient wallet balance.');
        setLoading(false);
        return;
      }

      if (from === 'gold' && amount > gold) {
        setError('Insufficient gold.');
        setLoading(false);
        return;
      }

      let screenshotUrl: string | undefined;
      if (screenshot) {
        const path = `tx_screenshots/${uid}_${Date.now()}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, screenshot);
        screenshotUrl = await getDownloadURL(fileRef);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Swytch PET Transaction',
        handler: async (response: any) => {
          try {
            const txId = `${uid}_${Date.now()}`;
            const data: any = {
              uid,
              amount,
              itemId,
              mode,
              from,
              to,
              status: 'completed',
              createdAt: serverTimestamp(),
              razorpayPaymentId: response.razorpay_payment_id,
              screenshot: screenshotUrl || '',
            };

            if (mode === 'withdraw') {
              await setDoc(doc(db, 'withdraw_requests', txId), data);
              await updateDoc(walletRef, { balance: balance - amount });
            }

            if (mode === 'buy' && to === 'inventory' && itemId) {
              await updateDoc(playerRef, {
                [`inventory.items.${itemId}`]: (playerSnap.data()?.inventory?.items?.[itemId] || 0) + 1,
                ...(from === 'gold' && { gold: gold - amount }),
                ...(from === 'wallet' && { balance: balance - amount }),
              });
            }

            if (mode === 'sell' && from === 'inventory' && to === 'wallet' && itemId) {
              const currentQty = playerSnap.data()?.inventory?.items?.[itemId] || 0;
              if (currentQty <= 0) throw new Error('Item not owned');
              await updateDoc(walletRef, { balance: balance + amount });
              await updateDoc(playerRef, {
                [`inventory.items.${itemId}`]: currentQty - 1,
              });
            }

            if (onSuccess) {
              await onSuccess();
            }

            alert('Transaction completed!');
          } catch (err: any) {
            setError(err.message || 'Failed to complete transaction.');
          } finally {
            setLoading(false);
          }
        },
        prefill: { contact: '', email: '' },
        theme: { color: '#E91E63' }, // Updated to Swytch rose
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setError(response.error.description || 'Payment failed.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Transaction failed.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-4 text-white bg-gray-900/60 backdrop-blur-lg p-4 rounded-xl border border-rose-500/20 shadow-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={handleTransaction}
        disabled={loading}
        className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
        } focus:outline-none focus:ring-2 focus:ring-rose-500`}
        variants={buttonVariants}
        whileHover={loading ? {} : "hover"}
        whileTap={loading ? {} : "tap"}
        aria-label={
          mode === 'withdraw'
            ? 'Withdraw now'
            : mode === 'buy'
            ? 'Buy item'
            : 'Sell item'
        }
      >
        {loading
          ? 'Processing...'
          : mode === 'withdraw'
          ? 'Withdraw Now'
          : mode === 'buy'
          ? 'Buy Item'
          : 'Sell Item'}
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-rose-400 text-sm"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RazorTransaction;