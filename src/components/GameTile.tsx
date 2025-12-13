import { FC, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Share2, Heart, DollarSign, Shield, User, Info, Map, Loader2 } from 'lucide-react'; 
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig'; 
import CurrencyHUD from '@/components/CurrencyHUD'; 

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
    const { setShowMessage, setActiveModal } = useModal(); 
    const { userId, playerData, goldBalance } = usePlayer(); 
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async () => {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 500));

        if (game.type === 'game' || game.type === 'arena') {
            onGameLaunch(game.id);
            setTimeout(() => setIsProcessing(false), 3000); 
        } else {
            if (!userId) {
                setShowMessage("⚠️ LOGIN REQUIRED TO ACQUIRE ASSETS");
                setActiveModal('auth'); 
                setIsProcessing(false);
                return;
            }

            if (game.price && game.price > goldBalance) {
                setShowMessage("⚠️ INSUFFICIENT GOLD! PLEASE TOP UP.");
                setActiveModal('payment'); 
                setIsProcessing(false);
                return;
            }

            setShowMessage(`🛒 ACQUIRING ASSET: ${game.title}`);
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
            className="relative w-full h-full bg-black border-x border-gray-800 overflow-hidden flex flex-col justify-end snap-start group font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
        >
            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <CurrencyHUD className="bg-black/80 backdrop-blur p-2 rounded-sm border border-gray-800" />
            </div>

            <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                {isVideo ? (
                    <video
                        ref={videoRef}
                        src={mediaSrc}
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover opacity-60"
                        poster={`https://placehold.co/450x800/000/39FF14?text=${game.title}`} 
                    />
                ) : (
                    <img 
                        src={mediaSrc} 
                        alt={game.title}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/450x800/111/444?text=NO+IMAGE`;
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                    <button className="p-3 bg-black/50 backdrop-blur-md rounded-full border border-gray-600 hover:border-[#39FF14] transition-all group">
                        <Heart className="w-6 h-6 text-white group-hover:text-[#39FF14]" />
                    </button>
                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">2.4k</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button onClick={handleBroadcast} className="p-3 bg-black/50 backdrop-blur-md rounded-full border border-gray-600 hover:border-[#39FF14] transition-all group">
                        <Share2 className="w-6 h-6 text-white group-hover:text-[#39FF14]" />
                    </button>
                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">Share</span>
                </div>
            </div>

            <div className="relative z-20 p-6 pb-8 w-full pr-20">
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-1 bg-[#39FF14]/10 border border-[#39FF14]/50 rounded-sm backdrop-blur-md flex items-center gap-1">
                        <div className="text-[#39FF14]">{getTypeIcon()}</div>
                        <span className="text-[10px] font-bold text-[#39FF14] uppercase tracking-wider">{game.type}</span>
                    </div>
                    {game.price && (
                        <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/50 rounded-sm backdrop-blur-md">
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                                {game.price} G 
                            </span>
                        </div>
                    )}
                </div>

                <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase leading-none mb-2 drop-shadow-lg tracking-tighter">
                    {game.title}
                </h2>
                <p className="text-xs text-gray-300 font-mono mb-6 line-clamp-2 uppercase tracking-wide">
                    {game.subtitle}
                </p>

                <button 
                    onClick={handleAction} 
                    disabled={isProcessing} 
                    className="w-full bg-[#39FF14] text-black h-14 text-lg font-black uppercase flex items-center justify-center gap-3 hover:bg-white transition-colors disabled:opacity-80 disabled:cursor-not-allowed tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.3)]"
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