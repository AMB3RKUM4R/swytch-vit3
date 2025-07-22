// src/components/home/CoreFeaturesShowcase.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gem, Lock, DollarSign, Zap, Sparkles } from 'lucide-react'; // Example icons
import SwytchCard from '../SwytchCard';

interface CoreFeaturesShowcaseProps {
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const features = [
  {
    icon: <Gem className="w-8 h-8 text-yellow-400" />,
    title: 'Real Item Ownership',
    description: 'Truly own your in-game items as NFTs, tradable on the blockchain.',
    gradient: 'from-yellow-700/20 to-orange-700/20',
  },
  {
    icon: <DollarSign className="w-8 h-8 text-green-400" />,
    title: 'Crypto & Fiat Withdrawals',
    description: 'Convert your in-game earnings to crypto or fiat (UPI/PayPal).',
    gradient: 'from-green-700/20 to-teal-700/20',
  },
  {
    icon: <Lock className="w-8 h-8 text-red-400" />,
    title: 'Secure & Transparent',
    description: 'Blockchain-backed security ensures fair play and transparent transactions.',
    gradient: 'from-red-700/20 to-rose-700/20',
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-400" />,
    title: 'Re-innovate Old Games',
    description: 'Experience classic games with new, real-world economic incentives.',
    gradient: 'from-blue-700/20 to-cyan-700/20',
  },
];

const CoreFeaturesShowcase: FC<CoreFeaturesShowcaseProps> = ({ setShowMessage }) => {
  const handleFeatureClick = (title: string) => {
    setShowMessage(`Exploring: ${title}!`);
    // Potentially open a modal with more details or navigate to a specific section
    // setActiveModal('infoModal');
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mb-6">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Key Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <SwytchCard
              gradient={feature.gradient}
              className="p-6 text-center h-full flex flex-col items-center justify-center"
              onClick={() => handleFeatureClick(feature.title)}
            >
              {feature.icon}
              <h3 className="text-xl font-semibold text-white mt-4">{feature.title}</h3>
              <p className="text-sm text-gray-300 mt-2">{feature.description}</p>
            </SwytchCard>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default CoreFeaturesShowcase;
