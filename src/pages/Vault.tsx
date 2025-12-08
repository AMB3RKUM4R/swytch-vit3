import { FC } from 'react';
import { useAccount } from 'wagmi';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { Wallet, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import VaultWalletInfo from '@/components/vault/VaultWalletInfo';
import YieldCalculator from '@/components/vault/YieldCalculator';
import RecentPurchases from '@/components/RecentPurchases';
import VaultRules from '@/components/vault/VaultRules';

export const Vault: FC = () => {
  const { isConnected, address, chainId } = useAccount();
  const { joulesBalance, goldBalance } = usePlayer();
  const { setActiveModal } = useModal();

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 pb-24">
      
      {/* 1. MAIN BALANCE CARD (ATM Style) */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-40 h-40 text-white" />
        </div>
        
        <h2 className="text-white/50 font-mono text-xs tracking-[0.2em] mb-2 uppercase">Total Asset Value</h2>
        <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-5xl md:text-6xl font-black font-russo text-white tracking-tighter text-glow-primary">
                {joulesBalance.toLocaleString()}
            </span>
            <span className="text-primary font-bold text-xl">JOULES</span>
        </div>
        <div className="flex items-center gap-2 mt-1 mb-6">
             <span className="text-xs text-gray-500 font-mono">≈ ${(joulesBalance / 10000).toFixed(2)} USD</span>
             <span className="text-gray-700">|</span>
             <span className="text-xs text-yellow-500 font-mono">{goldBalance.toLocaleString()} GOLD</span>
        </div>

        <div className="flex gap-4 relative z-10">
            <button 
                onClick={() => setActiveModal('payment')}
                className="flex-1 btn-primary h-14 flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(0,255,65,0.2)]"
            >
                <ArrowUpRight className="w-5 h-5" /> INJECT ASSETS
            </button>
            <button 
                onClick={() => setActiveModal('withdraw')}
                className="flex-1 btn-secondary h-14 flex items-center justify-center gap-2 text-lg border-white/20"
            >
                <ArrowDownLeft className="w-5 h-5" /> EXTRACT
            </button>
        </div>
      </div>

      {/* 2. CRYPTO & YIELD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Wallet Status (Using existing component logic prop-drilled) */}
         <div className="space-y-6">
             <div className="bg-card border border-white/10 p-0">
                <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" /> 
                    <h3 className="font-bold text-white text-sm">SECURE_CONNECTION</h3>
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
         <div className="bg-card border border-white/10 p-0 h-full">
             <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" /> 
                <h3 className="font-bold text-white text-sm">YIELD_ESTIMATOR</h3>
             </div>
             <div className="p-4">
                <YieldCalculator />
             </div>
         </div>
      </div>

      {/* 3. HISTORY */}
      <div className="bg-card border border-white/10 p-0 mt-8">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
             <History className="w-5 h-5 text-gray-400" />
             <h3 className="font-bold text-white text-sm">LEDGER_HISTORY</h3>
          </div>
          <div className="p-4">
              <RecentPurchases />
          </div>
      </div>

    </div>
  );
};