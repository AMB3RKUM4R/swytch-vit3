import { FC } from 'react';
import { Wallet, Link, DollarSign, Activity, HardHat, User, Zap } from 'lucide-react';
import { VaultWalletInfoProps } from '@/lib/types';

const VaultWalletInfo: FC<VaultWalletInfoProps> = ({
  isConnected,
  address,
  chainId,
  ensName,
  blockNumber,
  gasPrice,
  usdtBalance,
}) => {
    
  const formatBigInt = (value: bigint | null | undefined, unit: string = '') => {
      if (value === null || value === undefined) return 'N/A';
      return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${unit}`;
  }
  
  return (
    <div className="bg-black border border-white/10 p-0">
      <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <Wallet className="w-5 h-5 text-primary" /> 
        <h2 className="font-bold text-white text-sm uppercase tracking-wider">Crypto Wallet Link</h2>
      </div>
      
      <div className="p-6 space-y-3 font-mono">
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-500 text-xs uppercase">
              <Link className="w-4 h-4" /> STATUS
          </div>
          <div className="font-bold text-xs">
              {isConnected ? <span className="text-green-500">CONNECTED</span> : <span className="text-red-500">DISCONNECTED</span>}
          </div>
        </div>
        
        {isConnected && address && (
          <div className="p-3 bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase">
                <User className="w-4 h-4" /> ADDRESS
            </div>
            <p className="text-[10px] text-white break-all">{address}</p>
          </div>
        )}

        {/* Grid Stats */}
        {isConnected && (
            <div className="grid grid-cols-2 gap-3">
                {chainId && (
                    <div className="p-3 bg-white/5 border border-white/10">
                        <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> CHAIN ID</p>
                        <p className="text-sm font-bold text-white">{chainId}</p>
                    </div>
                )}
                {usdtBalance && (
                    <div className="p-3 bg-white/5 border border-white/10">
                        <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> USDT</p>
                        <p className="text-sm font-bold text-green-500">{Number(usdtBalance.formatted).toFixed(2)}</p>
                    </div>
                )}
                {gasPrice !== undefined && (
                    <div className="p-3 bg-white/5 border border-white/10">
                        <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> GAS</p>
                        <p className="text-sm font-bold text-white">{(Number(gasPrice) / 1e9).toFixed(2)} Gwei</p>
                    </div>
                )}
                {blockNumber !== null && (
                    <div className="p-3 bg-white/5 border border-white/10">
                        <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><HardHat className="w-3 h-3" /> BLOCK</p>
                        <p className="text-sm font-bold text-white">{formatBigInt(blockNumber)}</p>
                    </div>
                )}
            </div>
        )}

        {!isConnected && (
          <p className="text-xs text-gray-500 text-center pt-4 uppercase">
            CONNECT WALLET TO VIEW ON-CHAIN DATA
          </p>
        )}
      </div>
    </div>
  );
};

export default VaultWalletInfo;