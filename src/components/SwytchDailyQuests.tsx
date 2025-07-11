import { FC } from 'react'; // Keep SetStateAction for props
import { motion } from 'framer-motion'; // Keep Variants for clarity if used
import { Target } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
// Removed firebase imports as they are not used directly in this component
// Removed auth import as not used directly
// Removed setShowWalletModal from props (it's not part of DailyQuestsProps from lib/types.ts)

// IMPORTANT: Import Quest and DailyQuestsProps from lib/types.ts
import { DailyQuestsProps as ImportedDailyQuestsProps } from '../lib/types';


// SwytchQuest interface is now just Quest, imported from lib/types.ts

const containerVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

// Use ImportedDailyQuestsProps as the type for the FC
const SwytchDailyQuests: FC<ImportedDailyQuestsProps> = ({
  quests,
  userId,
}) => {
  // FIX: Removed `const { showMessage } = useModal();` as the global toast is handled in main.tsx
  // and the message is passed as a prop if this component needs to SET it.
  // The global 'showMessage' state is managed in AppContent (main.tsx) and displayed there.
  // This component only needs to *trigger* the message via setShowMessage prop.

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
                key={quest.id} // Use quest.id for key
                className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg"
                variants={containerVariants} // Reusing containerVariants for nested motion.div
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
                  onClick={() => (quest.id)}
                  disabled={quest.completed || quest.progress < quest.goal || !userId} // Disable if no userId
                  whileHover={{ scale: (quest.progress >= quest.goal && !quest.completed && !!userId) ? 1.05 : 1 }} // Scale only if enabled
                  whileTap={{ scale: (quest.progress >= quest.goal && !quest.completed && !!userId) ? 0.95 : 1 }} // Scale only if enabled
                  aria-label={`Claim ${quest.title} Quest`}
                >
                  {quest.completed ? 'Claimed' : 'Claim'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </SwytchCard>

      {/* The global message display is handled by main.tsx's AppContent. */}
      {/* This AnimatePresence block should be removed from here. */}
      {/*
      <AnimatePresence>
        {showMessage && ( // showMessage is a prop, not from useModal directly
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
      */}
    </motion.div>
  );
};

export default SwytchDailyQuests;