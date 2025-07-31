// src/components/home/MembershipStatusOverview.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MembershipTier, MEMBERSHIP_TIERS } from '@/lib/types'; // Import types

interface MembershipStatusOverviewProps {
  membership: MembershipTier;
  isPETMember: boolean;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const MembershipStatusOverview: FC<MembershipStatusOverviewProps> = ({
  membership,
  isPETMember,
  setActiveModal,
  setShowMessage,
}) => {
  const currentMembershipName = membership === 'none' ? 'No Membership' : MEMBERSHIP_TIERS[membership]?.name || 'Unknown Tier';

  const handleUpgradeClick = () => {
    setShowMessage('🌟 Explore membership options!');
    setActiveModal('payment'); // Trigger the payment modal for membership selection
  };

  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6 text-center">
      <h2 className="text-2xl font-bold text-white font-poppins mb-3">
        <Star className="inline-block w-7 h-7 mr-2 text-yellow-400" /> Your Membership
      </h2>
      <p className="text-lg text-gray-200 mb-4">
        Status: <span className="font-semibold text-primary">{currentMembershipName}</span>
        {isPETMember && <span className="ml-2 text-sm text-green-400">(Active PET Member)</span>}
      </p>
      {!isPETMember && (
        <motion.button
          className="btn-primary flex items-center justify-center mx-auto"
          onClick={handleUpgradeClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Upgrade Membership"
        >
          Upgrade Membership <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      )}
      {isPETMember && (
        <p className="text-sm text-gray-400">Enjoy your exclusive PET Member benefits!</p>
      )}
    </SwytchCard>
  );
};

export default MembershipStatusOverview;