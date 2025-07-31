// src/components/membership/MembershipBenefits.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gem, Shield, Zap, DollarSign, Award, Star } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface MembershipBenefitsProps {
  // This component is purely presentational, no props needed for now
}

const benefits = [
  {
    icon: Gem,
    title: 'Exclusive JEWELS Bonuses',
    description: 'Receive higher daily and quest rewards in JEWELS.',
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Get faster and dedicated support for all your inquiries.',
  },
  {
    icon: Zap,
    title: 'Increased Energy & Mana Caps',
    description: 'Play longer with higher maximum energy and mana limits.',
  },
  {
    icon: DollarSign,
    title: 'Reduced Marketplace Fees',
    description: 'Enjoy lower transaction fees when buying and selling items.',
  },
  {
    icon: Award,
    title: 'Special Item Drops',
    description: 'Access exclusive in-game item drops and rare NFTs.',
  },
  {
    icon: Star,
    title: 'Early Access',
    description: 'Be among the first to test new games and features in the PETverse.',
  },
];

const MembershipBenefits: FC<MembershipBenefitsProps> = () => {
  return (
    <SwytchCard gradient="from-teal-700/20 to-blue-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Star className="w-7 h-7 text-primary" /> Membership Benefits
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Unlock a world of exclusive advantages in the PETverse!
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

export default MembershipBenefits;