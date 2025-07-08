import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface DailyQuestsProps {
  userId: string | null;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ userId, quests, setQuests, updatePlayerFirestore }) => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleClaimQuest = (questId: string) => {
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to claim quests!');
      return;
    }
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completed || quest.progress < quest.goal) {
      setShowMessage('⚠️ Quest not ready to claim!');
      return;
    }
    setQuests((prev) => {
      const newQuests = prev.map((q) => (q.id === questId ? { ...q, completed: true } : q));
      updatePlayerFirestore({ quests: newQuests, jewels: (quest?.rewardJEWELS || 0) });
      return newQuests;
    });
    setShowMessage(`✅ Quest Completed: ${quest.title}! +${quest.rewardJEWELS} JEWELS, +${quest.rewardXP} XP`);
    setActiveModal('payment'); // Prompt deposit for more quests
  };

  return (
    <motion.div
      className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="space-y-6 relative">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Target className="w-8 h-8 text-cyan-400 animate-pulse" /> Daily Quests
        </h3>
        <p className="text-gray-300 font-inter">Complete tasks to earn JEWELS and XP!</p>
        <div className="space-y-4">
          {quests.map((quest) => (
            <div key={quest.id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
              <div>
                <p className="text-white font-semibold font-poppins">{quest.title}</p>
                <p className="text-sm text-gray-400 font-inter">
                  Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
                </p>
                <div className="w-32 bg-gray-900 rounded-full h-2 mt-2">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${(quest.progress / quest.goal) * 100}%` }} />
                </div>
              </div>
              <motion.button
                className={`px-4 py-2 rounded-lg font-semibold font-poppins ${
                  quest.progress >= quest.goal && !quest.completed ? 'bg-rose-600 hover:bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => handleClaimQuest(quest.id)}
                disabled={quest.completed || quest.progress < quest.goal}
                whileHover={{ scale: quest.progress >= quest.goal && !quest.completed ? 1.05 : 1 }}
                aria-label={`Claim ${quest.title} reward`}
              >
                {quest.completed ? 'Claimed' : 'Claim'}
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyQuests;