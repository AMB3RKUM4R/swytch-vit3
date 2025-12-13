import { FC } from 'react';
import { usePlayer } from '@/components/context/PlayerContext';
import GetGoldButton from '@/components/GetGoldButton';
import CurrencyHUD from '@/components/CurrencyHUD'; 
import { Wallet, Coins, Zap } from 'lucide-react';
import RecentPurchases from '@/components/RecentPurchases';

const WalletPage: FC = () => {
  const { playerData } = usePlayer();
  
  const gold = playerData?.gold || 0;
  const joules = playerData?.joules || 0;

  return (
    <div className="min-h-screen pt-24 px-4 max-w-5xl mx-auto bg-black font-mono text-white">
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-black italic text-white flex items-center gap-4 uppercase tracking-tighter">
            <Wallet className="text-[#39FF14] w-10 h-10" /> Asset Vault
          </h1>
          <CurrencyHUD />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* GOLD CARD */}
        <div className="bg-[#050505] border border-yellow-500/50 p-8 relative overflow-hidden group hover:border-yellow-500 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity grayscale group-hover:grayscale-0">
                <Coins size={120} />
            </div>
            <div className="relative z-10">
                <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-[0.2em] mb-4">Store Credit (Gold)</h3>
                <div className="text-6xl font-black text-white mb-8">{gold.toLocaleString()}</div>
                <GetGoldButton variant="cta" label="ACQUIRE CREDITS" />
            </div>
        </div>

        {/* JOULES CARD */}
        <div className="bg-[#050505] border border-[#39FF14]/50 p-8 relative overflow-hidden group hover:border-[#39FF14] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.05)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={120} className="text-[#39FF14]" />
            </div>
            <div className="relative z-10">
                <h3 className="text-[#39FF14] font-bold text-xs uppercase tracking-[0.2em] mb-4">Energy (Joules)</h3>
                <div className="text-6xl font-black text-white mb-8">{joules.toLocaleString()}</div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                    // PLAY PROTOCOLS TO MINE JOULES
                </p>
            </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Ledger History</h3>
          <RecentPurchases />
      </div>
    </div>
  );
};

export default WalletPage;