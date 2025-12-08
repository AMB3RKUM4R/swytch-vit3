import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Share2, Heart, DollarSign, Shield, User, Info, Map, Swords } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig'; 

export interface FeedItem {
    type: 'game' | 'item' | 'avatar' | 'arena';
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
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

    // --- MONETIZATION ACTION ---
    const handleAction = (actionType: string) => {
        console.log(`[ADSTERRA] Popunder Triggered: ${actionType}`);
        
        if (game.type === 'game' || game.type === 'arena') {
            onGameLaunch(game.id);
        } else if (game.type === 'item' || game.type === 'avatar') {
            setShowMessage(`🛒 OPENING MARKET: ${game.title}`);
        }
    };

    // --- BROADCAST LOGIC ---
    const handleBroadcast = async () => {
        if (!userId || !playerData) {
            setShowMessage("⚠️ LOGIN TO SHARE");
            return;
        }
        setShowMessage("📡 BROADCASTING...");
        try {
             await addDoc(collection(db, 'CommunityChat'), {
                userId: userId,
                username: playerData.username,
                profilePictureUrl: playerData.profilePictureUrl || null,
                text: `Check out [${game.title}]!`,
                timestamp: serverTimestamp(),
                attachment: {
                    type: game.type,
                    id: game.id,
                    title: game.title,
                    image: game.imageUrl
                }
            });
            setShowMessage("✅ SHARED TO FEED");
        } catch (e) {
            setShowMessage("❌ SHARE FAILED");
        }
    };

    // Helper for Icons
    const getTypeIcon = () => {
        switch(game.type) {
            case 'game': return <Gamepad2 className="w-3 h-3" />;
            case 'item': return <Shield className="w-3 h-3" />;
            case 'avatar': return <User className="w-3 h-3" />;
            case 'arena': return <Map className="w-3 h-3" />;
            default: return <Info className="w-3 h-3" />;
        }
    }

    return (
        <motion.div 
            className="relative w-full h-full max-w-lg mx-auto bg-black border-x border-white/10 overflow-hidden flex flex-col justify-end snap-start"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
        >
            {/* 1. FULL BACKGROUND IMAGE */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={game.imageUrl} 
                    alt={game.title} 
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => e.currentTarget.src = `https://placehold.co/600x900/111/44D62C?text=${game.title.replace(' ', '+')}`}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* 2. SIDEBAR ACTIONS (Right Side) */}
            <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                    <button className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all group">
                        <Heart className="w-6 h-6 text-white group-hover:text-red-500" />
                    </button>
                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">1.2k</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button onClick={handleBroadcast} className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all group">
                        <Share2 className="w-6 h-6 text-white group-hover:text-primary" />
                    </button>
                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">Share</span>
                </div>
            </div>

            {/* 3. CONTENT INFO (Bottom Left) */}
            <div className="relative z-20 p-6 pb-24 md:pb-8 w-full pr-20">
                
                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-1 bg-primary/20 border border-primary/50 rounded-sm backdrop-blur-md">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                            {getTypeIcon()}
                            {game.type}
                        </span>
                    </div>
                    {game.price && (
                        <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-sm backdrop-blur-md">
                            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                                {game.price} JOULES
                            </span>
                        </div>
                    )}
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-3xl md:text-4xl font-black font-russo text-white uppercase leading-none mb-2 drop-shadow-lg text-glow-primary">
                    {game.title}
                </h2>
                <p className="text-sm text-white/80 font-mono mb-6 line-clamp-2 drop-shadow-md">
                    {game.subtitle}
                </p>

                {/* Primary Action Button */}
                <button 
                    onClick={() => handleAction('main_click')}
                    className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:scale-[1.02] transition-transform"
                >
                    {(game.type === 'game' || game.type === 'arena') ? (
                        <>
                            <Play className="w-6 h-6 fill-black stroke-black" /> 
                            {game.type === 'arena' ? 'ENTER BATTLEFIELD' : 'LAUNCH SIMULATION'}
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