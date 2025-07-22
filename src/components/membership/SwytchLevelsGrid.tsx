// src/components/membership/SwytchLevelsGrid.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gem, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { Level, MEMBERSHIP_TIERS } from '@/lib/types'; // Import Level and MEMBERSHIP_TIERS

interface SwytchLevelsGridProps {
  userId: string | null;
  currentLevel: number; // Current player's level
  isPending: boolean;
  authLoading: boolean;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  handlePurchaseLevel: (level: { id: string; name: string; cost: number; contentRoute: string }) => Promise<void>;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

// Define the levels based on MEMBERSHIP_TIERS for consistency
const levels: Level[] = [
  {
    level: 1,
    id: 'ecosystem',
    title: 'Tier 1: Ecosystem Explorer',
    cost: MEMBERSHIP_TIERS.ecosystem.amount,
    contentRoute: MEMBERSHIP_TIERS.ecosystem.contentRoute,
    reward: '500 JEWELS + Basic Access',
    energyRequired: '0 Energy',
    perks: ['Access to basic features', 'Community access', 'Daily JEWELS bonus'],
    icon: Sparkles,
    image: 'https://placehold.co/150x100/A020F0/FFFFFF?text=Tier+1' // Placeholder image
  },
  {
    level: 2,
    id: 'gamers',
    title: 'Tier 2: Gamer Elite',
    cost: MEMBERSHIP_TIERS.gamers.amount,
    contentRoute: MEMBERSHIP_TIERS.gamers.contentRoute,
    reward: '1500 JEWELS + Enhanced Access',
    energyRequired: '50 Energy',
    perks: ['All Tier 1 perks', 'Reduced marketplace fees', 'Exclusive quests'],
    icon: Gem,
    image: 'https://placehold.co/150x100/FF00FF/FFFFFF?text=Tier+2' // Placeholder image
  },
  {
    level: 3,
    id: 'gold',
    title: 'Tier 3: Gold Sovereign',
    cost: MEMBERSHIP_TIERS.gold.amount,
    contentRoute: MEMBERSHIP_TIERS.gold.contentRoute,
    reward: '5000 JEWELS + VIP Access',
    energyRequired: '100 Energy',
    perks: ['All Tier 2 perks', 'Priority support', 'VIP item drops', 'Governance voting rights'],
    icon: Gem,
    image: 'https://placehold.co/150x100/FFD700/000000?text=Tier+3' // Placeholder image
  },
];

const SwytchLevelsGrid: FC<SwytchLevelsGridProps> = ({
  userId,
  currentLevel,
  isPending,
  authLoading,
  handlePurchaseLevel,
  setActiveModal,
  setShowMessage,
}) => {

  const handleLevelPurchase = (level: Level) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to purchase levels.');
      setActiveModal('auth');
      return;
    }
    if (currentLevel >= level.level) {
      setShowMessage(`ℹ️ You are already at or above ${level.title}.`);
      return;
    }
    handlePurchaseLevel({
      id: level.id,
      name: level.title,
      cost: level.cost,
      contentRoute: level.contentRoute,
    });
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
        {levels.map((levelItem) => (
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
                  onError={(e) => e.currentTarget.src = `https://placehold.co/150x100/FF0000/FFFFFF?text=Level+${levelItem.level}`} // Fallback
                />
                {levelItem.level <= currentLevel && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">UNLOCKED</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white font-poppins mb-2">{levelItem.title}</h3>
              <p className="text-sm text-gray-300 flex-grow mb-3">{levelItem.reward}</p>
              <p className="text-sm font-semibold text-primary mb-2">Cost: {levelItem.cost} INR</p>
              <ul className="list-disc list-inside text-xs text-gray-200 space-y-1 mb-4">
                {levelItem.perks.map((perk, i) => (
                  <li key={i}>{perk}</li>
                ))}
              </ul>

              {levelItem.level > currentLevel ? (
                <motion.button
                  onClick={() => handleLevelPurchase(levelItem)}
                  className="btn-primary flex items-center justify-center mt-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Purchase ${levelItem.title}`}
                >
                  Purchase <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              ) : (
                <button
                  className="btn-secondary opacity-70 cursor-not-allowed mt-auto"
                  disabled
                >
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
