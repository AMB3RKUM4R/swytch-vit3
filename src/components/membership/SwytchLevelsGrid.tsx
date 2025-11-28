// src/components/membership/SwytchLevelsGrid.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { MEMBERSHIP_TIERS } from '@/lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const levels = Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => ({
  ...tier,
  id: key,
  title: tier.name,
  cost: tier.usdAmount,
  reward: 'Exclusive Rewards',
  energyRequired: 'Varies',
  perks: ['Access to exclusive features', 'Priority support', 'Enhanced Energy'],
  icon: Sparkles,
  image: `https://placehold.co/150x100/1e293b/94a3b8?text=${tier.name.replace(/\s/g, '+')}`,
}));

const SwytchLevelsGrid: FC = () => {
  const { userId, currentLevel, dataLoading, authLoading } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const isPending = dataLoading || authLoading;

  const handleLevelPurchase = (level: { id: string; title: string; cost: number; contentRoute: string; level: number; }) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to purchase levels.');
      setActiveModal('auth');
      return;
    }
    if (currentLevel >= level.level) {
      setShowMessage(`ℹ️ You are already at or above ${level.title}.`);
      return;
    }
    setShowMessage(`Opening payment options for ${level.title}...`);
    setActiveModal('payment');
  };

  if (authLoading || isPending) {
    return (
      <SwytchCard variant="default" className="p-6 text-center">
        <p className="text-muted-foreground">Loading tiers...</p>
      </SwytchCard>
    );
  }

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-7 h-7 text-primary" /> Membership Tiers
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Advance through tiers to unlock powerful perks and rewards!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((levelItem) => (
          <motion.div key={levelItem.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <SwytchCard
              // Use holographic for the tiers that can be purchased
              variant={levelItem.level <= currentLevel ? "default" : "holographic"}
              className="p-5 h-full flex flex-col"
            >
              <div className="relative w-full h-32 bg-secondary rounded-md overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={levelItem.image}
                  alt={levelItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.currentTarget.src = `https://placehold.co/150x100/1e293b/94a3b8?text=Level+${levelItem.level}`}
                />
                {levelItem.level <= currentLevel && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-foreground text-xl font-bold font-poppins">UNLOCKED</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-foreground font-poppins mb-2">{levelItem.title}</h3>
              <p className="text-sm text-muted-foreground flex-grow mb-3 font-inter">{levelItem.reward}</p>
              <p className="text-2xl font-semibold text-primary mb-2">${levelItem.cost}</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mb-4 font-inter">
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
                  className="btn-secondary-solid opacity-60 cursor-not-allowed mt-auto"
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