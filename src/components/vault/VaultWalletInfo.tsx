// src/components/vault/VaultWalletInfo.tsx
import { FC } from 'react';
import { Wallet, Link, DollarSign, Activity, HardHat, User, Zap } from 'lucide-react'; // Added HardHat for block number
import SwytchCard from '../SwytchCard';
import { VaultWalletInfoProps } from '@/lib/types'; // Import the type

const VaultWalletInfo: FC<VaultWalletInfoProps> = ({
  isConnected,
  address,
  chainId,
  ensName,
  blockNumber,
  feeData,
  usdtBalance,
}) => {
  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center">
        <Wallet className="inline-block w-7 h-7 mr-2 text-primary" /> Your Crypto Wallet
      </h2>
      <div className="space-y-3 text-gray-200">
        <div className="flex items-center gap-2">
          <Link className="w-5 h-5 text-cyan-400" />
          <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
        {address && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <p>Address: <span className="font-mono text-sm break-all">{address}</span></p>
          </div>
        )}
        {ensName && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-yellow-400" />
            <p>ENS Name: <span className="font-semibold">{ensName}</span></p>
          </div>
        )}
        {chainId && (
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <p>Chain ID: <span className="font-semibold">{chainId}</span></p>
          </div>
        )}
        {blockNumber !== null && blockNumber !== undefined && ( // Check for null/undefined
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-orange-400" /> {/* Using HardHat for block number */}
            <p>Current Block: <span className="font-semibold">{blockNumber.toString()}</span></p>
          </div>
        )}
        {feeData?.gasPrice && (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-400" />
            <p>Gas Price: <span className="font-semibold">{(Number(feeData.gasPrice) / 1e9).toFixed(2)} Gwei</span></p>
          </div>
        )}
        {usdtBalance && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <p>USDT Balance: <span className="font-semibold">{Number(usdtBalance.formatted).toFixed(2)} {usdtBalance.symbol}</span></p>
          </div>
        )}
        {!isConnected && (
          <p className="text-sm text-gray-400 text-center mt-4">
            Connect your wallet to see more details and interact with crypto features.
          </p>
        )}
      </div>
    </SwytchCard>
  );
};

export default VaultWalletInfo;
