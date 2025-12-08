import { FC, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Share2, Heart, DollarSign, Shield, User, Info, Map, Loader2 } from 'lucide-react'; 
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig'; 
import CurrencyHUD from '@/components/CurrencyHUD'; //

export interface FeedItem {
    type: 'game' | 'item' | 'avatar' | 'arena';
    id: string;
    title: string;
    subtitle: string;
    videoUrl?: string; 
    imageUrl?: string; 
    price?: number; 
    locked?: boolean;
    data?: any; 
}

interface GameTileProps {
    game: FeedItem | any; 
    onGameLaunch: (id: string) => void;
}

const GameTile: FC<GameTileProps> = ({ game, onGameLaunch }) => {
    const { setShowMessage } = useModal();
    const { userId, playerData } = usePlayer();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (actionType: string) => {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 500));

        if (game.type === 'game' || game.type === 'arena') {
            onGameLaunch(game.id);
            setTimeout(() => setIsProcessing(false), 3000); 
        } else {
            setShowMessage(`🛒 OPENING MARKET: ${game.title}`);
            setIsProcessing(false);
        }
    };

    const handleBroadcast = async () => {
        if (!userId) { setShowMessage("⚠️ LOGIN TO SHARE"); return; }
        setShowMessage("📡 BROADCASTING...");
        try {
             await addDoc(collection(db, 'CommunityChat'), {
                userId: userId,
                username: playerData?.username || 'Hunter',
                text: `Check out [${game.title}]!`,
                timestamp: serverTimestamp(),
                attachment: { type: game.type, id: game.id, title: game.title }
            });
            setShowMessage("✅ SHARED");
        } catch (e) { setShowMessage("❌ FAILED"); }
    };

    const getTypeIcon = () => {
        switch(game.type) {
            case 'game': return <Gamepad2 className="w-3 h-3" />;
            case 'item': return <Shield className="w-3 h-3" />;
            case 'avatar': return <User className="w-3 h-3" />;
            case 'arena': return <Map className="w-3 h-3" />;
            default: return <Info className="w-3 h-3" />;
        }
    }

    const mediaSrc = game.videoUrl || game.imageUrl;
    const isVideo = !!game.videoUrl;

    return (
        <motion.div 
            className="relative w-full h-full bg-black border-x border-white/10 overflow-hidden flex flex-col justify-end snap-start group"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
        >
            {/* --- MODIFIED: Absolute HUD for Feed View --- */}
            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <CurrencyHUD className="bg-black/60 backdrop-blur p-2 rounded-lg border border-white/10" />
            </div>

            {/* 1. MEDIA LAYER */}
            <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                {isVideo ? (
                    <video
                        ref={videoRef}
                        src={mediaSrc}
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover opacity-60"
                        poster={`https://placehold.co/450x800/000/44D62C?text=${game.title}`} 
                    />
                ) : (
                    <img 
                        src={mediaSrc} 
                        alt={game.title}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/450x800/222/555?text=NO+IMAGE`;
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* 2. SIDEBAR ACTIONS */}
            <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                    <button className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all group">
                        <Heart className="w-6 h-6 text-white group-hover:text-red-500" />
                    </button>
                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">2.4k</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button onClick={handleBroadcast} className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all group">
                        <Share2 className="w-6 h-6 text-white group-hover:text-primary" />
                    </button>
                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">Share</span>
                </div>
            </div>

            {/* 3. CONTENT INFO */}
            <div className="relative z-20 p-6 pb-8 w-full pr-20">
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-1 bg-primary/20 border border-primary/50 rounded-sm backdrop-blur-md flex items-center gap-1">
                        {getTypeIcon()}
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{game.type}</span>
                    </div>
                    {game.price && (
                        <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-sm backdrop-blur-md">
                            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                                {game.price} J
                            </span>
                        </div>
                    )}
                </div>

                <h2 className="text-3xl md:text-4xl font-black font-russo text-white uppercase leading-none mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-glow-primary">
                    {game.title}
                </h2>
                <p className="text-sm text-white/90 font-mono mb-6 line-clamp-2 drop-shadow-md">
                    {game.subtitle}
                </p>

                <button 
                    onClick={() => handleAction('main_click')}
                    disabled={isProcessing} 
                    className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-80 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin text-black" />
                            <span>INITIALIZING...</span>
                        </>
                    ) : (game.type === 'game' || game.type === 'arena') ? (
                        <>
                            <Play className="w-6 h-6 fill-black stroke-black" /> 
                            {game.type === 'arena' ? 'ENTER ARENA' : 'PLAY NOW'}
                        </>
                    ) : (
                        <>
                            <DollarSign className="w-6 h-6 text-black" /> ACQUIRE ASSET
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default GameTile;