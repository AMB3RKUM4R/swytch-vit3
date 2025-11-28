// src/components/market/TrustProgression.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';

const TrustProgression: FC = () => {
  const { currentLevel } = usePlayer();
  
  // Mock Trust Score (can be tied to player level or XP)
  const maxScore = 1000;
  const currentScore = Math.min(maxScore, currentLevel * 50 + 500); 
  const progressPercent = (currentScore / maxScore) * 100;

  const nextTierLevel = Math.floor(currentLevel / 10) * 10 + 10;

  return (
    <SwytchCard variant="default" className="p-6">
      <h3 className="text-xl font-bold font-poppins text-foreground flex items-center gap-2 mb-4">
        <UserCheck className="w-5 h-5 text-primary" /> My Trust Score
      </h3>
      
      <div className="space-y-1">
        <p className="text-4xl font-russo text-primary">{currentScore.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">Current Trust: <span className="font-semibold text-foreground">PET Hunter</span></p>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-xs text-muted-foreground flex justify-between">
            <span>Next Tier: Level {nextTierLevel}</span>
            <span className="font-semibold">{progressPercent.toFixed(1)}% Complete</span>
        </p>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5 }}
          />
        </div>
      </div>
    </SwytchCard>
  );
};

export default TrustProgression;