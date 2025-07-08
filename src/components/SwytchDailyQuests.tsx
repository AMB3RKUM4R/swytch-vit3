import { FC, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { useModal } from '../context/ModalContext';

interface SwytchQuest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface SwytchDailyQuestsProps {
  quests: SwytchQuest[];
  setQuests: Dispatch<SetStateAction<SwytchQuest[]>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  handleClaimQuest: (questId: string) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const SwytchDailyQuests: FC<SwytchDailyQuestsProps> = ({
  quests,
  userId,
  handleClaimQuest,
}) => {
  const { showMessage } = useModal();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-8 px-6 sm:px-8 lg:px-16"
    >
      <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-6xl mx-auto">
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <Target className="w-8 h-8 text-cyan-400 animate-pulse" /> Daily Quests
          </h3>
          <p className="text-gray-300 text-center font-inter">Complete these tasks to earn JEWELS and XP!</p>
          <div className="space-y-4">
            {quests.map((quest) => (
              <motion.div
                key={quest.id}
                className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg"
                variants={containerVariants}
              >
                <div>
                  <p className="text-white font-semibold font-poppins">{quest.title}</p>
                  <p className="text-sm text-gray-400 font-inter">
                    Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
                  </p>
                  <div className="w-32 bg-gray-900 rounded-full h-2 mt-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                    />
                  </div>
                </div>
                <motion.button
                  className={`px-4 py-2 rounded-lg font-semibold font-poppins ${
                    quest.progress >= quest.goal && !quest.completed
                      ? 'bg-rose-600 hover:bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => handleClaimQuest(quest.id)}
                  disabled={quest.completed || quest.progress < quest.goal || !userId}
                  whileHover={{ scale: quest.progress >= quest.goal && !quest.completed ? 1.05 : 1 }}
                  whileTap={{ scale: quest.progress >= quest.goal && !quest.completed ? 0.95 : 1 }}
                  aria-label={`Claim ${quest.title} Quest`}
                >
                  {quest.completed ? 'Claimed' : 'Claim'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </SwytchCard>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-16 right-4 max-w-xs w-full bg-gray-900/70 border border-rose-500/30 rounded-xl shadow-xl p-4 backdrop-blur-lg z-50 bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              <p className="text-white font-bold font-poppins">{showMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SwytchDailyQuests;