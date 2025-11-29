// src/components/home/UserOverviewCard.tsx
import { FC } from 'react';
import { User, Gem, DollarSign, Wallet, Shield } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useAccount } from 'wagmi';

const UserOverviewCard: FC = () => {
  const { playerData, joulesBalance, goldBalance, isPETMember, currentLevel } = usePlayer();
  useAccount();


  return (
    <SwytchCard variant="holographic" className="p-6">
      <h2 className="text-3xl font-bold text-foreground font-poppins mb-6 flex items-center">
        <Shield className="inline-block w-8 h-8 mr-3 text-primary" /> Energy Signature Profile
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-inter">
        
        {/* Hunter Status */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-primary/20">
          <User className="w-7 h-7 text-white" />
          <div>
            <p className="text-sm text-muted-foreground">Hunter Archetype</p>
            <p className="text-2xl font-bold text-foreground">{playerData?.character?.selectedID || 'Unassigned'}</p>
          </div>
        </div>
        
        {/* Level */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-primary/20">
          <Shield className="w-7 h-7 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Protocol Rank</p>
            <p className="text-2xl font-bold text-foreground">LVL {currentLevel}</p>
          </div>
        </div>

        {/* JOULES Balance */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-yellow-400/20">
          <Gem className="w-7 h-7 text-yellow-400" />
          <div>
            <p className="text-sm text-muted-foreground">JOULES (Energy Yield)</p>
            <p className="text-2xl font-bold text-foreground">{joulesBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Gold Balance */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-green-500/20">
          <DollarSign className="w-7 h-7 text-green-400" />
          <div>
            <p className="text-sm text-muted-foreground">GOLD (Raw Mana Ore)</p>
            <p className="text-2xl font-bold text-foreground">{goldBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Membership Status (Full Width) */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-purple-400/20 col-span-1 md:col-span-2">
          <Wallet className="w-7 h-7 text-purple-400" />
          <div>
            <p className="text-sm text-muted-foreground">Beneficiary Status</p>
            <p className="text-md font-bold text-foreground">
              {isPETMember ? 
                <span className="text-green-400">P.E.T. Member (Active Protocol)</span> : 
                'Non-Member (Calibration Mode)'}
            </p>
          </div>
        </div>

      </div>
    </SwytchCard>
  );
};

export default UserOverviewCard;