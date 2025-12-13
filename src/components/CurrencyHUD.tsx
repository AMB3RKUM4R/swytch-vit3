import { FC } from 'react';
import { usePlayer } from '@/components/context/PlayerContext'; 
import GetGoldButton from '@/components/GetGoldButton';
import { Zap, Coins } from 'lucide-react'; 

interface CurrencyHUDProps {
  className?: string;
}

const CurrencyHUD: FC<CurrencyHUDProps> = ({ className = "" }) => {
  const { joulesBalance, goldBalance, authLoading, userId } = usePlayer(); 

  // 1. Loading State
  if (authLoading) {
    return <div className="animate-pulse h-8 w-24 bg-gray-900 rounded-sm" />;
  }

  // 2. Guest/Logged Out State
  if (!userId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 font-mono ${className}`}>
        
        {/* JOULES DISPLAY */}
        <div className="hidden md:flex items-center gap-2 bg-black border border-[#39FF14] px-3 py-1.5 rounded-sm shadow-[0_0_10px_rgba(57,255,20,0.1)]">
            <Zap className="w-3 h-3 text-[#39FF14] fill-current" />
            <span className="text-white text-xs font-bold">{joulesBalance.toLocaleString()}</span>
        </div>

        {/* GOLD DISPLAY */}
        <div className="flex items-center gap-2 bg-black border border-yellow-500/50 px-2 py-1 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.1)]">
            <div className="flex items-center gap-2 px-1">
                <Coins className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-yellow-500 font-bold text-xs tracking-wide">{goldBalance.toLocaleString()}</span>
            </div>
            
            <div className="h-4 w-[1px] bg-gray-800 mx-1"></div>
            
            <GetGoldButton variant="hud" />
        </div>

    </div>
  );
};

export default CurrencyHUD;