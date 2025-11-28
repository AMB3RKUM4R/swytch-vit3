// src/components/home/MembershipStatusOverview.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS } from '../../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const MembershipStatusOverview: FC = () => {
  const { isPETMember, playerData } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const membership = playerData?.membership || 'none';
  const currentMembershipName = membership === 'none' ? 'No Membership' : MEMBERSHIP_TIERS[membership]?.name || 'Unknown Tier';

  const handleUpgradeClick = () => {
    setShowMessage('🌟 Explore membership options!');
    setActiveModal('payment'); 
  };

  return (
    <SwytchCard variant="default" className="p-6 text-center">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-3">
        <Star className="inline-block w-7 h-7 mr-2 text-yellow-400" /> Your Membership
      </h2>
      <p className="text-lg text-muted-foreground mb-4 font-inter">
        Status: <span className="font-semibold text-primary">{currentMembershipName}</span>
      </p>
      
      {isPETMember ? (
        <p className="text-sm text-green-400 font-inter">Enjoy your exclusive PET Member benefits!</p>
      ) : (
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
    </SwytchCard>
  );
};

export default MembershipStatusOverview;