import { FC } from 'react';
import { Wallet, Link, DollarSign, Activity, HardHat, User, Zap } from 'lucide-react';
import { VaultWalletInfoProps } from '@/lib/types';

const VaultWalletInfo: FC<VaultWalletInfoProps> = ({
  isConnected,
  address,
  chainId,
  blockNumber,
  gasPrice,
  usdtBalance,
}) => {
    
  const formatBigInt = (value: bigint | null | undefined, unit: string = '') => {
      if (value === null || value === undefined) return 'N/A';
      return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${unit}`;
  }
  
  return (
    <div className="bg-black border border-gray-800 p-0 font-mono">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-[#39FF14]/5">
        <Wallet className="w-4 h-4 text-[#39FF14]" /> 
        <h2 className="font-bold text-[#39FF14] text-xs uppercase tracking-widest">Crypto Wallet Link</h2>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between p-3 bg-black border border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-wider">
              <Link className="w-3 h-3" /> STATUS
          </div>
          <div className="font-bold text-xs">
              {isConnected ? <span className="text-[#39FF14] glow-text">CONNECTED</span> : <span className="text-red-500">OFFLINE</span>}
          </div>
        </div>
        
        {isConnected && address && (
          <div className="p-3 bg-black border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-wider">
                <User className="w-3 h-3" /> ADDRESS
            </div>
            <p className="text-[10px] text-white break-all">{address}</p>
          </div>
        )}

        {/* Grid Stats */}
        {isConnected && (
            <div className="grid grid-cols-2 gap-3">
                {chainId && (
                    <div className="p-3 bg-black border border-gray-800">
                        <p className="text-[9px] text-gray-500 mb-1 flex items-center gap-1 uppercase"><Activity className="w-3 h-3" /> CHAIN ID</p>
                        <p className="text-xs font-bold text-white">{chainId}</p>
                    </div>
                )}
                {usdtBalance && (
                    <div className="p-3 bg-black border border-gray-800">
                        <p className="text-[9px] text-gray-500 mb-1 flex items-center gap-1 uppercase"><DollarSign className="w-3 h-3" /> USDT</p>
                        <p className="text-xs font-bold text-[#39FF14]">{Number(usdtBalance.formatted).toFixed(2)}</p>
                    </div>
                )}
                {gasPrice !== undefined && (
                    <div className="p-3 bg-black border border-gray-800">
                        <p className="text-[9px] text-gray-500 mb-1 flex items-center gap-1 uppercase"><Zap className="w-3 h-3" /> GAS</p>
                        <p className="text-xs font-bold text-white">{(Number(gasPrice) / 1e9).toFixed(2)} Gwei</p>
                    </div>
                )}
                {blockNumber !== null && (
                    <div className="p-3 bg-black border border-gray-800">
                        <p className="text-[9px] text-gray-500 mb-1 flex items-center gap-1 uppercase"><HardHat className="w-3 h-3" /> BLOCK</p>
                        <p className="text-xs font-bold text-white">{formatBigInt(blockNumber)}</p>
                    </div>
                )}
            </div>
        )}

        {!isConnected && (
          <p className="text-[10px] text-gray-600 text-center pt-4 uppercase tracking-wider">
            // INITIALIZE WALLET TO VIEW ON-CHAIN DATA
          </p>
        )}
      </div>
    </div>
  );
};

export default VaultWalletInfo;