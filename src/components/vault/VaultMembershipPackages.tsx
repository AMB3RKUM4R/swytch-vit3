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
      setShowMessage('⚠️ LOGIN REQUIRED');
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
    <div className="bg-black border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white font-russo mb-4 text-center uppercase tracking-wide">
        <Star className="inline-block w-5 h-5 mr-2 text-primary" /> Clearance Packages
      </h2>
      <p className="text-xs text-gray-500 text-center mb-8 font-mono">
        UNLOCK HIGHER YIELDS WITH ELITE STATUS
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
          <motion.div key={key} whileHover={{ y: -5 }}>
            <div className={`h-full flex flex-col p-6 border transition-colors ${isPETMember ? 'bg-white/5 border-white/10' : 'bg-black border-white/20 hover:border-primary/50'}`}>
              <h3 className="text-lg font-bold text-white font-russo uppercase mb-2">{tier.name}</h3>
              <p className="text-2xl font-bold text-primary mb-4 font-mono">
                ${tier.usdAmount}
              </p>
              <ul className="list-disc list-inside text-xs text-gray-400 flex-grow space-y-2 mb-6 font-mono">
                <li>EXCLUSIVE CONTENT</li>
                <li>BONUS YIELD</li>
                <li>PRIORITY SUPPORT</li>
              </ul>

              {isPETMember ? (
                <button className="btn-secondary w-full text-xs opacity-50 cursor-not-allowed" disabled>
                  ACTIVE
                </button>
              ) : (
                <motion.button
                  onClick={() => handlePurchaseClick(key as keyof typeof MEMBERSHIP_TIERS)}
                  className="btn-primary w-full text-xs flex items-center justify-center"
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