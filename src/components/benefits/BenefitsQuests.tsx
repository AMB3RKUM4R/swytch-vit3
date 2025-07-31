// src/components/benefits/BenefitsQuests.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { Quest, PlayerData } from '@/lib/types';

interface BenefitsQuestsProps {
  userId: string | null;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  jewelsBalance: number;
  saveStateToFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const BenefitsQuests: FC<BenefitsQuestsProps> = ({
  userId,
  quests,
  setQuests,
  jewelsBalance,
  saveStateToFirestore,
  setActiveModal,
  setShowMessage,
}) => {
  const handleClaimQuest = useCallback(async (questId: string) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to claim rewards.');
      setActiveModal('auth');
      return;
    }

    const questToClaim = quests.find(q => q.id === questId);
    if (!questToClaim || !questToClaim.completed) {
      setShowMessage('⚠️ This quest is not yet completed or does not exist.');
      return;
    }
    if (questToClaim.rewardJEWELS === 0 && questToClaim.rewardXP === 0) {
      setShowMessage('ℹ️ This quest has no rewards to claim.');
      return;
    }

    setShowMessage(`Claiming reward for "${questToClaim.title}"...`);

    try {
      // --- IMPORTANT: Quest reward claiming logic now requires backend Cloud Function ---
      // The client-side app should not directly update 'quests' or 'jewels'
      // due to strict Firestore rules.
      //
      // This client-side code will only simulate the claim and inform the user.
      // A backend Cloud Function would be triggered by a Firestore write (e.g., to a 'claim_requests' collection)
      // and would then update the user's actual jewels and mark the quest as claimed/rewarded.

      // Optimistic local update for UI (rewards are zeroed out locally after "claim")
      const updatedQuests = quests.map(q =>
        q.id === questId ? { ...q, rewardJEWELS: 0, rewardXP: 0 } : q
      );
      setQuests(updatedQuests);

      // Simulate saving state to Firestore (which would trigger backend)
      await saveStateToFirestore({
        // This object would typically contain data for the backend to process the claim
        // e.g., { questId: questToClaim.id, action: 'claim_reward' }
        // The backend would then update jewels and mark quest as truly completed/rewarded
        quests: updatedQuests,
      });

      setShowMessage(`🎉 Claimed ${questToClaim.rewardJEWELS} JEWELS and ${questToClaim.rewardXP} XP from "${questToClaim.title}"! Reward pending backend verification.`);
    } catch (error) {
      console.error('Failed to claim quest reward:', error);
      setShowMessage('⚠️ Failed to claim reward. Please try again.');
    }
  }, [userId, quests, jewelsBalance, setQuests, saveStateToFirestore, setActiveModal, setShowMessage]);

  return (
    <SwytchCard gradient="from-yellow-700/20 to-orange-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Trophy className="w-7 h-7 text-primary" /> Daily Benefits Quests
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Complete these quests to earn extra JEWELS and XP!
      </p>

      <div className="space-y-4">
        {quests.map((quest) => (
          <motion.div
            key={quest.id}
            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h3 className="text-white font-semibold">{quest.title}</h3>
              <p className="text-sm text-gray-400">
                Progress: {quest.progress}/{quest.goal}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {quest.completed ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              {quest.rewardJEWELS > 0 && (
                <span className="text-yellow-400 font-bold flex items-center">
                  +{quest.rewardJEWELS} <Sparkles className="w-4 h-4 ml-1" />
                </span>
              )}
              {quest.rewardXP > 0 && (
                <span className="text-blue-400 font-bold flex items-center">
                  +{quest.rewardXP} XP
                </span>
              )}
              {quest.completed && (quest.rewardJEWELS > 0 || quest.rewardXP > 0) && (
                <motion.button
                  onClick={() => handleClaimQuest(quest.id)}
                  className="btn-primary ml-2 px-3 py-1 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Claim
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default BenefitsQuests;