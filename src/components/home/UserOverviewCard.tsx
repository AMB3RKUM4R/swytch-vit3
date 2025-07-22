// src/components/home/UserOverviewCard.tsx
import { FC } from 'react';
import { User, Gem, DollarSign, Wallet } from 'lucide-react';
import SwytchCard from '../SwytchCard'; // Re-use SwytchCard for consistent styling

interface UserOverviewCardProps {
  username: string;
  jewelsBalance: number;
  goldBalance: number;
  isPETMember: boolean;
  userId: string | null;
  walletAddress: string | null;
}

const UserOverviewCard: FC<UserOverviewCardProps> = ({
  username,
  jewelsBalance,
  goldBalance,
  isPETMember,
  walletAddress,
}) => {
  return (
    <SwytchCard gradient="from-gray-700/20 to-gray-900/20" className="p-6 text-center">
      <h2 className="text-3xl font-bold text-white font-poppins mb-4">
        <User className="inline-block w-8 h-8 mr-2 text-primary" /> Welcome, {username}!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
          <Gem className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="text-sm text-gray-300">JEWELS Balance</p>
            <p className="text-xl font-bold text-white">{jewelsBalance.toFixed(0)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
          <DollarSign className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-sm text-gray-300">Gold Balance</p>
            <p className="text-xl font-bold text-white">{goldBalance.toFixed(0)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700 col-span-1 md:col-span-2">
          <Wallet className="w-6 h-6 text-purple-400" />
          <div>
            <p className="text-sm text-gray-300">Connected Wallet</p>
            <p className="text-md font-bold text-white break-all">
              {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : 'Not Connected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700 col-span-1 md:col-span-2">
          <User className="w-6 h-6 text-cyan-400" />
          <div>
            <p className="text-sm text-gray-300">Membership Status</p>
            <p className="text-md font-bold text-white">
              {isPETMember ? 'PET Member' : 'Non-Member'}
            </p>
          </div>
        </div>
      </div>
    </SwytchCard>
  );
};

export default UserOverviewCard;
