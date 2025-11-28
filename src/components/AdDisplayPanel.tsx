// src/components/AdDisplayPanel.tsx
import { FC, useCallback, useState } from 'react';
import { DollarSign, Eye, RefreshCw, X } from 'lucide-react';
import SwytchCard from './SwytchCard';
import { useModal } from '@/components/context/ModalContext';

// --- ADSTERRA REAL CONFIGURATION ---
// Using the provided Popunder Zone ID for the visible container placeholder
const ADSTERRA_ZONE_ID = "28043416"; 
const CONTAINER_ID = `adsterra-zone-${ADSTERRA_ZONE_ID}`; 

interface AdDisplayPanelProps {
    zoneType: 'banner' | 'native' | 'popunder';
}

const AdDisplayPanel: FC<AdDisplayPanelProps> = ({ }) => {
    const { setShowMessage } = useModal();
    const [isVisible, setIsVisible] = useState(true);

    const handleAdRefresh = useCallback(() => {
        // Simulates ad refresh by hiding and showing the container
        setIsVisible(false);
        setTimeout(() => {
            setIsVisible(true);
            setShowMessage(`Advertising space refreshed. Zone ID: ${ADSTERRA_ZONE_ID}`);
            // In a production app, you would attempt to reload the ad here.
        }, 500);
    }, [setShowMessage]);
    
    // NOTE: For Popunder/Smartlink, the script needs to be in index.html to fire correctly,
    // but this component provides a visible placeholder and manual interaction point.
    
    if (!isVisible) return null;

    return (
        <SwytchCard variant="default" className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-primary flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> ADVERTISEMENT ZONE
                </h3>
                <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                </button>
            </div>
            
            {/* --- AD EMBED AREA CONTAINER --- */}
            <div 
                id={CONTAINER_ID} // Unique ID for script targeting
                className="w-full h-32 bg-background border border-border flex flex-col items-center justify-center text-center text-sm text-muted-foreground overflow-hidden"
                data-ad-network="Adsterra"
                data-zone-id={ADSTERRA_ZONE_ID}
            >
                {/* This is the placeholder text that will disappear when the Adsterra script loads */}
                <p>
                    ZONE ID: {ADSTERRA_ZONE_ID}<br/>
                    <Eye className="w-4 h-4 inline-block mt-1" />
                    (Waiting for Adsterra Script Injection)
                </p>
            </div>
            
            <button onClick={handleAdRefresh} className="text-xs text-muted-foreground hover:text-primary mt-2">
                <RefreshCw className="w-3 h-3 inline-block mr-1" /> Refresh Ad
            </button>
        </SwytchCard>
    );
};

export default AdDisplayPanel;