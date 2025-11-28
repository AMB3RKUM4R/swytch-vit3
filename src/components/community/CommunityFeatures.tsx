// src/components/community/CommunityFeatures.tsx
import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trophy, ShieldCheck, Lightbulb } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

interface FeatureItem {
  icon: ReactNode; 
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: <MessageSquare className="w-10 h-10 text-primary" />,
    title: 'Live Chat & Forums',
    description: 'Engage in real-time discussions and share insights with other players.',
  },
  {
    icon: <Trophy className="w-10 h-10 text-yellow-400" />,
    title: 'Leaderboards & Rankings',
    description: 'Compete for top spots and see where you stand among the PETverse elite.',
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-green-400" />,
    title: 'Community Governance',
    description: 'Vote on important decisions and shape the future of the PETverse ecosystem.',
  },
  {
    icon: <Lightbulb className="w-10 h-10 text-purple-400" />,
    title: 'Idea Sharing',
    description: 'Propose new game features, items, and improvements directly to the developers.',
  },
];

const CommunityFeatures: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleFeatureClick = (title: string) => {
    if (!userId) {
      setShowMessage('⚠️ Sign in to explore community features!');
      setActiveModal('auth');
      return;
    }
    setShowMessage(`Exploring: ${title}!`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <SwytchCard
            variant="default"
            className="p-6 text-center h-full flex flex-col items-center justify-center cursor-pointer"
            onClick={() => handleFeatureClick(feature.title)}
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-foreground mt-4 font-poppins">{feature.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 font-inter">{feature.description}</p>
          </SwytchCard>
        </motion.div>
      ))}
    </div>
  );
};

export default CommunityFeatures;