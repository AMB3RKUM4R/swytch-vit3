import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS } from '@/lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// Map tiers to visual data and assign a numeric rank for comparison
const levels = Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => ({
  ...tier,
  id: key,
  title: tier.name,
  cost: tier.usdAmount,
  // Assign rank: Ecosystem = 1, Lifetime = 2
  rank: key === 'lifetime' ? 2 : 1, 
  perks: key === 'lifetime' 
    ? ['ALL Ecosystem Perks', 'LIFETIME Duration', 'Prioritized Support', 'Exclusive Badge'] 
    : ['Yield Multiplier (1.5x)', 'Exclusive Game Access', 'Governance Voting'],
}));

const SwytchLevelsGrid: FC = () => {
  const { userId, isPETMember, playerData, dataLoading, authLoading } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const isPending = dataLoading || authLoading;

  // Determine current user rank
  const userRank = playerData?.membership === 'lifetime' ? 2 : (isPETMember ? 1 : 0);

  const handleLevelPurchase = (levelItem: any) => {
    if (!userId) {
      setShowMessage('⚠️ AUTHENTICATION REQUIRED');
      setActiveModal('auth');
      return;
    }
    
    // Prevent buying lower tiers if higher tier owned
    if (userRank >= levelItem.rank) {
      setShowMessage(`ℹ️ ACCESS ALREADY GRANTED: ${levelItem.title}`);
      return;
    }

    setShowMessage(`INITIATING PURCHASE: ${levelItem.title}...`);
    setActiveModal('payment');
  };

  if (authLoading || isPending) {
    return (
      <SwytchCard className="p-6 text-center border-gray-800">
        <p className="text-gray-500 font-mono text-xs uppercase animate-pulse">LOADING_DATA_STREAM...</p>
      </SwytchCard>
    );
  }

  return (
    <SwytchCard className="p-6 border-gray-800">
      <h2 className="text-xl font-black italic text-white mb-2 text-center flex items-center justify-center gap-2 uppercase tracking-tighter">
        <Sparkles className="w-5 h-5 text-[#39FF14]" /> Clearance Levels
      </h2>
      <p className="text-xs text-gray-500 text-center mb-8 font-mono uppercase">
        UPGRADE CLEARANCE TO UNLOCK CLASSIFIED PROTOCOLS
      </p>

      {/* Grid: 2 Columns for the 2 Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((levelItem) => {
          const isUnlocked = userRank >= levelItem.rank;
          const isNextUpgrade = userRank < levelItem.rank;

          return (
            <motion.div key={levelItem.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <div
                className={`p-5 h-full flex flex-col border transition-all relative overflow-hidden group ${
                    isUnlocked 
                    ? 'bg-[#39FF14]/5 border-[#39FF14]' 
                    : 'bg-black border-gray-800 hover:border-gray-500'
                }`}
              >
                {/* Header Banner */}
                <div className="relative w-full h-24 bg-black border-b border-gray-800 mb-4 flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 bg-[#39FF14] opacity-0 ${isUnlocked ? 'opacity-10' : ''}`} />
                  <span className={`text-2xl font-black italic uppercase tracking-tighter z-10 ${isUnlocked ? 'text-[#39FF14]' : 'text-gray-700'}`}>
                    {levelItem.title.split(' ')[0]} {/* First word only for big text */}
                  </span>
                  
                  {isUnlocked ? (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#39FF14] text-black text-[9px] font-bold uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ACTIVE
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 px-2 py-0.5 border border-gray-700 text-gray-500 text-[9px] font-bold uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> LOCKED
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex justify-between items-start mb-4 font-mono">
                     <div>
                        <h3 className="text-sm font-bold text-white uppercase">{levelItem.title}</h3>
                        <p className="text-[10px] text-gray-500">TIER {levelItem.rank}</p>
                     </div>
                     <p className={`text-xl font-black ${isUnlocked ? 'text-[#39FF14]' : 'text-white'}`}>
                        ${levelItem.cost}
                     </p>
                </div>

                {/* Perks List */}
                <ul className="list-disc list-inside text-[10px] text-gray-400 space-y-2 mb-6 font-mono">
                  {levelItem.perks.map((perk, i) => (
                    <li key={i} className="uppercase tracking-wide">{perk}</li>
                  ))}
                </ul>

                {/* Action Button */}
                {isNextUpgrade ? (
                  <motion.button
                    onClick={() => handleLevelPurchase(levelItem)}
                    className="w-full py-3 bg-[#39FF14] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors mt-auto flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ACQUIRE ACCESS <ArrowRight className="w-3 h-3" />
                  </motion.button>
                ) : (
                  <button
                    className="w-full py-3 border border-[#39FF14] text-[#39FF14] text-[10px] font-bold uppercase tracking-widest mt-auto cursor-default opacity-50 bg-[#39FF14]/5"
                    disabled
                  >
                    ACCESS GRANTED
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SwytchCard>
  );
};

export default SwytchLevelsGrid;