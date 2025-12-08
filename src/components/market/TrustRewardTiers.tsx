import { FC } from 'react';
import { Gem, Lock } from 'lucide-react';

const tiers = [
    { name: 'Bronze', required: 1000, reward: '+10% YIELD', color: 'text-orange-500', border: 'border-orange-500/30' },
    { name: 'Silver', required: 2500, reward: '+15% YIELD / +1 SLOT', color: 'text-gray-300', border: 'border-gray-400/30' },
    { name: 'Gold', required: 5000, reward: '+20% YIELD / GOV VOTE', color: 'text-yellow-400', border: 'border-yellow-500/30' },
];

const TrustRewardTiers: FC = () => {
  return (
    <div className="bg-black border border-white/10 p-6">
        <h3 className="text-sm font-bold font-russo text-white uppercase mb-4 tracking-wider">
            Clearance Levels
        </h3>

        <div className="space-y-3">
            {tiers.map((tier, index) => (
                <div key={index} className={`flex items-center gap-4 p-3 bg-white/5 border ${tier.border}`}>
                    <Gem className={`w-5 h-5 ${tier.color}`} />
                    <div className="flex-grow">
                        <p className={`font-bold text-xs uppercase ${tier.color}`}>{tier.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{tier.reward}</p>
                    </div>
                    <Lock className="w-4 h-4 text-white/20" />
                </div>
            ))}
        </div>
    </div>
  );
};

export default TrustRewardTiers;