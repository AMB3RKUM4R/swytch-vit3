import { FC, useEffect, useRef } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';
import { usePlayer } from './context/PlayerContext';
import { useAdSystem } from '@/hooks/useAdSystem';
import { Zap } from 'lucide-react';

interface AdPanelProps {
  zoneType?: 'native' | 'banner';
}

const AdDisplayPanel: FC<AdPanelProps> = ({ zoneType = 'banner' }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { isPETMember } = usePlayer();
  const { triggerSmartLink } = useAdSystem();

  useEffect(() => {
    if (!bannerRef.current) return;

    // 1. Clear any existing ad to prevent duplicates
    bannerRef.current.innerHTML = '';

    // 2. Create the Options Script
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '${AD_CONFIG.BANNER_KEY}',
        'format' : 'iframe',
        'height' : ${AD_CONFIG.BANNER_HEIGHT},
        'width' : ${AD_CONFIG.BANNER_WIDTH},
        'params' : {}
      };
    `;

    // 3. Create the Invoke Script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${AD_CONFIG.BANNER_KEY}/invoke.js`;

    // 4. Append nicely to the container
    // Note: We append options first, then the invoker
    bannerRef.current.appendChild(optionsScript);
    bannerRef.current.appendChild(invokeScript);

  }, [zoneType]);

  return (
    <div className="flex flex-col gap-2 items-center my-4">
        
        {/* The Ad Container */}
        <div 
            className="bg-black/40 border border-gray-800 rounded-sm overflow-hidden relative flex justify-center items-center"
            style={{ 
                width: `${AD_CONFIG.BANNER_WIDTH}px`, 
                height: `${AD_CONFIG.BANNER_HEIGHT}px`,
                maxWidth: '100%' // Responsive safety
            }}
        >
            {/* The Ad Script injects here */}
            <div ref={bannerRef} />
            
            {/* Fallback Background (Visible while ad loads) */}
            <div className="absolute inset-0 -z-10 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#39FF14]/20 animate-scan -z-10"></div>
        </div>

        {/* Member Exclusive: Watch to Earn Button */}
        {isPETMember && (
            <button 
                onClick={triggerSmartLink}
                className="py-2 px-6 bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-bold uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors flex items-center justify-center gap-2"
                style={{ width: `${AD_CONFIG.BANNER_WIDTH}px`, maxWidth: '100%' }}
            >
                <Zap className="w-3 h-3" /> WATCH AD (+10 JOULES)
            </button>
        )}
    </div>
  );
};

export default AdDisplayPanel;