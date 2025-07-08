import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

const QuestCard: FC<{ quest: Quest; handleClaimQuest: (id: string) => void; isConnected: boolean }> = memo(({ quest, handleClaimQuest, isConnected }) => {
  const { setShowMessage } = useModal();

  const onClaim = () => {
    if (!isConnected) {
      setShowMessage('⚠️ Please connect your wallet!');
      return;
    }
    handleClaimQuest(quest.id);
  };

  return (
    <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
      <div>
        <p className="text-white font-semibold font-poppins">{quest.title}</p>
        <p className="text-sm text-gray-400 font-inter">
          Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
        </p>
        <div className="w-32 bg-gray-900 rounded-full h-2 mt-2">
          <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(quest.progress / quest.goal) * 100}%` }} />
        </div>
      </div>
      <motion.button
        className={`px-4 py-2 rounded-lg font-semibold font-poppins ${quest.progress >= quest.goal && !quest.completed ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        onClick={onClaim}
        disabled={quest.completed || quest.progress < quest.goal || !isConnected}
        whileHover={{ scale: quest.progress >= quest.goal && !quest.completed ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Claim ${quest.title} reward`}
      >
        {quest.completed ? 'Claimed' : 'Claim'}
      </motion.button>
    </div>
  );
});

export default QuestCard;