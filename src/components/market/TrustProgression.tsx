import { FC } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/components/context/PlayerContext';

const TrustProgression: FC = () => {
  const { currentLevel } = usePlayer();
  const maxScore = 1000;
  const currentScore = Math.min(maxScore, currentLevel * 50 + 500); 
  const progressPercent = (currentScore / maxScore) * 100;

  return (
    <div className="bg-black border border-white/10 p-6">
      <div className="flex justify-between items-end mb-2">
          <div>
              <h3 className="text-sm font-bold font-russo text-white uppercase">Trust Protocol</h3>
              <p className="text-[10px] text-gray-500 font-mono">ID: HUNTER_CLASS</p>
          </div>
          <span className="text-2xl font-black text-primary">{currentScore}</span>
      </div>

      <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-600">
          <span>LVL {currentLevel}</span>
          <span>NEXT TIER: {((Math.floor(currentLevel/10)+1)*10)}</span>
      </div>
    </div>
  );
};

export default TrustProgression;