// src/components/market/TrustRewardTiers.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Award, Gem } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface TrustRewardTiersProps {
  // No direct props, content is static for now
}

const tiers = [
  {
    level: 1,
    title: 'Bronze Tier',
    pointsRequired: 0,
    benefits: ['Basic marketplace access', 'Standard transaction fees'],
    gradient: 'from-amber-700/20 to-amber-900/20',
  },
  {
    level: 2,
    title: 'Silver Tier',
    pointsRequired: 1000,
    benefits: ['Reduced transaction fees (5%)', 'Early access to new listings'],
    gradient: 'from-gray-400/20 to-gray-600/20',
  },
  {
    level: 3,
    title: 'Gold Tier',
    pointsRequired: 5000,
    benefits: ['Further reduced fees (10%)', 'Exclusive item drops', 'Priority support'],
    gradient: 'from-yellow-400/20 to-yellow-600/20',
  },
  {
    level: 4,
    title: 'Diamond Tier',
    pointsRequired: 10000,
    benefits: ['Zero transaction fees', 'VIP item drops', 'Dedicated account manager'],
    gradient: 'from-blue-400/20 to-blue-600/20',
  },
];

const TrustRewardTiers: FC<TrustRewardTiersProps> = () => {
  return (
    <SwytchCard gradient="from-orange-700/20 to-red-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Award className="w-7 h-7 text-primary" /> Trust Reward Tiers
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Unlock incredible benefits as your market Trust grows!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <motion.div key={tier.level} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <SwytchCard gradient={tier.gradient} className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white font-poppins">Tier {tier.level}: {tier.title}</h3>
                <span className="text-sm text-gray-300">{tier.pointsRequired} Points</span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-200 flex-grow space-y-1">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-yellow-300 flex-shrink-0" /> {benefit}
                  </li>
                ))}
              </ul>
              {tier.level > 1 && (
                <p className="text-xs text-gray-400 mt-3">
                  Requires {tier.pointsRequired} Trust Points
                </p>
              )}
            </SwytchCard>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default TrustRewardTiers;
