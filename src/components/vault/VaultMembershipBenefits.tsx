// src/components/vault/VaultMembershipBenefits.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, Gem, Shield, Zap } from 'lucide-react';
import SwytchCard from '../SwytchCard';

// This component is purely presentational and requires no props

const benefits = [
  {
    icon: Star,
    title: 'Exclusive Access',
    description: 'Unlock members-only features and content.',
  },
  {
    icon: Gem,
    title: 'Bonus Rewards',
    description: 'Earn more JOULES from quests and activities.',
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

const VaultMembershipBenefits: FC = () => {
  return (
    <SwytchCard variant="holographic" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Star className="w-7 h-7 text-primary" /> Membership Benefits
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Discover the advantages of being a PETverse Member!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div key={index} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <div className="bg-black/20 p-6 rounded-lg border border-border text-center h-full flex flex-col items-center justify-center">
              <benefit.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2 font-poppins">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground font-inter">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default VaultMembershipBenefits;
