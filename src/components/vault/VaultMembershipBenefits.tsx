// src/components/vault/VaultMembershipBenefits.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Star, Gem, Shield, Zap } from 'lucide-react';
import SwytchCard from '../SwytchCard';

const benefits = [
  { icon: Star, title: 'Exclusive Access', description: 'Unlock members-only features.' },
  { icon: Gem, title: 'Bonus Rewards', description: 'Earn more JOULES from quests.' },
  { icon: Shield, title: 'Priority Support', description: 'Expedited assistance channel.' },
  { icon: Zap, title: 'Enhanced Energy', description: 'Boost your energy regeneration.' },
];

const VaultMembershipBenefits: FC = () => {
  return (
    <SwytchCard className="p-6 border-gray-800">
      <h2 className="text-xl font-black italic text-white mb-4 text-center flex items-center justify-center gap-2 uppercase tracking-tighter">
        <Star className="w-5 h-5 text-[#39FF14]" /> Member Protocols
      </h2>
      <p className="text-xs text-gray-500 text-center mb-6 font-mono uppercase">
        ADVANTAGES OF ELITE STATUS
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <motion.div key={index} whileHover={{ y: -3 }}>
            <div className="bg-black p-4 border border-gray-800 hover:border-[#39FF14] transition-colors text-center h-full flex flex-col items-center justify-center group">
              <benefit.icon className="w-8 h-8 text-gray-600 group-hover:text-[#39FF14] mb-3 transition-colors" />
              <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">{benefit.title}</h3>
              <p className="text-[10px] text-gray-500 font-mono uppercase">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default VaultMembershipBenefits;