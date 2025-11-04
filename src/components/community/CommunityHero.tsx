// src/components/community/CommunityHero.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircleHeart, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

// This component is now self-sufficient and requires no props.
const CommunityHero: FC = () => {
  // Pull data from our global contexts
  const { userId, joulesBalance } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

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
    <SwytchCard variant="holographic" className="p-8 text-center relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Users className="w-48 h-48 text-primary opacity-5 absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <MessageCircleHeart className="w-40 h-40 text-primary opacity-5 absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-foreground font-poppins mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" /> Community Hub
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Connect with fellow players, share strategies, and shape the future of Swytch PETverse.
        </p>

        {userId ? (
          <p className="text-md text-foreground">
            Current JOULES: <span className="font-bold text-yellow-400">{joulesBalance.toFixed(0)}</span>
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
