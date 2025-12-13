import { FC, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Terminal, Key } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { serverTimestamp } from 'firebase/firestore';
import { PlayerData } from '../../lib/types'; 

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
      setShowMessage('⚠️ AUTHENTICATION REQUIRED');
      setActiveModal('auth');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple validation logic (You can add more codes here)
    if (promoCode.toUpperCase() === 'LIFETIME_ACCESS' || promoCode.toUpperCase() === 'PET_LAUNCH_2025') {
      try {
        // --- THIS IS THE CRITICAL UPDATE ---
        // With the new Rules, this write will now succeed.
        await updatePlayerFirestore({
          isPETMember: true,
          membership: 'lifetime', // Explicitly set to lifetime
          updatedAt: serverTimestamp(),
        });

        setIsPETMember(true);
        setShowMessage('🎉 ACCESS GRANTED: LIFETIME MEMBERSHIP');
        setPromoCode('');
      } catch (err: any) {
        console.error('Failed to apply promo code:', err);
        setShowMessage('⚠️ ERROR: PERMISSION DENIED BY PROTOCOL');
      }
    } else {
      setShowMessage('❌ ERROR: INVALID ACCESS KEY');
    }
    
    setIsLoading(false);
  }, [promoCode, userId, setShowMessage, setActiveModal, updatePlayerFirestore, setIsPETMember]);

  return (
    <SwytchCard className="p-8 text-center border-gray-800">
      <h3 className="text-2xl font-black italic text-white mb-2 uppercase tracking-tighter flex justify-center items-center gap-2">
        <Key className="w-6 h-6 text-[#39FF14]" /> Activation Key
      </h3>
      <p className="text-gray-500 mb-6 font-mono text-xs uppercase tracking-wide">
        ENTER KEY TO UNLOCK LIFETIME CLEARANCE.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto border border-gray-700 rounded-sm overflow-hidden group hover:border-[#39FF14] transition-colors">
        <div className="flex items-center bg-[#050505] pl-3 border-r border-gray-800">
            <Terminal className="w-4 h-4 text-[#39FF14]" />
        </div>
        <input
          type="text"
          placeholder="ENTER_CODE"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="flex-grow bg-[#050505] p-3 text-white font-mono text-sm placeholder:text-gray-700 outline-none uppercase"
          disabled={isLoading}
        />
        <motion.button
          className="px-6 bg-[#39FF14] text-black font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50 tracking-widest"
          onClick={handleApplyPromoCode}
          disabled={isLoading || !promoCode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          EXECUTE
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default MembershipUpgrade;