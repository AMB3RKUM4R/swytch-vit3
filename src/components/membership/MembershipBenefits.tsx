// src/components/membership/MembershipBenefits.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, Gem, Shield, Zap, TrendingUp, Users } from 'lucide-react'; // Added Package icon
import SwytchCard from '../SwytchCard';

const benefits = [
  {
    icon: Star,
    title: 'Exclusive Access',
    description: 'Unlock members-only features and content.',
    color: 'text-yellow-400'
  },
  {
    icon: Gem,
    title: 'Bonus Rewards',
    description: 'Earn more JOULES from quests and activities.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Receive expedited assistance from our support team.',
    color: 'text-orange-400'
  },
  {
    icon: Zap,
    title: 'Enhanced Energy',
    description: 'Boost your in-game energy regeneration and caps.',
    color: 'text-cyan-400'
  },
  {
    icon: TrendingUp,
    title: 'Yield Multipliers',
    description: 'Increase your earning multiplier in the Energy Vault.',
    color: 'text-green-400'
  },
  {
    icon: Users,
    title: 'Community Governance',
    description: 'Gain voting rights in the PETverse social architecture.',
    color: 'text-purple-400'
  },
];

const MembershipBenefits: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div key={index} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <SwytchCard variant="holographic" className="p-6 text-center h-full">
              <benefit.icon className={`w-10 h-10 ${benefit.color} mx-auto mb-4`} />
              <h3 className="text-xl font-semibold text-foreground mb-2 font-poppins">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground font-inter">{benefit.description}</p>
            </SwytchCard>
          </motion.div>
        ))}
    </div>
  );
};

export default MembershipBenefits;