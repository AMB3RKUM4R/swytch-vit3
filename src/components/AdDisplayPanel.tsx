import { FC, useEffect, useRef } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';
import { usePlayer } from './context/PlayerContext';
import { useAdSystem } from '@/hooks/useAdSystem';
import { Zap } from 'lucide-react';

interface AdPanelProps {
  zoneType?: 'native' | 'banner';
}

const AdDisplayPanel: FC<AdPanelProps> = ({ zoneType = 'banner' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const { isPETMember } = usePlayer();
  const { triggerSmartLink } = useAdSystem();

  useEffect(() => {
    if (!adContainerRef.current || !AD_CONFIG.BANNER_ID) return;
    // Banner script injection logic would go here
  }, [zoneType]);

  return (
    <div className="flex flex-col gap-2">
        {/* The Ad Container */}
        <div 
            ref={adContainerRef} 
            className="w-full max-w-[320px] mx-auto flex justify-center items-center min-h-[100px] bg-black/40 border border-gray-800 rounded-sm overflow-hidden relative group"
        >
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
            
            <div className="text-center z-10 p-4">
                <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest block mb-1">
                    // SPONSORED_UPLINK
                </span>
                <div className="text-[#39FF14]/50 text-xs font-bold animate-pulse">
                    [ AWAITING SIGNAL ]
                </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#39FF14]/20 animate-scan"></div>
        </div>

        {/* Member Exclusive: Watch to Earn Button */}
        {isPETMember && (
            <button 
                onClick={triggerSmartLink}
                className="w-full max-w-[320px] mx-auto py-2 bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-bold uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors flex items-center justify-center gap-2"
            >
                <Zap className="w-3 h-3" /> WATCH AD (+10 JOULES)
            </button>
        )}
    </div>
  );
};

export default AdDisplayPanel;