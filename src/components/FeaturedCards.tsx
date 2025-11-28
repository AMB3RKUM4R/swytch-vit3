// src/components/FeaturedCards.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Lock, DollarSign, Zap, ArrowRight, Gem } from 'lucide-react';
import SwytchCard from './SwytchCard';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const features = [
  {
    icon: Gem,
    title: 'True Item Ownership',
    description: 'Your in-game items become real, tradable assets on the blockchain.',
    actionLabel: 'Explore Inventory',
    actionPath: '/inventory',
  },
  {
    icon: DollarSign,
    title: 'Crypto & Fiat Vault',
    description: 'Convert your in-game earnings (JOULES) into crypto or fiat currency.',
    actionLabel: 'Visit Vault',
    actionPath: '/vault',
  },
  {
    icon: Lock,
    title: 'Secure & Transparent',
    description: 'Blockchain-backed security ensures fair play and transparent transactions.',
    actionLabel: 'Read Disclosure',
    actionPath: '/dspet-disclosure',
  },
  {
    icon: Zap,
    title: 'Re-innovate Old Games',
    description: 'Experience classic games with new, real-world economic incentives.',
    actionLabel: 'Explore Games',
    actionPath: '/games',
  },
];

const FeatureCards: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <SwytchCard
            variant="holographic"
            className="p-6 text-center h-full flex flex-col items-center justify-center cursor-pointer"
          >
            <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mt-4 font-poppins">{feature.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 flex-grow">{feature.description}</p>
            <Link
              to={feature.actionPath}
              className="btn-secondary flex items-center justify-center mt-4 w-full"
              onClick={(e) => {
                const restrictedPaths = ['/inventory', '/vault', '/games', '/shop', '/community'];
                if (restrictedPaths.includes(feature.actionPath) && !userId) {
                    setShowMessage('⚠️ Please sign in to access this feature.');
                    setActiveModal('auth');
                    e.preventDefault();
                } else {
                    setShowMessage(`➡️ Navigating to ${feature.actionLabel}!`);
                }
              }}
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