
// src/components/community/CommunityHero.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircleHeart, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface CommunityHeroProps {
  userId: string | null;
  jewelsBalance?: number; // Optional, as it might come from parent or be fetched
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const CommunityHero: FC<CommunityHeroProps> = ({ userId, jewelsBalance, setActiveModal, setShowMessage }) => {
  const handleJoinCommunity = () => {
    if (!userId) {
      setShowMessage('👋 Sign in to join the conversation!');
      setActiveModal('auth');
    } else {
      setShowMessage('🎉 Welcome to the PETverse Community!');
      // Potentially navigate to chat or forum section
    }
  };

  return (
    <SwytchCard gradient="from-blue-700/20 to-purple-700/20" className="p-6 text-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Users className="w-48 h-48 text-primary opacity-10 absolute top-1/4 left-1/4" />
        <MessageCircleHeart className="w-40 h-40 text-cyan-400 opacity-10 absolute bottom-1/3 right-1/4" />
      </motion.div>

      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-white font-poppins mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Community Hub
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          Connect with fellow players, share strategies, and shape the future of Swytch PETverse.
        </p>

        {userId ? (
          <p className="text-md text-gray-200">
            You are part of the community! Current JEWELS: <span className="font-bold text-yellow-400">{jewelsBalance?.toFixed(0) || 0}</span>
          </p>
        ) : (
          <motion.button
            className="btn-primary flex items-center justify-center mx-auto mt-4"
            onClick={handleJoinCommunity}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Join the Community"
          >
            <Users className="w-5 h-5 mr-2" /> Join the Community
          </motion.button>
        )}
      </div>
    </SwytchCard>
  );
};

export default CommunityHero;
