// src/components/community/CommunityFeatures.tsx
import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trophy, ShieldCheck, Lightbulb } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface FeatureItem {
  icon: ReactNode; // Changed to ReactNode to directly pass LucideIcon components
  title: string;
  description: string;
  gradient: string;
}

interface CommunityFeaturesProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const features: FeatureItem[] = [
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
    title: 'Live Chat & Forums',
    description: 'Engage in real-time discussions and share insights with other players.',
    gradient: 'from-blue-700/20 to-cyan-700/20',
  },
  {
    icon: <Trophy/>,
    title: 'Leaderboards & Rankings',
    description: 'Compete for top spots and see where you stand among the PETverse elite.',
    gradient: 'from-yellow-700/20 to-orange-700/20',
  },
  {
    icon: <ShieldCheck/>,
    title: 'Community Governance',
    description: 'Vote on important decisions and shape the future of the PETverse ecosystem.',
    gradient: 'from-purple-700/20 to-pink-700/20',
  },
  {
    icon: <Lightbulb/>,
    title: 'Idea Sharing',
    description: 'Propose new game features, items, and improvements directly to the developers.',
    gradient: 'from-green-700/20 to-teal-700/20',
  },
];

const CommunityFeatures: FC<CommunityFeaturesProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const handleFeatureClick = (title: string) => {
    if (!userId) {
      setShowMessage('⚠️ Sign in to explore community features!');
      setActiveModal('auth');
      return;
    }
    setShowMessage(`Exploring: ${title}!`);
    // Potentially navigate to a specific section or open a modal
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <SwytchCard
            gradient={feature.gradient}
            className="p-6 text-center h-full flex flex-col items-center justify-center cursor-pointer"
            onClick={() => handleFeatureClick(feature.title)}
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-white mt-4">{feature.title}</h3>
            <p className="text-sm text-gray-300 mt-2">{feature.description}</p>
          </SwytchCard>
        </motion.div>
      ))}
    </div>
  );
};

export default CommunityFeatures;
