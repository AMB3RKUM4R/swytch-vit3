// src/components/vault/VaultMembershipPackages.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS } from '@/lib/types'; // Import MEMBERSHIP_TIERS

interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: (message: string) => void;
}

const VaultMembershipPackages: FC<VaultMembershipPackagesProps> = ({
  isMember,
  isPending,
  handleMembershipPayment,
  setShowMessage,
}) => {
  const handlePurchaseClick = (tierKey: keyof typeof MEMBERSHIP_TIERS) => {
    const tier = MEMBERSHIP_TIERS[tierKey];
    if (isMember) {
      setShowMessage('ℹ️ You are already a PET Member!');
      return;
    }
    handleMembershipPayment(tier.name, tier.amount);
  };

  return (
    <SwytchCard gradient="from-orange-700/20 to-red-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Star className="w-7 h-7 text-primary" /> Membership Packages
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Choose a membership tier to unlock exclusive benefits!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
          <motion.div key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <SwytchCard
              gradient={isMember ? 'from-green-700/20 to-green-900/20' : 'from-gray-800/20 to-gray-700/20'}
              className="p-5 h-full flex flex-col"
            >
              <h3 className="text-xl font-bold text-white font-poppins mb-2">{tier.name}</h3>
              <p className="text-lg font-semibold text-primary mb-3">
                {tier.amount} INR ({tier.usdAmount} USD)
              </p>
              <ul className="list-disc list-inside text-sm text-gray-200 flex-grow space-y-1 mb-4">
                {/* Placeholder benefits, ideally these would be part of MEMBERSHIP_TIERS data */}
                <li>Access to exclusive features</li>
                <li>Bonus JEWELS rewards</li>
                <li>Priority support</li>
              </ul>

              {isMember ? (
                <button
                  className="btn-secondary opacity-70 cursor-not-allowed mt-auto"
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
