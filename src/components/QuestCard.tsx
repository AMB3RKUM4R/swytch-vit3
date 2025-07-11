import { FC, memo } from 'react';
import { motion } from 'framer-motion';
// Removed: import { Quest } from './QuestCard'; // No longer needed as Quest is imported from types.ts
import { useModal } from '@/context/ModalContext'; // Keep useModal for context functions
// Removed: import { auth } from '@/lib/firebaseConfig'; // Not needed if userId is used for auth check

// IMPORTANT: Import Quest and QuestCardProps from lib/types.ts
import { QuestCardProps as ImportedQuestCardProps } from '../lib/types';


// Quest interface is now imported from lib/types.ts

// Use ImportedQuestCardProps as the type for the FC
const QuestCard: FC<ImportedQuestCardProps> = memo(({ quest, handleClaimQuest, isConnected }) => {
  const { setShowMessage } = useModal(); // Correctly consuming context

  const onClaim = () => {
    // Rely on isConnected prop for wallet connection check
    if (!isConnected) {
      setShowMessage('⚠️ Please connect your wallet!');
      return;
    }
    // handleClaimQuest already checks userId internally
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
        className={`px-4 py-2 rounded-lg font-semibold font-poppins ${
          quest.progress >= quest.goal && !quest.completed ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
        onClick={onClaim}
        disabled={quest.completed || quest.progress < quest.goal || !isConnected} // Disable if not connected
        // FIX: whileHover/whileTap scale should be 1 if disabled, 1.05/0.95 otherwise
        whileHover={{ scale: (quest.progress >= quest.goal && !quest.completed && isConnected) ? 1.05 : 1 }}
        whileTap={{ scale: (quest.progress >= quest.goal && !quest.completed && isConnected) ? 0.95 : 1 }}
        aria-label={`Claim ${quest.title} reward`}
      >
        {quest.completed ? 'Claimed' : 'Claim'}
      </motion.button>
    </div>
  );
});

export default QuestCard;