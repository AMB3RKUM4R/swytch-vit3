// src/components/vault/VaultMembershipPackages.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS } from '@/lib/types';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

// This component is now self-sufficient and requires no props.
const VaultMembershipPackages: FC = () => {
  // Pull data from our global contexts
  const { userId, isPETMember, dataLoading } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const isPending = dataLoading; // Use dataLoading as the pending state

  const handlePurchaseClick = useCallback((tierKey: keyof typeof MEMBERSHIP_TIERS) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to purchase a membership.');
      setActiveModal('auth');
      return;
    }
    
    const tier = MEMBERSHIP_TIERS[tierKey];
    if (isPETMember) {
      setShowMessage('ℹ️ You are already a PET Member!');
      return;
    }
    
    // Set the modal with context for the purchase
    // We can pass this data via the modal context if needed, or store in a temp state
    // For now, we just open the payment modal.
    setShowMessage(`Opening payment options for ${tier.name}...`);
    setActiveModal('payment'); 
    
  }, [userId, isPETMember, setShowMessage, setActiveModal]);

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Star className="w-7 h-7 text-primary" /> Membership Packages
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Choose a membership tier to unlock exclusive benefits!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
          <motion.div key={key} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <SwytchCard
              variant={isPETMember ? "default" : "holographic"} // Highlight holographic if purchasable
              className="p-5 h-full flex flex-col"
            >
              <h3 className="text-xl font-bold text-foreground font-poppins mb-2">{tier.name}</h3>
              <p className="text-2xl font-semibold text-primary mb-3">
                ${tier.usdAmount}
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground flex-grow space-y-1 mb-4 font-inter">
                <li>Access to exclusive features</li>
                <li>Bonus JOULES rewards</li>
                <li>Priority support</li>
              </ul>

              {isPETMember ? (
                <button
                  className="btn-secondary-solid opacity-60 cursor-not-allowed mt-auto"
                  disabled
                >
                  Already a Member
                </button>
              ) : (
                <motion.button
                  onClick={() => handlePurchaseClick(key as keyof typeof MEMBERSHIP_TIERS)}
                  className="btn-primary flex items-center justify-center mt-auto"
                  disabled={isPending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Purchase <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              )}
            </SwytchCard>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default VaultMembershipPackages;
