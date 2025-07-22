// src/components/FeatureCards.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gem, Lock, DollarSign, Zap, ArrowRight } from 'lucide-react';
import SwytchCard from './SwytchCard'; // Re-use SwytchCard
import { Link } from 'react-router-dom';

interface FeatureCardsProps {
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const features = [
  {
    icon: Gem,
    title: 'True Item Ownership',
    description: 'Your in-game items become real, tradable assets on the blockchain.',
    gradient: 'from-yellow-700/20 to-orange-700/20',
    actionLabel: 'Explore Inventory',
    actionPath: '/inventory',
  },
  {
    icon: DollarSign,
    title: 'Crypto & Fiat Withdrawals',
    description: 'Convert your in-game earnings (JEWELS) into crypto or fiat currency.',
    gradient: 'from-green-700/20 to-teal-700/20',
    actionLabel: 'Visit Vault',
    actionPath: '/vault',
  },
  {
    icon: Lock,
    title: 'Secure & Transparent',
    description: 'Blockchain-backed security ensures fair play and transparent transactions.',
    gradient: 'from-red-700/20 to-rose-700/20',
    actionLabel: 'Read Disclosure',
    actionPath: '/dspet-disclosure',
  },
  {
    icon: Zap,
    title: 'Re-innovate Old Games',
    description: 'Experience classic games with new, real-world economic incentives.',
    gradient: 'from-blue-700/20 to-cyan-700/20',
    actionLabel: 'Explore Games',
    actionPath: '/games',
  },
];

const FeatureCards: FC<FeatureCardsProps> = ({ setShowMessage }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <SwytchCard
            gradient={feature.gradient}
            className="p-6 text-center h-full flex flex-col items-center justify-center cursor-pointer"
            // Using Link for navigation, so onClick on card is optional unless it triggers a modal
            // onClick={() => handleCardClick(feature.title, feature.actionPath)}
          >
            {/* Ensure feature.icon is a valid ReactNode */}
            {typeof feature.icon === 'function' ? <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" /> : feature.icon}
            <h3 className="text-xl font-semibold text-white mt-4 font-poppins">{feature.title}</h3>
            <p className="text-sm text-gray-300 mt-2 flex-grow">{feature.description}</p>
            <Link
              to={feature.actionPath}
              className="btn-secondary flex items-center justify-center mt-4 w-full"
              onClick={() => setShowMessage(`➡️ Navigating to ${feature.actionLabel}!`)}
            >
              {feature.actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </SwytchCard>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureCards;
