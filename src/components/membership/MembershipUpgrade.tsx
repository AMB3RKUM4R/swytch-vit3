// src/components/membership/MembershipUpgrade.tsx
import { FC, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpCircle } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS, SupportedCurrency, PlayerData } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface MembershipUpgradeProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const MembershipUpgrade: FC<MembershipUpgradeProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
}) => {
  const [selectedTier, setSelectedTier] = useState<keyof typeof MEMBERSHIP_TIERS | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgradeClick = useCallback(async () => {
    setError(null);
    if (!userId) {
      setError('Please sign in to upgrade membership!');
      setShowMessage('⚠️ Please sign in to upgrade membership!');
      setActiveModal('auth');
      return;
    }
    if (!selectedTier) {
      setError('Please select a membership tier.');
      setShowMessage('⚠️ Please select a membership tier.');
      return;
    }

    const tierDetails = MEMBERSHIP_TIERS[selectedTier];
    if (!tierDetails) {
      setError('Invalid membership tier selected.');
      setShowMessage('⚠️ Invalid membership tier.');
      return;
    }

    setLoading(true);
    try {
      // Create a secure request document in a Firestore collection
      // A backend Cloud Function will listen for this document and process the payment
      await addDoc(collection(db, 'membership_purchase_requests'), {
        userId,
        selectedTier,
        amount: tierDetails.usdAmount,
        currency: 'USD' as SupportedCurrency, // Using USD for clarity
        requestedAt: serverTimestamp(),
        status: 'pending',
      });

      setShowMessage(`ℹ️ Membership upgrade to ${tierDetails.name} submitted! Awaiting payment confirmation.`);
      setActiveModal('payment');
    } catch (err: any) {
      console.error('Membership upgrade request error:', err);
      setError(err.message || 'Failed to initiate membership upgrade. Please try again.');
      setShowMessage('⚠️ Failed to initiate membership upgrade. Try again.');
    } finally {
      setLoading(false);
      setSelectedTier(null);
    }
  }, [userId, selectedTier, setActiveModal, setShowMessage]);

  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <ArrowUpCircle className="w-7 h-7 text-primary" /> Upgrade Your Membership
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Select a tier to unlock even more benefits and support the PETverse!
      </p>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="membershipTier" className="text-gray-300 text-sm">Choose Your Tier:</label>
          <select
            id="membershipTier"
            value={selectedTier || ''}
            onChange={(e) => setSelectedTier(e.target.value as keyof typeof MEMBERSHIP_TIERS)}
            className="input"
            disabled={loading}
          >
            <option value="" disabled>Select a tier</option>
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
              <option key={key} value={key}>
                {tier.name} - {tier.usdAmount} USD
              </option>
            ))}
          </select>
        </div>

        <motion.button
          className="btn-primary w-full"
          onClick={handleUpgradeClick}
          disabled={loading || !selectedTier}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Processing...' : 'Upgrade Now'}
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
    </SwytchCard>
  );
};

export default MembershipUpgrade;