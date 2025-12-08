import { FC } from 'react';
import { User, Gem, DollarSign, Wallet, Shield } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { useAccount } from 'wagmi';

const UserOverviewCard: FC = () => {
  const { playerData, joulesBalance, goldBalance, isPETMember, currentLevel } = usePlayer();
  useAccount();

  return (
    <div className="bg-black border border-white/10 p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <h2 className="text-xl font-bold text-white font-russo mb-6 flex items-center uppercase tracking-wider">
        <Shield className="inline-block w-6 h-6 mr-3 text-primary" /> Energy Signature
      </h2>
      <div className="grid grid-cols-1 gap-4 font-inter">
        
        {/* Hunter Status */}
        <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 bg-black border border-white/20 flex items-center justify-center">
             <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Hunter Archetype</p>
            <p className="text-lg font-bold text-white truncate max-w-[150px]">{playerData?.character?.selectedID || 'UNASSIGNED'}</p>
          </div>
        </div>
        
        {/* Level */}
        <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 bg-black border border-white/20 flex items-center justify-center">
             <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Protocol Rank</p>
            <p className="text-lg font-bold text-white">LVL {currentLevel}</p>
          </div>
        </div>

        {/* JOULES Balance */}
        <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 hover:border-yellow-500/50 transition-colors">
          <div className="w-10 h-10 bg-black border border-white/20 flex items-center justify-center">
             <Gem className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">JOULES (Yield)</p>
            <p className="text-lg font-bold text-white">{joulesBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Gold Balance */}
        <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 hover:border-green-500/50 transition-colors">
          <div className="w-10 h-10 bg-black border border-white/20 flex items-center justify-center">
             <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">GOLD (Ore)</p>
            <p className="text-lg font-bold text-white">{goldBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Membership Status */}
        <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 hover:border-purple-500/50 transition-colors">
          <div className="w-10 h-10 bg-black border border-white/20 flex items-center justify-center">
             <Wallet className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Beneficiary Status</p>
            <p className={`text-sm font-bold ${isPETMember ? 'text-green-500' : 'text-gray-400'}`}>
              {isPETMember ? 'ACTIVE PROTOCOL' : 'CALIBRATION MODE'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserOverviewCard;