// src/components/home/UserOverviewCard.tsx
import { FC } from 'react';
import { User, Gem, DollarSign, Wallet } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useAccount } from 'wagmi';

const UserOverviewCard: FC = () => {
  const { playerData, joulesBalance, goldBalance, isPETMember } = usePlayer();
  const { address: wagmiAddress } = useAccount();

  const username = playerData?.username || 'Guest';
  const walletAddress = playerData?.walletAddress || wagmiAddress;

  return (
    <SwytchCard variant="holographic" className="p-6">
      <h2 className="text-3xl font-bold text-foreground font-poppins mb-6 flex items-center">
        <User className="inline-block w-8 h-8 mr-3 text-primary" /> Welcome, {username}!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-inter">
        
        {/* JOULES Balance */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-primary/20">
          <Gem className="w-7 h-7 text-yellow-400" />
          <div>
            <p className="text-sm text-muted-foreground">JOULES Balance</p>
            <p className="text-2xl font-bold text-foreground">{joulesBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Gold Balance */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-green-500/20">
          <DollarSign className="w-7 h-7 text-green-400" />
          <div>
            <p className="text-sm text-muted-foreground">Gold Balance</p>
            <p className="text-2xl font-bold text-foreground">{goldBalance.toFixed(0)}</p>
          </div>
        </div>
        
        {/* Connected Wallet */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-purple-400/20 col-span-1 md:col-span-2">
          <Wallet className="w-7 h-7 text-purple-400" />
          <div>
            <p className="text-sm text-muted-foreground">Connected Wallet</p>
            <p className="text-md font-bold text-foreground break-all">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected'}
            </p>
          </div>
        </div>
        
        {/* Membership Status */}
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg border border-primary/20 col-span-1 md:col-span-2">
          <User className="w-7 h-7 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Membership Status</p>
            <p className="text-md font-bold text-foreground">
              {isPETMember ? 
                <span className="text-green-400">PET Member (Active)</span> : 
                'Non-Member'}
            </p>
          </div>
        </div>

      </div>
    </SwytchCard>
  );
};

export default UserOverviewCard;