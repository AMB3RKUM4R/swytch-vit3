import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { MEMBERSHIP_TIERS } from '../../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const MembershipStatusOverview: FC = () => {
  const { isPETMember, playerData } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const membership = playerData?.membership || 'none';
  const currentMembershipName = membership === 'none' ? 'NO CLEARANCE' : MEMBERSHIP_TIERS[membership]?.name || 'UNKNOWN';

  const handleUpgradeClick = () => {
    setShowMessage('🌟 INITIATING UPGRADE SEQUENCE...');
    setActiveModal('payment'); 
  };

  return (
    <div className="bg-black border border-white/10 p-6 text-center">
      <h2 className="text-xl font-bold text-white font-russo mb-3 uppercase tracking-wide">
        <Star className="inline-block w-5 h-5 mr-2 text-yellow-500" /> Membership Status
      </h2>
      <p className="text-sm text-gray-500 mb-6 font-mono">
        CURRENT TIER: <span className="font-bold text-white uppercase">{currentMembershipName}</span>
      </p>
      
      {isPETMember ? (
        <div className="p-3 bg-green-900/20 border border-green-500/30 text-green-500 text-xs font-bold uppercase tracking-widest">
            BENEFITS ACTIVE
        </div>
      ) : (
        <motion.button
          className="btn-primary w-full flex items-center justify-center text-xs"
          onClick={handleUpgradeClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          UPGRADE CLEARANCE <ArrowRight className="w-4 h-4 ml-2" />
        </motion.button>
      )}
    </div>
  );
};

export default MembershipStatusOverview;