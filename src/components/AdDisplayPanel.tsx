import { FC, useEffect, useRef } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';

// Define the available variants based on your config
export type AdVariant = 'leaderboard' | 'header' | 'square' | 'mobile' | 'skyscraper' | 'tall';

interface AdPanelProps {
  variant?: AdVariant;
  className?: string;
}

const AdDisplayPanel: FC<AdPanelProps> = ({ variant = 'header', className = '' }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Map variant to config
  const getConfig = () => {
    switch(variant) {
        case 'leaderboard': return AD_CONFIG.BANNER_728x90;
        case 'square': return AD_CONFIG.BANNER_300x250;
        case 'mobile': return AD_CONFIG.BANNER_320x50;
        case 'skyscraper': return AD_CONFIG.BANNER_160x600;
        case 'tall': return AD_CONFIG.BANNER_160x300;
        case 'header': default: return AD_CONFIG.BANNER_468x60;
    }
  };

  useEffect(() => {
    if (!bannerRef.current) return;
    const config = getConfig();
    if (!config.key) return;

    // 1. Clean previous ad to prevent duplication
    bannerRef.current.innerHTML = '';

    // 2. Options Script
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '${config.key}',
        'format' : 'iframe',
        'height' : ${config.height},
        'width' : ${config.width},
        'params' : {}
      };
    `;

    // 3. Invoke Script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${config.key}/invoke.js`;

    // 4. Inject
    bannerRef.current.appendChild(optionsScript);
    bannerRef.current.appendChild(invokeScript);
  }, [variant]);

  const config = getConfig();

  return (
    <div className={`flex justify-center items-center my-4 ${className} relative z-10`}>
        {/* Ad Container */}
        <div 
            className="bg-black/60 border border-gray-800 rounded-sm relative group overflow-hidden shadow-lg"
            style={{ width: config.width, height: config.height }}
        >
            {/* Ad Script Target */}
            <div ref={bannerRef} />
            
            {/* Visual Fallback (Grid Pattern) */}
            <div className="absolute inset-0 -z-10 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
            
            {/* "AD" Label */}
            <div className="absolute top-0 right-0 bg-gray-900 px-1.5 py-0.5 z-20 border-l border-b border-gray-800">
                <span className="text-[8px] font-mono text-gray-500 block leading-none">SPONSORED</span>
            </div>
        </div>
    </div>
  );
};

export default AdDisplayPanel;