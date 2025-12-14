import { FC, useEffect, useRef } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';

interface AdPanelProps {
  zoneType?: 'native' | 'banner';
}

const AdDisplayPanel: FC<AdPanelProps> = ({ zoneType = 'banner' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current || !AD_CONFIG.BANNER_ID) return;

    // Placeholder for when you get a real Banner Script from Adsterra
    // adContainerRef.current.innerHTML = '';
    // const script = document.createElement('script');
    // ... insert script logic here later
    
  }, [zoneType]);

  return (
    <div 
        ref={adContainerRef} 
        className="w-full max-w-[320px] mx-auto flex justify-center items-center min-h-[100px] bg-black/40 border border-gray-800 rounded-sm overflow-hidden relative group my-4"
    >
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
        
        {/* Placeholder Text (Visible until you add real banner code) */}
        <div className="text-center z-10 p-4">
            <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest block mb-1">
                // SPONSORED_UPLINK
            </span>
            <div className="text-[#39FF14]/50 text-xs font-bold animate-pulse">
                [ AWAITING SIGNAL ]
            </div>
        </div>
        
        {/* Scanline */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#39FF14]/20 animate-scan"></div>
    </div>
  );
};

export default AdDisplayPanel;