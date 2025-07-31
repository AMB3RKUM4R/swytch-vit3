// src/components/benefits/BenefitsGrid.tsx
import { FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gem, Shield, Zap, DollarSign, ArrowRight, Award, Star } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { Benefit } from '@/lib/types';

interface BenefitsGridProps {
  expandedBenefit: string | null;
  toggleBenefit: (title: string) => void;
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const benefits: Benefit[] = [
  {
    icon: Gem,
    title: 'True Item Ownership',
    description: 'Your in-game items are truly yours, secured as NFTs on the blockchain.',
    details: 'Every item you earn or acquire in a PETverse game is tokenized, giving you verifiable ownership. This means you can freely trade, sell, or even transfer your digital assets outside the game environment. This fundamentally changes the gaming experience, turning virtual achievements into real-world value.',
  },
  {
    icon: DollarSign,
    title: 'Crypto Withdrawals',
    description: 'Convert your in-game earnings (JEWELS) into real crypto currency.',
    details: 'Seamlessly withdraw your hard-earned JEWELS to your crypto wallet. Our integrated blockchain solutions make cashing out your rewards simple and secure, bridging the gap between your gaming success and real-world financial benefits.',
  },
  {
    icon: Zap,
    title: 'Enhanced Energy & Mana',
    description: 'Boost your in-game energy and mana for longer play sessions and more power.',
    details: 'PET Members and active players receive bonuses to their energy and mana pools, allowing for extended gameplay without interruptions. This benefit ensures you can maximize your time in the PETverse, tackle more challenges, and earn more rewards.',
  },
  {
    icon: Award,
    title: 'Exclusive Rewards & Quests',
    description: 'Access special quests and unique rewards only available to PETverse participants.',
    details: 'Beyond standard gameplay, PETverse offers exclusive daily quests, weekly challenges, and special event rewards. These unique opportunities provide additional JEWELS, rare items, and XP, accelerating your progression and enhancing your overall gaming experience.',
  },
  {
    icon: Star,
    title: 'Community Governance',
    description: 'Influence the future of PETverse games and the platform itself.',
    details: 'As a valued member of the PETverse community, you gain a voice in the platform\'s development. Participate in DAO proposals, vote on new features, game updates, and economic adjustments, ensuring the ecosystem evolves in a way that benefits its players.',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent Ecosystem',
    description: 'Benefit from blockchain security and transparent transaction logs.',
    details: 'All major transactions and item ownership records are secured on a public blockchain, providing unparalleled transparency and immutability. Our robust Firebase backend and smart contracts ensure your data and assets are protected, offering a trustworthy environment for all your gaming and trading activities.',
  },
];

const BenefitsGrid: FC<BenefitsGridProps> = ({
  expandedBenefit,
  toggleBenefit,
  userId,
  setActiveModal,
  setShowMessage,
}) => {
  const handleBenefitClick = (title: string) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to explore benefits in detail.');
      setActiveModal('auth');
      return;
    }
    toggleBenefit(title);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {benefits.map((benefit, index) => (
        <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <SwytchCard
            gradient="from-gray-800/20 to-gray-700/20"
            className="p-6 flex flex-col cursor-pointer"
            onClick={() => handleBenefitClick(benefit.title)}
          >
            <div className="flex items-center gap-4 mb-4">
              {benefit.icon && <benefit.icon className="w-8 h-8 text-primary flex-shrink-0" />}
              <h3 className="text-xl font-bold text-white font-poppins">{benefit.title}</h3>
            </div>
            <p className="text-sm text-gray-300 flex-grow">{benefit.description}</p>
            <AnimatePresence>
              {expandedBenefit === benefit.title && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-gray-400 mt-3"
                >
                  {benefit.details}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              className="mt-4 text-primary text-sm font-semibold flex items-center gap-1"
              onClick={(e) => { e.stopPropagation(); handleBenefitClick(benefit.title); }}
              whileHover={{ x: 5 }}
            >
              {expandedBenefit === benefit.title ? 'Show Less' : 'Learn More'} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </SwytchCard>
        </motion.div>
      ))}
    </div>
  );
};

export default BenefitsGrid;