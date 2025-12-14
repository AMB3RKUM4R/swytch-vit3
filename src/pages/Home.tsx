import { FC, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Lock, Search, PlayCircle } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { GAME_COST } from '@/lib/types'; 
import CurrencyHUD from '@/components/CurrencyHUD';
import AdDisplayPanel from '@/components/AdDisplayPanel';

// --- GAME IMPORTS ---
import LuckyHash from '@/components/games/LuckyHash';
import HighLow from '@/components/games/HighLow';
import StopWatchGame from '@/components/games/StopWatchGame';
import CyberSlice from '@/components/games/CyberSlice';
import OrbitBreaker from '@/components/games/OrbitBreaker';
import GlitchNinja from '@/components/games/GlitchNinja';
import CyberSimon from '@/components/games/CyberSimon';
import CardHack from '@/components/games/CardHack';
import SequenceEye from '@/components/games/SequenceEye';
import ShellGame from '@/components/games/ShellGame';
import ColorBlind from '@/components/games/ColorBlind';
import NeonRunner from '@/components/games/NeonRunner';
import VoidShooter from '@/components/games/VoidShooter';
import DataStream from '@/components/games/DataStream';
import WallBall from '@/components/games/WallBall';
import HoverBot from '@/components/games/HoverBot';
import PinCore from '@/components/games/PinCore';

// --- ASSETS (Placeholders for the Parallax Look) ---
// In production, replace these with your actual game thumbnails
const GAME_THUMBS = {
    luck: "https://placehold.co/600x800/000000/39FF14?text=LUCKY+HASH",
    hilo: "https://placehold.co/600x400/000000/39FF14?text=HIGH+LOW",
    stop: "https://placehold.co/600x600/000000/39FF14?text=CHRONO",
    slice: "https://placehold.co/600x900/000000/39FF14?text=CYBER+SLICE",
    orbit: "https://placehold.co/600x600/000000/39FF14?text=ORBIT",
    ninja: "https://placehold.co/600x400/000000/39FF14?text=GLITCH+HUNT",
    simon: "https://placehold.co/600x800/000000/39FF14?text=SIMON",
    cards: "https://placehold.co/600x400/000000/39FF14?text=CARD+HACK",
    seq: "https://placehold.co/600x600/000000/39FF14?text=SEQUENCE",
    shell: "https://placehold.co/600x800/000000/39FF14?text=DATA+SHUFFLE",
    blind: "https://placehold.co/600x400/000000/39FF14?text=PIXEL+DIFF",
    run: "https://placehold.co/600x900/000000/39FF14?text=NEON+RUNNER",
    shoot: "https://placehold.co/600x600/000000/39FF14?text=VOID+DEFENDER",
    drop: "https://placehold.co/600x800/000000/39FF14?text=DATA+STREAM",
    pong: "https://placehold.co/600x400/000000/39FF14?text=WALL+BALL",
    fly: "https://placehold.co/600x600/000000/39FF14?text=HOVER+BOT",
    pin: "https://placehold.co/600x800/000000/39FF14?text=PIN+CORE",
};

interface GameDef {
  id: string;
  title: string;
  cat: 'REFLEX' | 'MEMORY' | 'ACTION' | 'RNG';
  component: JSX.Element;
  image: string;
  featured?: boolean; // For larger grid spans
}

const GAMES: GameDef[] = [
  { id: 'run', title: 'NEON RUNNER', cat: 'ACTION', component: <NeonRunner />, image: GAME_THUMBS.run, featured: true },
  { id: 'luck', title: 'LUCKY HASH', cat: 'RNG', component: <LuckyHash />, image: GAME_THUMBS.luck },
  { id: 'shoot', title: 'VOID DEFENDER', cat: 'ACTION', component: <VoidShooter />, image: GAME_THUMBS.shoot },
  { id: 'slice', title: 'CYBER SLICE', cat: 'REFLEX', component: <CyberSlice />, image: GAME_THUMBS.slice, featured: true },
  { id: 'hilo', title: 'HIGH / LOW', cat: 'RNG', component: <HighLow />, image: GAME_THUMBS.hilo },
  { id: 'stop', title: 'CHRONO SYNC', cat: 'REFLEX', component: <StopWatchGame />, image: GAME_THUMBS.stop },
  { id: 'orbit', title: 'ORBIT BREAKER', cat: 'REFLEX', component: <OrbitBreaker />, image: GAME_THUMBS.orbit },
  { id: 'ninja', title: 'GLITCH HUNT', cat: 'REFLEX', component: <GlitchNinja />, image: GAME_THUMBS.ninja },
  { id: 'simon', title: 'CYBER SIMON', cat: 'MEMORY', component: <CyberSimon />, image: GAME_THUMBS.simon, featured: true },
  { id: 'cards', title: 'CARD HACK', cat: 'MEMORY', component: <CardHack />, image: GAME_THUMBS.cards },
  { id: 'seq', title: 'SEQUENCE EYE', cat: 'MEMORY', component: <SequenceEye />, image: GAME_THUMBS.seq },
  { id: 'shell', title: 'DATA SHUFFLE', cat: 'MEMORY', component: <ShellGame />, image: GAME_THUMBS.shell },
  { id: 'blind', title: 'PIXEL DIFF', cat: 'MEMORY', component: <ColorBlind />, image: GAME_THUMBS.blind },
  { id: 'drop', title: 'DATA STREAM', cat: 'ACTION', component: <DataStream />, image: GAME_THUMBS.drop, featured: true },
  { id: 'pong', title: 'WALL BALL', cat: 'ACTION', component: <WallBall />, image: GAME_THUMBS.pong },
  { id: 'fly', title: 'HOVER BOT', cat: 'ACTION', component: <HoverBot />, image: GAME_THUMBS.fly },
  { id: 'pin', title: 'PIN CORE', cat: 'ACTION', component: <PinCore />, image: GAME_THUMBS.pin },
];

