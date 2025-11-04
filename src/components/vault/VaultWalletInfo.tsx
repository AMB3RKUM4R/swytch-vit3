import { FC } from 'react';
import { Wallet, Link, DollarSign, Activity, HardHat, User, Zap } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { VaultWalletInfoProps } from '@/lib/types'; // Import from types

// This component receives props from its parent page (Vault.tsx)

const VaultWalletInfo: FC<VaultWalletInfoProps> = ({
  isConnected,
  address,
  chainId,
  ensName,
  blockNumber,
  gasPrice,
  usdtBalance,
}) => {
  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-6 text-center">
        <Wallet className="inline-block w-7 h-7 mr-2 text-primary" /> Your Crypto Wallet
      </h2>
      <div className="space-y-4 text-foreground font-inter">
        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
          <Link className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{isConnected ? <span className="text-green-400">Connected</span> : <span className="text-red-400">Disconnected</span>}</p>
          </div>
        </div>
        
        {isConnected && address && (
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
          </div>
        )}
        
        {isConnected && ensName && (
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
            <User className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm text-muted-foreground">ENS Name</p>
              <p className="font-semibold">{ensName}</p>
            </div>
          </div>
        )}

        {isConnected && chainId && (
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
            <Activity className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-muted-foreground">Chain ID</p>
              <p className="font-semibold">{chainId}</p>
            </div>
          </div>
        )}
        
        {isConnected && blockNumber !== null && blockNumber !== undefined && (
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
            <HardHat className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm text-muted-foreground">Current Block</p>
              <p className="font-semibold">{blockNumber.toString()}</p>
            </div>
          </div>
        )}

        {isConnected && gasPrice !== undefined && gasPrice !== null && (
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
            <Zap className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm text-muted-foreground">Gas Price</p>
              <p className="font-semibold">{(Number(gasPrice) / 1e9).toFixed(2)} Gwei</p>
            </div>
          </div>
        )}

        {isConnected && usdtBalance && (
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-md border border-border">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-muted-foreground">USDT Balance</p>
              <p className="font-semibold">{Number(usdtBalance.formatted).toFixed(2)} {usdtBalance.symbol}</p>
            </div>
          </div>
        )}

        {!isConnected && (
          <p className="text-sm text-muted-foreground text-center pt-4">
            Connect your wallet to see your on-chain assets and network status.
          </p>
        )}
      </div>
    </SwytchCard>
  );
};

export default VaultWalletInfo;
