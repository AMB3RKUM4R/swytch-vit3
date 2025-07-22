// src/components/vault/FiatWithdrawalForm.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, CreditCard, Send } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface FiatWithdrawalFormProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  handleWithdrawal: () => Promise<void>; // For crypto withdrawal (from parent Vault.tsx)
  handlePayPalWithdrawal: () => Promise<void>; // For PayPal withdrawal (from parent Vault.tsx)
  withdrawalAmount: string; // Amount state from parent
  setWithdrawalAmount: React.Dispatch<React.SetStateAction<string>>; // Setter for amount state
  paypalEmail: string; // PayPal email state from parent
  setPaypalEmail: React.Dispatch<React.SetStateAction<string>>; // Setter for PayPal email state
}

const FiatWithdrawalForm: FC<FiatWithdrawalFormProps> = ({
  userId,
  setShowMessage,
  setActiveModal,
  handleWithdrawal, // This is for crypto withdrawal now
  handlePayPalWithdrawal, // This is for PayPal withdrawal
  withdrawalAmount,
  setWithdrawalAmount,
  paypalEmail,
  setPaypalEmail,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'paypal' | 'crypto'>('upi');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWithdrawalSubmit = async () => {
    setLocalError(null);
    if (!userId) {
      setShowMessage('⚠️ Please sign in to withdraw.');
      setActiveModal('auth');
      return;
    }
    if (isNaN(parseFloat(withdrawalAmount)) || parseFloat(withdrawalAmount) <= 0) {
      setLocalError('Please enter a valid amount greater than zero.');
      setShowMessage('⚠️ Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      if (selectedMethod === 'crypto') {
        // This calls the handleWithdrawal (crypto) from Vault.tsx
        await handleWithdrawal();
      } else if (selectedMethod === 'paypal') {
        // This calls the handlePayPalWithdrawal from Vault.tsx
        await handlePayPalWithdrawal();
      } else if (selectedMethod === 'upi') {
        // For UPI, you'd typically need a UPI ID input here.
        // For MVP, we'll simulate the request and rely on admin to get details from user profile.
        setShowMessage(`UPI withdrawal request for ${withdrawalAmount} JEWELS submitted! Admin will process.`);
        // In a real scenario, you'd add a transaction to Firestore like:
        // await addDoc(collection(db, 'WithdrawRequests'), {
        //   uid: userId,
        //   amount: parseFloat(withdrawalAmount),
        //   upiId: 'user_upi_id_from_profile', // This would come from user's profile data
        //   status: 'pending',
        //   createdAt: serverTimestamp(),
        // });
      }
      setWithdrawalAmount(''); // Clear amount after submission
      // setShowMessage is handled by the specific handler functions
    } catch (err: any) {
      setLocalError(err.message || 'Failed to submit withdrawal request.');
      setShowMessage('⚠️ Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwytchCard gradient="from-red-700/20 to-orange-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center">
        <Banknote className="inline-block w-7 h-7 mr-2 text-primary" /> Withdraw Funds
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="withdrawalAmount" className="text-gray-300 text-sm">Amount (JEWELS):</label>
          <input
            id="withdrawalAmount"
            type="number"
            step="any"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder="Enter amount"
            className="input"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Withdrawal Method:</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="upi"
                checked={selectedMethod === 'upi'}
                onChange={() => setSelectedMethod('upi')}
                className="form-radio text-primary"
                disabled={loading}
              />
              <span className="ml-2 text-white flex items-center gap-1"><Banknote className="w-4 h-4" /> UPI</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="paypal"
                checked={selectedMethod === 'paypal'}
                onChange={() => setSelectedMethod('paypal')}
                className="form-radio text-primary"
                disabled={loading}
              />
              <span className="ml-2 text-white flex items-center gap-1"><CreditCard className="w-4 h-4" /> PayPal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="crypto"
                checked={selectedMethod === 'crypto'}
                onChange={() => setSelectedMethod('crypto')}
                className="form-radio text-primary"
                disabled={loading}
              />
              <span className="ml-2 text-white flex items-center gap-1"><Send className="w-4 h-4" /> Crypto</span>
            </label>
          </div>
        </div>

        {selectedMethod === 'paypal' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="paypalEmail" className="text-gray-300 text-sm">PayPal Email:</label>
            <input
              id="paypalEmail"
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="input"
              disabled={loading}
            />
          </div>
        )}

        <motion.button
          className="btn-primary w-full"
          onClick={handleWithdrawalSubmit}
          disabled={loading || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || (selectedMethod === 'paypal' && !paypalEmail)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Submitting Request...' : `Request ${selectedMethod === 'crypto' ? 'Crypto' : selectedMethod === 'paypal' ? 'PayPal' : 'UPI'} Withdrawal`}
        </motion.button>
      </div>

      <AnimatePresence>
        {localError && (
          <motion.p
            className="text-rose-400 text-sm text-center mt-4 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {localError}
          </motion.p>
        )}
      </AnimatePresence>
    </SwytchCard>
  );
};

export default FiatWithdrawalForm;
