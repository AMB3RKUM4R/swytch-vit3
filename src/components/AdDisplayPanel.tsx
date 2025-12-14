import { FC, useEffect, useRef } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';

export type AdVariant = 'leaderboard' | 'header' | 'square' | 'mobile' | 'skyscraper' | 'tall' | 'social';

interface AdPanelProps {
  variant?: AdVariant;
  className?: string;
}

const AdDisplayPanel: FC<AdPanelProps> = ({ variant = 'header', className = '' }) => {
  // We use two refs: one for the container (banners) and one for tracking the social script
  const containerRef = useRef<HTMLDivElement>(null);
  const socialScriptAdded = useRef(false);

  useEffect(() => {
    // --- 1. HANDLE SOCIAL BAR (The pop-up/overlay script) ---
    // This script needs to be attached to the BODY, not a specific div.
    if (variant === 'social') {
        if (socialScriptAdded.current) return; // Prevent double loading

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = AD_CONFIG.SOCIAL_BAR_URL; 
        
        // Error handling for the script
        script.onerror = () => console.warn("Social Bar Ad blocked by browser/extension");
        
        document.body.appendChild(script);
        socialScriptAdded.current = true;
        
        // Cleanup: Remove script when component unmounts (leaving the game)
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            socialScriptAdded.current = false;
        };
    }

    // --- 2. HANDLE BANNERS (The boxes) ---
    // We use the "Iframe Hack" to bypass React blocking document.write
    if (!containerRef.current) return;

    const config = getConfig(variant);
    if (!config || !config.key) return;

    // Clear previous
    containerRef.current.innerHTML = '';

    // Create a safe Iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';

    containerRef.current.appendChild(iframe);

    // Get the iframe's internal document
    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(`
            <html>
            <body style="margin:0;padding:0;background:transparent;">
                <script type="text/javascript">
                    atOptions = {
                        'key' : '${config.key}',
                        'format' : 'iframe',
                        'height' : ${config.height},
                        'width' : ${config.width},
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="//www.highperformanceformat.com/${config.key}/invoke.js"></script>
            </body>
            </html>
        `);
        doc.close();
    }

  }, [variant]);

  // --- RENDER ---
  
  // If it's the social ad, we render nothing visible (it floats on screen)
  if (variant === 'social') return null;

  const config = getConfig(variant);

  return (
    <div className={`flex justify-center items-center my-4 ${className} relative z-10`}>
        <div 
            className="bg-black/60 border border-gray-800 rounded-sm relative group shadow-lg"
            style={{ 
                width: config?.width, 
                height: config?.height,
                maxWidth: '100%' // Responsive safety
            }}
        >
            {/* The Iframe will be injected here */}
            <div ref={containerRef} className="w-full h-full" />
            
            {/* Visuals */}
            <div className="absolute inset-0 -z-10 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 bg-gray-900 px-1.5 py-0.5 z-20 border-l border-b border-gray-800">
                <span className="text-[8px] font-mono text-gray-500 block leading-none">SPONSORED</span>
            </div>
        </div>
    </div>
  );
};

// Helper for Dimensions
const getConfig = (variant: string) => {
    switch(variant) {
        case 'leaderboard': return AD_CONFIG.BANNER_728x90;
        case 'square': return AD_CONFIG.BANNER_300x250;
        case 'mobile': return AD_CONFIG.BANNER_320x50;
        case 'skyscraper': return AD_CONFIG.BANNER_160x600;
        case 'tall': return AD_CONFIG.BANNER_160x300;
        case 'header': default: return AD_CONFIG.BANNER_468x60;
    }
};

export default AdDisplayPanel;