const Home: FC = () => {
  const { userId, isPETMember, spendCurrency } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Parallax Effect

  const visibleGames = useMemo(() => {
      let filtered = GAMES;
      if (filter !== 'ALL') filtered = filtered.filter(g => g.cat === filter);
      if (searchTerm) filtered = filtered.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
      return filtered;
  }, [filter, searchTerm]);

  const handleLaunch = async (game: GameDef) => {
      if (!userId) { setShowMessage("⚠️ CONNECT WALLET"); setActiveModal('auth'); return; }
      if (!isPETMember) { setShowMessage("🔒 MEMBERSHIP REQUIRED"); setActiveModal('payment'); return; }
      
      const paid = await spendCurrency(GAME_COST);
      if (paid) {
          setShowMessage(`✅ LOADING ${game.title}...`);
          setActiveGame(game);
      } else {
          setShowMessage(`⚠️ NEED ${GAME_COST} CREDITS`);
          setActiveModal('payment');
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#39FF14] selection:text-black">
      
      {/* 1. HERO PARALLAX HEADER */}
      {!activeGame && (
        <div className="relative h-[60vh] overflow-hidden flex items-center justify-center border-b border-[#39FF14]/20">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
            
            {/* Parallax Content */}
            <motion.div style={{ y: y1 }} className="text-center z-10 p-4">
                <Sparkles className="w-16 h-16 text-[#39FF14] mx-auto mb-4 animate-spin-slow" />
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4 drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                    SWYTCH ARCADE
                </h1>
                <p className="text-gray-400 font-mono text-sm uppercase tracking-[0.5em] mb-8">
                    18 PROTOCOLS // HIGH SCORES // REAL REWARDS
                </p>
                
                {/* Search Bar */}
                <div className="max-w-md mx-auto relative group">
                    <input 
                        type="text" 
                        placeholder="SEARCH PROTOCOLS..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/80 border border-gray-700 rounded-full py-4 px-12 text-sm focus:outline-none focus:border-[#39FF14] transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#39FF14]" />
                </div>
            </motion.div>
        </div>
      )}

      {/* 2. STICKY NAV & HUD */}
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {['ALL', 'ACTION', 'REFLEX', 'MEMORY', 'RNG'].map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                        filter === cat ? 'bg-[#39FF14] text-black' : 'text-gray-500 hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
        <CurrencyHUD />
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        <AnimatePresence mode="wait">
          {activeGame ? (
            // GAME VIEW (Minimalist)
            <motion.div 
              key="game-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="px-6 py-2 border border-gray-700 rounded-full text-gray-400 hover:border-[#39FF14] hover:text-[#39FF14] transition-colors text-xs uppercase tracking-widest"
                  >
                    ← EXIT TO LOBBY
                  </button>
                  <h2 className="text-xl font-black text-white italic">{activeGame.title}</h2>
              </div>
              
              <div className="w-full max-w-md">
                {activeGame.component}
              </div>
            </motion.div>
          ) : (
            
            // MASONRY GRID VIEW
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            >
                {/* 1. First Ad Injection */}
                <div className="break-inside-avoid mb-6">
                    <AdDisplayPanel zoneType="native" />
                </div>

                {visibleGames.map((game) => (
                  <motion.div 
                    key={game.id}
                    layoutId={game.id}
                    className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden bg-gray-900 border border-transparent hover:border-[#39FF14] transition-all duration-300"
                    onClick={() => handleLaunch(game)}
                  >
                    {/* Image */}
                    <div className="relative w-full overflow-hidden">
                        <img 
                            src={game.image} 
                            alt={game.title} 
                            className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                        
                        {/* Play Icon (Appears on Hover) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-[#39FF14] text-black rounded-full p-4 shadow-[0_0_30px_#39FF14]">
                                <PlayCircle className="w-8 h-8" fill="black" />
                            </div>
                        </div>

                        {/* Lock (If Locked) */}
                        {!isPETMember && userId && (
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Meta Data */}
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[#39FF14] text-[10px] font-bold uppercase tracking-widest mb-1">{game.cat}</p>
                                <h3 className="text-xl font-black text-white italic uppercase leading-none">{game.title}</h3>
                            </div>
                            <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <p className="text-[10px] font-mono text-gray-300">-{GAME_COST}</p>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                ))}

                {/* 2. Second Ad Injection (Bottom) */}
                <div className="break-inside-avoid mt-6">
                    <AdDisplayPanel zoneType="banner" />
                </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;