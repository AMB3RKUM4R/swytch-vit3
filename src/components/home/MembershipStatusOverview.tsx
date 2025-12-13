import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { MEMBERSHIP_TIERS } from '../../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const MembershipStatusOverview: FC = () => {
  const { isPETMember, playerData } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // If membership is 'lifetime', show that. Otherwise fallback to tier name.
  const membership = playerData?.membership || 'none';
  
  let displayStatus = 'NO CLEARANCE';
  if (membership === 'lifetime') {
      displayStatus = 'LIFETIME ELITE';
  } else if (membership !== 'none' && MEMBERSHIP_TIERS[membership]) {
      displayStatus = MEMBERSHIP_TIERS[membership].name;
  } else if (isPETMember) {
      displayStatus = 'ACTIVE MEMBER';
  }

  const handleUpgradeClick = () => {
    setShowMessage('🌟 INITIATING UPGRADE SEQUENCE...');
    setActiveModal('payment'); 
  };

  return (
    <div className="bg-black border border-gray-800 p-6 text-center font-mono relative overflow-hidden">
      {/* Background Glow if Member */}
      {isPETMember && (
          <div className="absolute inset-0 bg-[#39FF14]/5 pointer-events-none" />
      )}

      <h2 className="text-xl font-black italic text-white mb-4 uppercase tracking-tighter flex items-center justify-center gap-2 relative z-10">
        <Star className={`w-5 h-5 ${isPETMember ? 'text-[#39FF14]' : 'text-yellow-500'}`} /> 
        Clearance Status
      </h2>
      
      <div className={`mb-6 p-4 border relative z-10 inline-block min-w-[200px] ${
          isPETMember ? 'bg-black border-[#39FF14]' : 'bg-[#050505] border-gray-800'
      }`}>
          <p className="text-[10px] text-gray-500 uppercase mb-1 tracking-widest">CURRENT TIER</p>
          <span className={`text-xl font-black uppercase ${isPETMember ? 'text-[#39FF14] text-glow-primary' : 'text-gray-400'}`}>
              {displayStatus}
          </span>
      </div>
      
      <div className="relative z-10">
        {isPETMember ? (
            <div className="w-full py-3 bg-[#39FF14] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.4)]">
                <ShieldCheck className="w-4 h-4" /> ALL PROTOCOLS ACTIVE
            </div>
        ) : (
            <motion.button
            className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-[#39FF14] transition-colors"
            onClick={handleUpgradeClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            >
            UPGRADE TO LIFETIME <ArrowRight className="w-3 h-3 ml-2" />
            </motion.button>
        )}
      </div>
    </div>
  );
};

export default MembershipStatusOverview;