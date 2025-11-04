// src/components/market/TrustRewardTiers.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Award, Gem } from 'lucide-react';
import SwytchCard from '../SwytchCard';

// This component is purely presentational and requires no props

const tiers = [
  {
    level: 1,
    title: 'Bronze Tier',
    pointsRequired: 0,
    benefits: ['Basic marketplace access', 'Standard transaction fees'],
    variant: 'default' as const,
  },
  {
    level: 2,
    title: 'Silver Tier',
    pointsRequired: 1000,
    benefits: ['Reduced transaction fees (5%)', 'Early access to new listings'],
    variant: 'default' as const,
  },
  {
    level: 3,
    title: 'Gold Tier',
    pointsRequired: 5000,
    benefits: ['Further reduced fees (10%)', 'Exclusive item drops', 'Priority support'],
    variant: 'holographic' as const,
  },
  {
    level: 4,
    title: 'Diamond Tier',
    pointsRequired: 10000,
    benefits: ['Zero transaction fees', 'VIP item drops', 'Dedicated account manager'],
    variant: 'holographic' as const,
  },
];

const TrustRewardTiers: FC = () => {
  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Award className="w-7 h-7 text-primary" /> Trust Reward Tiers
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Unlock incredible benefits as your market Trust grows!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <motion.div key={tier.level} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <SwytchCard variant={tier.variant} className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-foreground font-poppins">Tier {tier.level}: {tier.title}</h3>
                <span className="text-sm text-muted-foreground font-inter">{tier.pointsRequired} Points</span>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground flex-grow space-y-1 font-inter">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-primary flex-shrink-0" /> {benefit}
                  </li>
                ))}
              </ul>
              {tier.level > 1 && (
                <p className="text-xs text-muted-foreground/70 mt-3 font-inter">
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
