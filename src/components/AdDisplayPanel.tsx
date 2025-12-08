import { FC, useCallback, useState } from 'react';
import { DollarSign, Eye, RefreshCw, X } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

// --- ADSTERRA REAL CONFIGURATION ---
const ADSTERRA_ZONE_ID = "28043416"; 
const CONTAINER_ID = `adsterra-zone-${ADSTERRA_ZONE_ID}`; 

interface AdDisplayPanelProps {
    zoneType: 'banner' | 'native' | 'popunder';
}

const AdDisplayPanel: FC<AdDisplayPanelProps> = ({ }) => {
    const { setShowMessage } = useModal();
    const [isVisible, setIsVisible] = useState(true);

    const handleAdRefresh = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            setIsVisible(true);
            setShowMessage(`AD_ZONE REFRESHED: ${ADSTERRA_ZONE_ID}`);
        }, 500);
    }, [setShowMessage]);
    
    if (!isVisible) return null;

    return (
        <div className="bg-black border border-white/10 p-0 relative mb-6">
            <div className="flex items-center justify-between p-2 bg-white/5 border-b border-white/10">
                <h3 className="text-[10px] font-mono text-primary flex items-center gap-1 uppercase tracking-widest">
                    <DollarSign className="w-3 h-3" /> SPONSORED_CONTENT
                </h3>
                <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-red-500">
                    <X className="w-3 h-3" />
                </button>
            </div>
            
            {/* --- AD EMBED AREA CONTAINER --- */}
            <div 
                id={CONTAINER_ID} 
                className="w-full h-32 bg-black flex flex-col items-center justify-center text-center text-xs text-white/30 overflow-hidden font-mono"
                data-ad-network="Adsterra"
                data-zone-id={ADSTERRA_ZONE_ID}
            >
                <p>
                    ZONE: {ADSTERRA_ZONE_ID}<br/>
                    <Eye className="w-3 h-3 inline-block mt-1 mr-1" />
                    AWAITING SCRIPT INJECTION...
                </p>
            </div>
            
            <button onClick={handleAdRefresh} className="w-full py-1 text-[10px] text-white/20 hover:text-primary hover:bg-white/5 transition-colors font-mono uppercase border-t border-white/10">
                <RefreshCw className="w-3 h-3 inline-block mr-1" /> FORCE REFRESH CYCLE
            </button>
        </div>
    );
};

export default AdDisplayPanel;