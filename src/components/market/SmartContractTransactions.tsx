import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS } from '@/lib/types';

// Define the shape of a level object for clarity
interface Level {
    id: string;
    name: string;
    cost: number;
    contentRoute: string;
    level: number;
}

interface SwytchLevelsGridProps {
  userId: string | null;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  // This prop now expects the clean 'Level' type
  handlePurchaseLevel: (level: Level) => Promise<void>;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

// Create a clean array of level data that matches our 'Level' interface
const levels = Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => ({
  id: key,
  name: tier.name,
  cost: tier.usdAmount,
  contentRoute: tier.contentRoute,
  level: tier.level,
}));

// Create a separate, richer array for display purposes inside the component
const displayLevels = levels.map(level => ({
    ...level,
    title: level.name, // Use 'title' for display
    reward: 'Exclusive Rewards',
    perks: ['Access to exclusive features', 'Priority support'],
    icon: Sparkles,
    image: `https://placehold.co/150x100/FFD700/000000?text=${level.name.replace(/\s/g, '+')}`,
}));


const SwytchLevelsGrid: FC<SwytchLevelsGridProps> = ({
  userId,
  currentLevel,
  isPending,
  authLoading,
  handlePurchaseLevel,
  setActiveModal,
  setShowMessage,
}) => {
  const onPurchaseClick = (level: Level) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to purchase levels.');
      setActiveModal('auth');
      return;
    }
    if (currentLevel >= level.level) {
      setShowMessage(`ℹ️ You are already at or above ${level.name}.`);
      return;
    }
    // Directly pass the clean 'level' object that matches the prop type
    handlePurchaseLevel(level);
  };

  if (authLoading || isPending) {
    return (
      <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-6 text-center">
        <p className="text-gray-400">Loading levels...</p>
      </SwytchCard>
    );
  }

  return (
    <SwytchCard gradient="from-rose-700/20 to-purple-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-7 h-7 text-primary" /> Membership Tiers
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Advance through tiers to unlock powerful perks and rewards!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayLevels.map((levelItem) => (
          <motion.div key={levelItem.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <SwytchCard
              gradient={levelItem.level <= currentLevel ? 'from-green-700/20 to-green-900/20' : 'from-gray-800/20 to-gray-700/20'}
              className="p-5 h-full flex flex-col"
            >
              <div className="relative w-full h-32 bg-gray-700 rounded-md overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={levelItem.image}
                  alt={levelItem.title}
                  className="w-full h-full object-cover"
                />
                {levelItem.level <= currentLevel && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">UNLOCKED</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white font-poppins mb-2">{levelItem.title}</h3>
              <p className="text-sm text-gray-300 flex-grow mb-3">{levelItem.reward}</p>
              <p className="text-sm font-semibold text-primary mb-2">Cost: {levelItem.cost} USD</p>
              <ul className="list-disc list-inside text-xs text-gray-200 space-y-1 mb-4">
                {levelItem.perks.map((perk, i) => (
                  <li key={i}>{perk}</li>
                ))}
              </ul>

              {levelItem.level > currentLevel ? (
                <motion.button
                  onClick={() => onPurchaseClick(levelItem)}
                  className="btn-primary flex items-center justify-center mt-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Purchase <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              ) : (
                <button className="btn-secondary opacity-70 cursor-not-allowed mt-auto" disabled>
                  Current Tier
                </button>
              )}
            </SwytchCard>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default SwytchLevelsGrid;
