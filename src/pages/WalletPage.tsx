import { FC } from 'react';
import { usePlayer } from '@/components/context/PlayerContext';
import GetGoldButton from '@/components/GetGoldButton';
import CurrencyHUD from '@/components/CurrencyHUD'; //
import { Wallet, Coins, Zap } from 'lucide-react';
import RecentPurchases from '@/components/RecentPurchases';

const WalletPage: FC = () => {
  const { playerData } = usePlayer();
  
  const gold = playerData?.gold || 0;
  const joules = playerData?.joules || 0;

  return (
    <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-russo text-white flex items-center gap-3">
            <Wallet className="text-primary" /> ASSET VAULT
          </h1>
          {/* Header HUD */}
          <CurrencyHUD />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* GOLD CARD */}
        <div className="bg-[#0f0f0f] border border-yellow-500/30 p-8 rounded-lg relative overflow-hidden group shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coins size={100} />
            </div>
            <div className="relative z-10">
                <h3 className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-2">Gold Balance</h3>
                <div className="text-5xl font-russo text-yellow-500 mb-6">{gold}</div>
                <GetGoldButton variant="cta" label="TOP UP GOLD" />
            </div>
        </div>

        {/* JOULES CARD */}
        <div className="bg-[#0f0f0f] border border-primary/30 p-8 rounded-lg relative overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.05)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={100} />
            </div>
            <div className="relative z-10">
                <h3 className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-2">Energy (Joules)</h3>
                <div className="text-5xl font-russo text-primary mb-6">{joules}</div>
                <p className="text-sm text-gray-500">Play games to earn Joules.</p>
            </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8">
          {/* Uses the RecentPurchases component which has the history logic */}
          <RecentPurchases />
      </div>
    </div>
  );
};

export default WalletPage;