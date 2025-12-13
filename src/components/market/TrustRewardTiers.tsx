import { FC } from 'react';
import { Gem, Lock } from 'lucide-react';

const tiers = [
    { name: 'Bronze', required: 1000, reward: '+10% YIELD', color: 'text-orange-500', border: 'border-orange-500/30' },
    { name: 'Silver', required: 2500, reward: '+15% YIELD / +1 SLOT', color: 'text-gray-400', border: 'border-gray-500/30' },
    { name: 'Gold', required: 5000, reward: '+20% YIELD / GOV VOTE', color: 'text-yellow-500', border: 'border-yellow-500/30' },
];

const TrustRewardTiers: FC = () => {
  return (
    <div className="bg-black border border-gray-800 p-6 font-mono">
        <h3 className="text-xs font-bold text-white uppercase mb-4 tracking-widest border-b border-gray-800 pb-2">
            Clearance Levels
        </h3>

        <div className="space-y-3">
            {tiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-black border border-gray-800 hover:border-[#39FF14] transition-colors group">
                    <Gem className={`w-4 h-4 ${tier.color}`} />
                    <div className="flex-grow">
                        <p className={`font-bold text-xs uppercase ${tier.color}`}>{tier.name}</p>
                        <p className="text-[9px] text-gray-500 uppercase group-hover:text-white transition-colors">{tier.reward}</p>
                    </div>
                    <Lock className="w-3 h-3 text-gray-700 group-hover:text-[#39FF14]" />
                </div>
            ))}
        </div>
    </div>
  );
};

export default TrustRewardTiers;