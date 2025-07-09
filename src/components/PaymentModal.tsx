// PaymentModal.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useTheme } from '../context/ThemeContext';
import { useAccount, useSendTransaction } from 'wagmi';
import { db } from '../lib/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { PaymentModalProps } from '../lib/types';

const PaymentModal: FC<PaymentModalProps> = ({ userId, setShowMessage }) => {
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal } = useModal();
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ETH');

  const handleCryptoPayment = async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to make a payment.');
      setActiveModal('auth');
      return;
    }
    if (!address) {
      setShowMessage('⚠️ Please connect your wallet.');
      setActiveModal('auth');
      return;
    }
    try {
      const transactionId = uuidv4();
      await sendTransactionAsync({
        to: '0xYourPaymentAddressHere', // Replace with your payment address
        value: BigInt(Number(amount) * 1e18), // Convert to wei
      });
      await setDoc(doc(db, 'transactions', transactionId), {
        transactionId,
        userId,
        amount: Number(amount),
        currency,
        transactionType: 'deposit',
        status: 'pending',
        timestamp: serverTimestamp(),
        walletAddress: address,
        game: 'general_deposit',
      });
      setShowMessage('🎉 Payment initiated! Awaiting confirmation.');
      setActiveModal(null);
    } catch (err) {
      console.error('Crypto payment error:', err);
      setShowMessage('⚠️ Failed to process payment. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'payment' && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise`} // Use bg-background/80 as overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
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
            <h2 className="text-2xl font-bold font-poppins text-primary mb-4">Make a Payment</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`input`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`input`}
                >
                  <option value="ETH">ETH</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="JEWELS">JEWELS</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <motion.button
                className="btn-primary"
                onClick={handleCryptoPayment}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Pay with Crypto
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;