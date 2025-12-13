import { FC } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/components/context/PlayerContext';

const TrustProgression: FC = () => {
  const { currentLevel } = usePlayer();
  const maxScore = 1000;
  const currentScore = Math.min(maxScore, currentLevel * 50 + 500); 
  const progressPercent = (currentScore / maxScore) * 100;

  return (
    <div className="bg-black border border-gray-800 p-6 font-mono">
      <div className="flex justify-between items-end mb-4">
          <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Trust Protocol</h3>
              <p className="text-[9px] text-gray-500 uppercase">ID: HUNTER_CLASS</p>
          </div>
          <span className="text-3xl font-black text-[#39FF14]">{currentScore}</span>
      </div>

      {/* Bar */}
      <div className="w-full h-2 bg-gray-900 border border-gray-800 overflow-hidden relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex justify-between px-1">
              {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-full bg-black/50" />)}
          </div>
          <motion.div 
            className="h-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
      </div>
      
      <div className="flex justify-between mt-2 text-[9px] text-gray-500 uppercase">
          <span>Current Rank: {currentLevel}</span>
          <span>Next Tier: {((Math.floor(currentLevel/10)+1)*10)}</span>
      </div>
    </div>
  );
};

export default TrustProgression;