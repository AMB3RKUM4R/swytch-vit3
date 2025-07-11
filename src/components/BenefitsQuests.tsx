import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';

// IMPORTANT: Correctly import Quest and BenefitsQuestsProps from your lib/types.ts file.
import { Quest, BenefitsQuestsProps as ImportedBenefitsQuestsProps } from '../lib/types';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Re-import QuestCard if it's used directly in this component's return statement.
import QuestCard from './QuestCard';

// Use ImportedBenefitsQuestsProps as the type for the FC
const BenefitsQuests: FC<ImportedBenefitsQuestsProps> = ({
  userId,
  quests,
  setQuests,
  jewelsBalance,
  setJewelsBalance, // This prop exists in ImportedBenefitsQuestsProps
  saveStateToFirestore,
  setActiveModal,
  setShowMessage,
  // Removed setShowWalletModal from destructuring as it's not in BenefitsQuestsProps
}) => {

  const handleClaimQuest = useCallback((id: string) => { // Wrap in useCallback
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to claim quests!');
      return;
    }
    const quest = quests.find((q: Quest) => q.id === id); // FIX: Explicitly type q
    if (!quest || quest.completed || quest.progress < quest.goal) {
      setShowMessage('⚠️ Quest not ready to claim!');
      return;
    }
    const updatedQuests = quests.map((q: Quest) => (q.id === id ? { ...q, completed: true } : q)); // FIX: Explicitly type q
    setQuests((prev: Quest[]) => prev.map((q: Quest) => (q.id === id ? { ...q, completed: true } : q))); // FIX: Explicitly type prev and q
    setJewelsBalance((prev: number) => prev + quest.rewardJEWELS); // FIX: Explicitly type prev

    setShowMessage(`🎉 Quest Completed: ${quest.title}! +${quest.rewardJEWELS} JEWELS, +${quest.rewardXP} XP`);

    saveStateToFirestore({
      jewels: jewelsBalance + quest.rewardJEWELS, // Pass the new jewels total
      quests: updatedQuests, // Pass the new quests array
    });

    setActiveModal('payment');
  }, [userId, quests, setQuests, jewelsBalance, setJewelsBalance, saveStateToFirestore, setActiveModal, setShowMessage]); // FIX: Added all necessary dependencies

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative bg-noise"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'ur[](https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }}
        />
        <div className="max-w-6xl mx-auto space-y-8 relative">
          <motion.h3
            variants={sectionVariants}
            className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins"
          >
            <Target className="w-6 h-6 text-cyan-400 animate-pulse" /> Embark on Your Quest
          </motion.h3>
          <motion.p variants={sectionVariants} className="text-gray-300 max-w-xl mx-auto font-inter">
            Complete quests to earn JEWELS and unlock exclusive PETverse rewards!
          </motion.p>
          <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quests.map((quest: Quest) => ( // FIX: Explicitly type quest
              <QuestCard
                key={quest.id}
                quest={quest}
                handleClaimQuest={handleClaimQuest}
                isConnected={false} // `isConnected` is not passed to BenefitsQuests, assuming always connected or handled internally
                                     // if needed, it should be passed as a prop from Benefits.tsx
              />
            ))}
          </motion.div>
        </div>
      </motion.section>
    </SwytchErrorBoundary>
  );
};

export default BenefitsQuests;