import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, Gem, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import SwytchCard from '../SwytchCard';

const benefits = [
  { icon: Star, title: 'Exclusive Access', description: 'Unlock members-only features.' },
  { icon: Gem, title: 'Bonus Rewards', description: 'Earn more JOULES from quests.' },
  { icon: Shield, title: 'Priority Support', description: 'Expedited assistance channel.' },
  { icon: Zap, title: 'Enhanced Energy', description: 'Boost energy regeneration.' },
  { icon: TrendingUp, title: 'Yield Multipliers', description: 'Increase earning multiplier.' },
  { icon: Users, title: 'Governance Rights', description: 'Vote on protocol updates.' },
];

const MembershipBenefits: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {benefits.map((benefit, index) => (
          <motion.div key={index} whileHover={{ y: -3 }}>
            <SwytchCard className="p-6 text-center h-full border-gray-800 hover:border-[#39FF14] group transition-colors">
              <benefit.icon className="w-8 h-8 text-[#39FF14] mx-auto mb-4" />
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide group-hover:text-[#39FF14] transition-colors">{benefit.title}</h3>
              <p className="text-[10px] text-gray-500 uppercase leading-relaxed">{benefit.description}</p>
            </SwytchCard>
          </motion.div>
        ))}
    </div>
  );
};

export default MembershipBenefits;