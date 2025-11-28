// src/components/market/TrustRewardTiers.tsx
import { FC } from 'react';
import { Gem, Lock, ShieldCheck } from 'lucide-react';
import SwytchCard from '../SwytchCard';

// Mock Trust Tiers
const tiers = [
    { name: 'Bronze Rank', required: 1000, reward: '10% JOULES Bonus', color: 'text-orange-400' },
    { name: 'Silver Rank', required: 2500, reward: '15% JOULES Bonus + Item Slot', color: 'text-gray-400' },
    { name: 'Gold Rank', required: 5000, reward: '20% JOULES Bonus + Governance Vote', color: 'text-yellow-400' },
];

const TrustRewardTiers: FC = () => {
  return (
    <SwytchCard variant="default" className="p-6">
        <h3 className="text-xl font-bold font-poppins text-foreground flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-400" /> Tier Rewards
        </h3>

        <div className="space-y-3">
            {tiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-border">
                    <Gem className={`w-6 h-6 ${tier.color} flex-shrink-0`} />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{tier.name}</p>
                        <p className="text-xs text-muted-foreground">{tier.reward}</p>
                    </div>
                    <Lock className="w-4 h-4 text-white/50" />
                </div>
            ))}
        </div>
        
        <div className="mt-6 text-center">
            <button className="btn-secondary w-full text-sm">
                Unlock Next Tier
            </button>
        </div>
    </SwytchCard>
  );
};

export default TrustRewardTiers;