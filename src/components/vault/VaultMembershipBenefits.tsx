// src/components/vault/VaultMembershipBenefits.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, Gem, Shield, Zap } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface VaultMembershipBenefitsProps {
  // This component is purely presentational, no props needed for now
}

const benefits = [
  {
    icon: Star,
    title: 'Exclusive Access',
    description: 'Unlock members-only features and content.',
  },
  {
    icon: Gem,
    title: 'Bonus Rewards',
    description: 'Earn more JEWELS from quests and activities.',
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Receive expedited assistance from our support team.',
  },
  {
    icon: Zap,
    title: 'Enhanced Energy',
    description: 'Boost your in-game energy regeneration and caps.',
  },
];

const VaultMembershipBenefits: FC<VaultMembershipBenefitsProps> = () => {
  return (
    <SwytchCard gradient="from-blue-700/20 to-purple-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Star className="w-7 h-7 text-primary" /> Membership Benefits
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Discover the advantages of being a PETverse Member!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center h-full flex flex-col items-center justify-center">
              {benefit.icon && <benefit.icon className="w-8 h-8 text-cyan-400 mb-3" />}
              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-300">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default VaultMembershipBenefits;