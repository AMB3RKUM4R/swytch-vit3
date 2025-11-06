// src/components/membership/MembershipUpgrade.tsx
import { FC, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { serverTimestamp } from 'firebase/firestore';
import { PlayerData } from '../../lib/types'; // Import PlayerData

// Define props for this component
interface MembershipUpgradeProps {
  userId: string | null;
  setIsPETMember: (isMember: boolean) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setActiveModal: (modal: string | null) => void;
  setShowMessage: (message: string) => void;
}

const MembershipUpgrade: FC<MembershipUpgradeProps> = ({
  userId,
  setIsPETMember,
  updatePlayerFirestore,
  setActiveModal,
  setShowMessage
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyPromoCode = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to apply a code.');
      setActiveModal('auth');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call for promo code validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (promoCode.toUpperCase() === 'PET_LAUNCH_2025') {
      try {
        // Update user's membership status in Firestore
        await updatePlayerFirestore({
          isPETMember: true,
          membership: 'ecosystem', // Grant the base tier
          updatedAt: serverTimestamp(),
        });

        setIsPETMember(true);
        setShowMessage('🎉 Promo code applied! You are now a PET Member!');
        setPromoCode('');
      } catch (err: any) {
        console.error('Failed to apply promo code:', err);
        setShowMessage('⚠️ Failed to apply promo code. Please try again.');
      }
    } else {
      setShowMessage('❌ Invalid promo code.');
    }
    
    setIsLoading(false);
  }, [promoCode, userId, setShowMessage, setActiveModal, updatePlayerFirestore, setIsPETMember]);

  return (
    // FIX: Changed 'gradient' prop to 'variant'
    <SwytchCard variant="holographic" className="p-6 text-center">
      <h3 className="text-2xl font-bold text-foreground font-poppins mb-3">
        Have a Promo Code?
      </h3>
      <p className="text-muted-foreground mb-6 font-inter">
        Enter a special promotional code to unlock membership.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter code (e.g., PET_LAUNCH_2025)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="input flex-grow text-center sm:text-left"
          disabled={isLoading}
        />
        <motion.button
          className="btn-primary"
          onClick={handleApplyPromoCode}
          disabled={isLoading || !promoCode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          Apply Code
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default MembershipUpgrade;
