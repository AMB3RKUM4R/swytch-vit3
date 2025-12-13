import { FC, useEffect, useRef } from 'react';

interface AdPanelProps {
  zoneType: 'native' | 'banner';
}

const AdDisplayPanel: FC<AdPanelProps> = ({ zoneType }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;
    adContainerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    // INSERT ADSTERRA LINKS HERE WHEN READY
    if (zoneType === 'native') {
        console.log("Loading Native Ad...");
    } else {
        console.log("Loading Banner Ad...");
    }
    
    // adContainerRef.current.appendChild(script);

  }, [zoneType]);

  return (
    <div 
        ref={adContainerRef} 
        className="w-full flex justify-center items-center min-h-[100px] bg-black border border-dashed border-gray-800 rounded-sm overflow-hidden relative group"
    >
        {/* Placeholder UI */}
        <div className="text-center">
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest group-hover:text-[#39FF14] transition-colors">
                [ SPONSORED_STREAM :: {zoneType.toUpperCase()} ]
            </span>
        </div>
    </div>
  );
};

export default AdDisplayPanel;