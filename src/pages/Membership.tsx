import { FC } from 'react';
import SwytchLevelsGrid from '@/components/membership/SwytchLevelsGrid';
import { Crown } from 'lucide-react';

const Membership: FC = () => {
  return (
    <div className="p-6 min-h-screen pb-24">
       <div className="text-center mb-12 border-b border-white/10 pb-8">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-russo text-white uppercase">Elite Status</h1>
            <p className="text-gray-500 font-mono">UNLOCK HIGHER YIELDS AND EXCLUSIVE DROPS</p>
       </div>

       <div className="max-w-6xl mx-auto">
           <SwytchLevelsGrid />
       </div>
    </div>
  );
};

export default Membership;