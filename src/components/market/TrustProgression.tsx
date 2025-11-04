// src/components/market/TrustProgression.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook

// This component is now self-sufficient and requires no props.

const TrustProgression: FC = () => {
  // Pull data from our global contexts
  const { playerData } = usePlayer();

  // Use live data if available, otherwise use defaults
  const currentTrustLevel = playerData?.level || 1; // Example: Tie trust to player level
  const trustPoints = playerData?.xp || 0; // Example: Tie trust points to XP
  const nextTrustLevelGoal = (playerData?.level || 1) * 1000; // Example: 1000 XP per level
  
  const progressPercentage = (trustPoints / nextTrustLevelGoal) * 100;

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Gauge className="w-7 h-7 text-primary" /> Trust Progression
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Increase your Trust to unlock exclusive market benefits!
      </p>

      <div className="space-y-4">
        <div className="bg-black/20 p-4 rounded-lg border border-border">
          <div className="flex justify-between items-center mb-2 font-inter">
            <p className="text-md font-semibold text-foreground">Current Trust Level: {currentTrustLevel}</p>
            <p className="text-sm text-muted-foreground">{trustPoints} / {nextTrustLevelGoal} Points</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5 }}
            ></motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right font-inter">Next Level: {currentTrustLevel + 1}</p>
        </div>

        <div className="bg-black/20 p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2 font-poppins">
            <TrendingUp className="w-5 h-5 text-yellow-400" /> How to Earn Trust
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 font-inter">
            <li>Complete successful trades on the Marketplace.</li>
            <li>Participate in community events.</li>
            <li>Hold PET Member status.</li>
            <li>Refer new users to the platform.</li>
          </ul>
        </div>
      </div>
    </SwytchCard>
  );
};

export default TrustProgression;
