// src/components/market/TrustMarketHero.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface TrustMarketHeroProps {
  userId: string | null;
  goldBalance: number;
  energyBalance: number;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const TrustMarketHero: FC<TrustMarketHeroProps> = ({
  userId,
  goldBalance,
  energyBalance,
  setActiveModal,
  setShowMessage,
}) => {
  const handleExploreClick = () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to explore the market!');
      setActiveModal('auth');
    } else {
      setShowMessage('🛒 Welcome to the PETverse Market!');
    }
  };

  return (
    <SwytchCard gradient="from-purple-800/20 to-indigo-800/20" className="p-8 text-center relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white font-poppins mb-4 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 mr-3 text-green-400" /> PETverse Market
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          Trade, swap, and manage your digital assets in the secure Swytch PETverse Market.
        </p>

        {userId && (
          <div className="flex justify-center items-center gap-6 mb-6 text-gray-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold">{goldBalance.toFixed(0)} Gold</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">{energyBalance.toFixed(0)} Energy</span>
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