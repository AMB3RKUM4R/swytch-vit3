// src/components/home/CoreFeaturesShowcase.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gem, Lock, DollarSign, Zap, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

// This component is now self-sufficient and requires no props.
const CoreFeaturesShowcase: FC = () => {
  // Pull data from our global context
  const { setShowMessage } = useModal();

  const features = [
    {
      icon: <Gem className="w-10 h-10 text-primary" />,
      title: 'Real Item Ownership',
      description: 'Truly own your in-game items as NFTs, tradable on the blockchain.',
    },
    {
      icon: <DollarSign className="w-10 h-10 text-green-400" />,
      title: 'Crypto & Fiat Economy',
      description: 'Convert your in-game earnings to crypto or fiat (PayPal, UPI).',
    },
    {
      icon: <Lock className="w-10 h-10 text-red-400" />,
      title: 'Secure & Transparent',
      description: 'Blockchain-backed security ensures fair play and transparent transactions.',
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-400" />,
      title: 'Cross-Game Assets',
      description: 'Experience classic games with new, real-world economic incentives.',
    },
  ];

  const handleFeatureClick = (title: string) => {
    setShowMessage(`Learn More: ${title}`);
    // Potentially open a modal with more details
    // setActiveModal('infoModal');
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3 font-poppins mb-8">
        <Sparkles className="w-8 h-8 text-primary" /> Key Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <SwytchCard
              variant="holographic"
              className="p-6 text-center h-full flex flex-col items-center justify-center"
              onClick={() => handleFeatureClick(feature.title)}
            >
              {feature.icon}
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-2 font-poppins">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
            </SwytchCard>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default CoreFeaturesShowcase;
