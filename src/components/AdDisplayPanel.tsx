// src/components/AdDisplayPanel.tsx
import { FC, useEffect, useRef } from 'react';

interface AdPanelProps {
  zoneType: 'native' | 'banner';
}

const AdDisplayPanel: FC<AdPanelProps> = ({ zoneType }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // 1. CLEAR previous ads so they don't stack up
    adContainerRef.current.innerHTML = '';

    // 2. CREATE the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    // ---------------------------------------------------------
    // 🔴 PASTE YOUR ADSTERRA LINKS BELOW
    // ---------------------------------------------------------
    if (zoneType === 'native') {
        // NATIVE BANNER (For Feed)
        // script.src = '//pl253456.pestlo.com/44/1a/bc/441abc...js'; 
        console.log("Loading Native Ad...");
    } else {
        // STANDARD BANNER (For Shop)
        // script.src = '//pl253456.pestlo.com/99/88/77/998877...js';
        console.log("Loading Banner Ad...");
    }
    // ---------------------------------------------------------

    // 3. INJECT the script into the div
    // NOTE: Only uncomment the appendChild line below once you have added your URLs above!
    // adContainerRef.current.appendChild(script);

  }, [zoneType]);

  return (
    <div 
        ref={adContainerRef} 
        className="w-full flex justify-center items-center min-h-[100px] bg-white/5 rounded-lg overflow-hidden border border-white/5"
    >
        {/* Placeholder text so you can see where ads SHOULD be */}
        <span className="text-xs text-white/20 font-mono uppercase">
            [ ADSTERRA: {zoneType.toUpperCase()} ZONE ]
        </span>
    </div>
  );
};

export default AdDisplayPanel;