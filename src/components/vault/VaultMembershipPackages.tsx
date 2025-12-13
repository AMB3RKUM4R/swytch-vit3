import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { MEMBERSHIP_TIERS } from '@/lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const VaultMembershipPackages: FC = () => {
  const { userId, isPETMember, dataLoading } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const isPending = dataLoading;

  const handlePurchaseClick = useCallback((tierKey: keyof typeof MEMBERSHIP_TIERS) => {
    if (!userId) {
      setShowMessage('⚠️ AUTHENTICATION REQUIRED');
      setActiveModal('auth');
      return;
    }
    
    if (isPETMember) {
      setShowMessage('ℹ️ ALREADY REGISTERED');
      return;
    }
    
    setShowMessage(`INITIATING PURCHASE: ${MEMBERSHIP_TIERS[tierKey].name}`);
    setActiveModal('payment'); 
    
  }, [userId, isPETMember, setShowMessage, setActiveModal]);

  return (
    <div className="bg-black border border-gray-800 p-6 font-mono">
      <h2 className="text-xl font-black italic text-white mb-4 text-center uppercase tracking-tighter">
        <Star className="inline-block w-5 h-5 mr-2 text-[#39FF14]" /> Clearance Packages
      </h2>
      <p className="text-xs text-gray-500 text-center mb-8 uppercase tracking-wide">
        UNLOCK HIGHER YIELDS WITH ELITE STATUS
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
          <motion.div key={key} whileHover={{ y: -5 }}>
            <div className={`h-full flex flex-col p-6 border transition-colors ${
                isPETMember 
                ? 'bg-[#39FF14]/5 border-[#39FF14]' 
                : 'bg-black border-gray-800 hover:border-[#39FF14] group'
            }`}>
              <h3 className="text-sm font-bold text-white uppercase mb-2 tracking-widest">{tier.name}</h3>
              <p className="text-3xl font-black text-[#39FF14] mb-4">
                ${tier.usdAmount}
              </p>
              <ul className="list-disc list-inside text-[10px] text-gray-400 flex-grow space-y-2 mb-6 uppercase">
                <li>EXCLUSIVE CONTENT</li>
                <li>BONUS YIELD</li>
                <li>PRIORITY SUPPORT</li>
              </ul>

              {isPETMember ? (
                <button className="w-full py-3 border border-gray-600 text-gray-500 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed" disabled>
                  ACTIVE STATUS
                </button>
              ) : (
                <motion.button
                  onClick={() => handlePurchaseClick(key as keyof typeof MEMBERSHIP_TIERS)}
                  className="w-full py-3 bg-[#39FF14] text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center hover:bg-white transition-colors"
                  disabled={isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  PURCHASE <ArrowRight className="w-3 h-3 ml-2" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VaultMembershipPackages;