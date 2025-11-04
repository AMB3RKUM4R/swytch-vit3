// src/components/market/TrustMarketHero.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight, Gem } from 'lucide-react'; // Use Gem for JOULES
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

// This component is now self-sufficient and requires no props.

const TrustMarketHero: FC = () => {
  // Pull data from our global contexts
  const { userId, goldBalance, joulesBalance } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleExploreClick = () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to explore the market!');
      setActiveModal('auth');
    } else {
      setShowMessage('🛒 Welcome to the PETverse Market!');
    }
  };

  return (
    <SwytchCard variant="holographic" className="p-8 text-center relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-foreground font-poppins mb-4 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 mr-3 text-green-400" /> PETverse Market
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 font-inter">
          Trade, swap, and manage your digital assets in the secure Swytch PETverse Market.
        </p>

        {userId && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6 text-foreground">
            <div className="flex items-center gap-2">
              <Gem className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold font-poppins">{joulesBalance.toFixed(0)} JOULES</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-400" />
              <span className="text-xl font-bold font-poppins">{goldBalance.toFixed(0)} Gold</span>
            </div>
          </div>
        )}

        <motion.button
          className="btn-primary inline-flex items-center"
          onClick={handleExploreClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Explore Market"
        >
          Explore Market <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default TrustMarketHero;
