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
    icon: <MessageSquare className="w-8 h-8 text-[#39FF14]" />,
    title: 'Live Comms',
    description: 'Real-time encrypted chat channels.',
  },
  {
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    title: 'Rankings',
    description: 'Compete for top global operator status.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    title: 'Governance',
    description: 'Vote on decentralized protocol decisions.',
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-purple-500" />,
    title: 'Intel Share',
    description: 'Propose new features and strategies.',
  },
];

const CommunityFeatures: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleFeatureClick = (title: string) => {
    if (!userId) {
      setShowMessage('⚠️ LOGIN REQUIRED');
      setActiveModal('auth');
      return;
    }
    setShowMessage(`ACCESSING: ${title.toUpperCase()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ y: -3 }}>
          <SwytchCard
            className="p-6 text-center h-full flex flex-col items-center justify-center cursor-pointer border-gray-800 hover:border-[#39FF14] transition-colors group"
            onClick={() => handleFeatureClick(feature.title)}
          >
            <div className="mb-4 transition-transform group-hover:scale-110 duration-300">
                {feature.icon}
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 group-hover:text-[#39FF14] transition-colors">{feature.title}</h3>
            <p className="text-[10px] text-gray-500 uppercase">{feature.description}</p>
          </SwytchCard>
        </motion.div>
      ))}
    </div>
  );
};

export default CommunityFeatures;