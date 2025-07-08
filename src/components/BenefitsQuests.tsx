
import { FC, memo, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import QuestCard from './QuestCard';
import SwytchErrorBoundary from './ErrorBoundaryComponent';
import { useAccount } from 'wagmi';

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface BenefitsQuestsProps {
  userId: string | null;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  jewelsBalance: number;
  setJewelsBalance: React.Dispatch<React.SetStateAction<number>>;
  saveStateToFirestore: (state: Partial<any>) => Promise<void>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const BenefitsQuests: FC<BenefitsQuestsProps> = memo(({ userId, quests, setQuests, jewelsBalance, setJewelsBalance, saveStateToFirestore, setActiveModal, setShowMessage }) => {
  const { isConnected } = useAccount();

  const handleClaimQuest = (id: string) => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to claim quests!');
      return;
    }
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.completed || quest.progress < quest.goal) {
      setShowMessage('⚠️ Quest not ready to claim!');
      return;
    }
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, completed: true } : q)));
    setJewelsBalance((prev) => prev + quest.rewardJEWELS);
    setShowMessage(`🎉 Quest Completed: ${quest.title}! +${quest.rewardJEWELS} JEWELS, +${quest.rewardXP} XP`);
    saveStateToFirestore({
      jewels: jewelsBalance + quest.rewardJEWELS,
      quests: quests.map((q) => (q.id === id ? { ...q, completed: true } : q)),
    });
    setActiveModal('payment');
  };

  return (
    <SwytchErrorBoundary  setShowMessage={function (_value: SetStateAction<string>): void {
      throw new Error('Function not implemented.');
    } } setActiveModal={function (_value: SetStateAction<string | null>): void {
      throw new Error('Function not implemented.');
    } }>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative bg-noise"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }}
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
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                handleClaimQuest={handleClaimQuest}
                isConnected={isConnected}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>
    </SwytchErrorBoundary>
  );
});

export default BenefitsQuests;
