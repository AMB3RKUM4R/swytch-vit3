import { FC } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircleHeart, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const CommunityHero: FC = () => {
  const { userId, joulesBalance } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleJoinCommunity = () => {
    if (!userId) {
      setShowMessage('👋 LOGIN REQUIRED TO JOIN NETWORK');
      setActiveModal('auth');
    } else {
      setShowMessage('🎉 WELCOME TO THE NETWORK');
    }
  };

  return (
    <SwytchCard className="p-8 text-center relative overflow-hidden border-gray-800">
      {/* Decorative background elements */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Users className="w-48 h-48 text-[#39FF14] opacity-5 absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <MessageCircleHeart className="w-40 h-40 text-[#39FF14] opacity-5 absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 font-mono">
        <h2 className="text-3xl font-black italic text-white mb-4 flex items-center justify-center gap-3 uppercase tracking-tighter">
          <Sparkles className="w-6 h-6 text-[#39FF14]" /> Network Hub
        </h2>
        <p className="text-xs text-gray-500 max-w-lg mx-auto mb-6 uppercase tracking-wide leading-relaxed">
          Connect with operators. Share strategies. Shape the protocol.
        </p>

        {userId ? (
          <div className="inline-block px-4 py-2 border border-[#39FF14] bg-[#39FF14]/10 rounded-sm">
             <p className="text-xs text-[#39FF14] font-bold uppercase">
                Active Energy: <span className="text-white ml-2">{joulesBalance.toFixed(0)} J</span>
            </p>
          </div>
        ) : (
          <motion.button
            className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase text-xs tracking-widest flex items-center justify-center mx-auto hover:bg-white transition-colors"
            onClick={handleJoinCommunity}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-4 h-4 mr-2" /> CONNECT TO HUB
          </motion.button>
        )}
      </div>
    </SwytchCard>
  );
};

export default CommunityHero;