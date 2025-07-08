import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import QuestCard from './QuestCard';

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface TokenomicsQuestsProps {
  quests: Quest[];
  handleClaimQuest: (id: string) => void;
  isConnected: boolean;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsQuests: FC<TokenomicsQuestsProps> = memo(({ quests, handleClaimQuest, isConnected }) => {
  return (
    <motion.div variants={sectionVariants}>
      <SwytchCard gradient="from-cyan-500/10 to-blue-500/10">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 font-poppins">
            <Target className="w-6 h-6 text-cyan-400 animate-pulse" /> Daily Quests
          </h3>
          <p className="text-gray-300 font-inter">Complete tasks to earn JEWELS and XP!</p>
          <div className="space-y-3">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} handleClaimQuest={handleClaimQuest} isConnected={isConnected} />
            ))}
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
});

export default TokenomicsQuests;