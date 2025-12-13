import { FC } from 'react';
import { User, Gem, DollarSign, Wallet, Shield } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { useAccount } from 'wagmi';

const UserOverviewCard: FC = () => {
  const { playerData, joulesBalance, goldBalance, isPETMember, currentLevel } = usePlayer();
  useAccount();

  return (
    <div className="bg-black border border-gray-800 p-6 shadow-lg font-mono">
      <h2 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-widest gap-2">
        <Shield className="w-5 h-5 text-[#39FF14]" /> Energy Signature
      </h2>
      <div className="grid grid-cols-1 gap-4">
        
        {/* Hunter Status */}
        <div className="flex items-center gap-4 bg-[#050505] p-3 border border-gray-800 hover:border-[#39FF14] transition-colors group">
          <div className="w-10 h-10 bg-black border border-gray-700 flex items-center justify-center group-hover:border-[#39FF14]">
             <User className="w-5 h-5 text-white group-hover:text-[#39FF14]" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Hunter ID</p>
            <p className="text-sm font-bold text-white truncate max-w-[150px]">{playerData?.username || 'UNASSIGNED'}</p>
          </div>
        </div>
        
        {/* Level */}
        <div className="flex items-center gap-4 bg-[#050505] p-3 border border-gray-800 hover:border-[#39FF14] transition-colors group">
          <div className="w-10 h-10 bg-black border border-gray-700 flex items-center justify-center group-hover:border-[#39FF14]">
             <Shield className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Protocol Rank</p>
            <p className="text-sm font-bold text-white">LVL {currentLevel}</p>
          </div>
        </div>

        {/* JOULES */}
        <div className="flex items-center gap-4 bg-[#050505] p-3 border border-gray-800 hover:border-[#39FF14] transition-colors group">
          <div className="w-10 h-10 bg-black border border-gray-700 flex items-center justify-center group-hover:border-[#39FF14]">
             <Gem className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">JOULES (Yield)</p>
            <p className="text-sm font-bold text-[#39FF14]">{joulesBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Gold */}
        <div className="flex items-center gap-4 bg-[#050505] p-3 border border-gray-800 hover:border-yellow-500 transition-colors group">
          <div className="w-10 h-10 bg-black border border-gray-700 flex items-center justify-center group-hover:border-yellow-500">
             <DollarSign className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">GOLD (Credits)</p>
            <p className="text-sm font-bold text-white">{goldBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Membership */}
        <div className="flex items-center gap-4 bg-[#050505] p-3 border border-gray-800 hover:border-purple-500 transition-colors group">
          <div className="w-10 h-10 bg-black border border-gray-700 flex items-center justify-center group-hover:border-purple-500">
             <Wallet className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Status</p>
            <p className={`text-xs font-bold ${isPETMember ? 'text-[#39FF14]' : 'text-gray-500'}`}>
              {isPETMember ? 'ACTIVE' : 'STANDARD'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserOverviewCard;