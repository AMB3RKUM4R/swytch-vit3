import { FC } from 'react';
import { useAccount } from 'wagmi';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownLeft, History, Zap } from 'lucide-react';
import VaultWalletInfo from '@/components/vault/VaultWalletInfo';
import YieldCalculator from '@/components/vault/YieldCalculator';
import RecentPurchases from '@/components/RecentPurchases';
import VaultRules from '@/components/vault/VaultRules';

export const Vault: FC = () => {
  const { isConnected, address, chainId } = useAccount();
  const { joulesBalance, goldBalance } = usePlayer();
  const { setActiveModal } = useModal();

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 pb-24 bg-black min-h-screen font-mono text-white">
      
      {/* 1. MAIN BALANCE CARD */}
      <div className="bg-black border border-[#39FF14] p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(57,255,20,0.1)] rounded-lg">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-64 h-64 text-[#39FF14]" />
        </div>
        
        <h2 className="text-[#39FF14] font-bold text-xs tracking-[0.2em] mb-4 uppercase">Total Asset Value</h2>
        
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 relative z-10 mb-8">
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter shadow-black drop-shadow-lg">
                    {joulesBalance.toLocaleString()}
                </span>
                <span className="text-[#39FF14] font-bold text-xl">JOULES</span>
            </div>
            <div className="h-px w-full md:w-px md:h-12 bg-gray-800"></div>
            <div className="flex items-center gap-3">
                 <span className="text-2xl font-bold text-white">{goldBalance.toLocaleString()}</span>
                 <span className="text-gray-500 text-xs font-bold uppercase">Credits</span>
            </div>
        </div>

        <div className="flex gap-4 relative z-10">
            <button 
                onClick={() => setActiveModal('payment')}
                className="flex-1 h-14 bg-[#39FF14] text-black font-black uppercase text-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
                <ArrowUpRight className="w-5 h-5" /> INJECT
            </button>
            <button 
                onClick={() => setActiveModal('withdraw')}
                className="flex-1 h-14 bg-black border border-white text-white font-bold uppercase text-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
                <ArrowDownLeft className="w-5 h-5" /> EXTRACT
            </button>
        </div>
      </div>

      {/* 2. CRYPTO & YIELD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Wallet Status */}
         <div className="space-y-6">
             <div className="bg-[#050505] border border-gray-800 p-0">
                <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900/30">
                    <ShieldAlert className="w-4 h-4 text-[#39FF14]" /> 
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Secure_Link</h3>
                </div>
                <div className="p-4">
                     <VaultWalletInfo 
                        isConnected={isConnected}
                        address={address}
                        chainId={chainId}
                        ensName={null}
                        blockNumber={null}
                        gasPrice={undefined}
                        usdtBalance={undefined}
                     />
                </div>
             </div>
             
             {/* Rules Accordion */}
             <VaultRules />
         </div>

         {/* Yield Calculator */}
         <div className="bg-[#050505] border border-gray-800 p-0 h-full">
             <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900/30">
                <TrendingUp className="w-4 h-4 text-[#39FF14]" /> 
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Yield_Estimator</h3>
             </div>
             <div className="p-4">
                <YieldCalculator />
             </div>
         </div>
      </div>

      {/* 3. HISTORY */}
      <div className="bg-[#050505] border border-gray-800 p-0 mt-8">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900/30">
             <History className="w-4 h-4 text-gray-400" />
             <h3 className="font-bold text-white text-xs uppercase tracking-wider">Ledger_History</h3>
          </div>
          <div className="p-4">
              <RecentPurchases />
          </div>
      </div>

    </div>
  );
};