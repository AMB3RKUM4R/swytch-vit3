import { FC } from 'react';
import { usePlayer } from '@/components/context/PlayerContext'; //
import GetGoldButton from '@/components/GetGoldButton';
import { Zap, Coins, Loader2 } from 'lucide-react';

interface CurrencyHUDProps {
  className?: string;
}

const CurrencyHUD: FC<CurrencyHUDProps> = ({ className = "" }) => {
  // We use the direct balance properties exposed in your PlayerContext
  const { joulesBalance, goldBalance, authLoading, userId } = usePlayer(); //

  // 1. Loading State
  if (authLoading) {
    return <div className="animate-pulse h-8 w-24 bg-white/5 rounded" />;
  }

  // 2. Guest/Logged Out State - Don't show currency
  if (!userId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
        
        {/* JOULES DISPLAY (Soft Currency) */}
        {/* Hidden on very small screens if space is tight, visible on md+ */}
        <div className="hidden md:flex items-center gap-2 bg-black/40 border border-primary/30 px-3 py-1.5 rounded-md shadow-[0_0_10px_rgba(0,255,65,0.1)]">
            <Zap className="w-3 h-3 text-primary fill-current" />
            <span className="text-white font-mono text-sm font-bold">{joulesBalance.toLocaleString()}</span>
        </div>

        {/* GOLD DISPLAY (Hard Currency) */}
        <div className="flex items-center gap-2 bg-black/80 border border-yellow-500/30 px-2 py-1 rounded-md shadow-[0_0_10px_rgba(234,179,8,0.1)]">
            <div className="flex items-center gap-2 px-1">
                <Coins className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-yellow-500 font-russo text-sm tracking-wide">{goldBalance.toLocaleString()}</span>
            </div>
            
            {/* Divider */}
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            
            {/* The Trigger Button */}
            <GetGoldButton variant="hud" />
        </div>

    </div>
  );
};

export default CurrencyHUD;