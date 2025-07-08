import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Target, MessageCircleHeart } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
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

interface VisionQuestsProps {
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  jewelsBalance: number;
  setJewelsBalance: React.Dispatch<React.SetStateAction<number>>;
  saveStateToFirestore: (state: Partial<any>) => void;
  handleShareOnX: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VisionQuests: FC<VisionQuestsProps> = memo(({ quests, handleShareOnX }) => {
  useModal();


  return (
    <motion.div variants={containerVariants} className="space-y-8 text-center">
      <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Target className="text-cyan-400 w-6 h-6 animate-pulse" /> Vision Quests
      </motion.h2>
      <motion.p variants={fadeUp} className="text-gray-300 max-w-xl mx-auto font-inter">
        Explore the Swytch Vision to earn JEWELS and XP!
      </motion.p>
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} handleClaimQuest={function (): void {
            throw new Error('Function not implemented.');
          } } isConnected={false}  />
        ))}
      </motion.div>
      <motion.button
        variants={fadeUp}
        className="inline-flex items-center px-6 py-3 bg-pink-600 text-white hover:bg-pink-700 rounded-full font-semibold font-poppins"
        onClick={handleShareOnX}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share Swytch Vision on X"
      >
        <MessageCircleHeart className="mr-2 w-5 h-5" /> Share on X
      </motion.button>
    </motion.div>
  );
});

export default VisionQuests;