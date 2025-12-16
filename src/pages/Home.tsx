import { FC, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Zap, Search, Crown, Gem, Play } from 'lucide-react'; 
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

// --- ASSETS ---
const GAME_THUMBS = {
    luck: "/games/thumbnails/lucky_hash.jpg",
    hilo: "/games/thumbnails/high_low.jpg",
    stop: "/games/thumbnails/chrono_sync.jpg",
    slice: "/games/thumbnails/cyber_slice.jpg",
    orbit: "/games/thumbnails/orbit_breaker.jpg",
    ninja: "/games/thumbnails/glitch_hunt.jpg",
    simon: "/games/thumbnails/cyber_simon.jpg",
    cards: "/games/thumbnails/card_hack.jpg",
    seq: "/games/thumbnails/sequence_eye.jpg",
    shell: "/games/thumbnails/data_shuffle.jpg",
    blind: "/games/thumbnails/pixel_diff.jpg",
    run: "/games/thumbnails/neon_runner.jpg",
    shoot: "/games/thumbnails/void_defender.jpg",
    drop: "/games/thumbnails/data_stream.jpg",
    pong: "/games/thumbnails/wall_ball.jpg",
    fly: "/games/thumbnails/hover_bot.jpg",
    pin: "/games/thumbnails/pin_core.jpg",
};

interface GameDef {
  id: string;
  title: string;
  cat: 'REFLEX' | 'MEMORY' | 'ACTION' | 'RNG';
  component: JSX.Element;
  image: string;
  featured?: boolean;
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
  const { userId, spendCurrency } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]); 
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  const visibleGames = useMemo(() => {
      let filtered = GAMES;
      if (filter !== 'ALL') filtered = filtered.filter(g => g.cat === filter);
      if (searchTerm) filtered = filtered.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
      return filtered;
  }, [filter, searchTerm]);

  // FIXED: Launch Handler allows Gold OR Joules
  const handleLaunch = async (game: GameDef) => {
      if (launchingId) return;

      if (!userId) { setShowMessage("⚠️ CONNECT WALLET"); setActiveModal('auth'); return; }
      
      try {
        setLaunchingId(game.id); 
        
        await new Promise(r => setTimeout(r, 400));

        // Attempt payment (accepts Gold or Joules via PlayerContext)
        const paid = await spendCurrency(GAME_COST);
        if (paid) {
            setShowMessage(`✅ LOADING ${game.title}...`);
            setActiveGame(game);
        } else {
            setShowMessage(`⚠️ NEED ${GAME_COST} JOULES OR GOLD`);
            setActiveModal('payment');
        }
      } catch (e) {
        console.error("Launch Error", e);
        setShowMessage("❌ SYSTEM ERROR");
      } finally {
        setLaunchingId(null); 
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#39FF14] selection:text-black pb-20">
      
      {/* 1. HERO SECTION */}
      {!activeGame && (
        <div className="relative h-[65vh] overflow-hidden flex items-center justify-center border-b border-[#39FF14]/20 group">
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-cover bg-center opacity-70 transition-transform duration-[10s] ease-in-out group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#050505]"></div>
            
            <motion.div style={{ y: y1, opacity: opacityHero }} className="text-center z-10 px-4 max-w-4xl relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#39FF14]/30 bg-black/60 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
                    </span>
                    <span className="text-[#39FF14] text-xs font-bold tracking-widest uppercase text-shadow-neon">System Online V2.0</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    PLAY. EARN. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-500">DOMINATE.</span>
                </h1>
                
                <div className="max-w-md mx-auto relative group mt-8">
                    <div className="absolute inset-0 bg-[#39FF14] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
                    <input 
                        type="text" 
                        placeholder="SEARCH PROTOCOLS..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full bg-black/80 border border-gray-600 rounded-full py-4 px-12 text-sm text-white focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition-all backdrop-blur-md placeholder:text-gray-500"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#39FF14] z-10" />
                </div>
            </motion.div>
        </div>
      )}

      {/* 2. STICKY NAV */}
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {['ALL', 'ACTION', 'REFLEX', 'MEMORY', 'RNG'].map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all whitespace-nowrap border ${
                        filter === cat 
                        ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_15px_#39FF14]' 
                        : 'bg-black text-gray-500 border-gray-800 hover:border-gray-500'
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
            // --- GAME VIEW ---
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
                    className="px-6 py-2 border border-gray-700 rounded-full text-gray-400 hover:border-[#39FF14] hover:text-[#39FF14] transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
                  >
                    ← ABORT MISSION
                  </button>
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase text-shadow-neon">{activeGame.title}</h2>
              </div>
              
              <div className="w-full max-w-md relative z-10">
                {activeGame.component}
              </div>
            </motion.div>
          ) : (
            
            // --- MASONRY GRID ---
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            >
                {/* HEADER AD */}
                <div className="break-inside-avoid mb-6">
                    <AdDisplayPanel variant="header" />
                </div>

                {/* CALLOUT: BENEFITS */}
                <div className="break-inside-avoid bg-[#39FF14]/10 border border-[#39FF14] p-6 rounded-2xl relative overflow-hidden mb-6 group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Crown className="w-24 h-24 text-[#39FF14]" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic mb-2">ELITE STATUS</h3>
                    <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                        Upgrade to membership to unlock S-Rank Gear and earn <span className="text-[#39FF14]">Joules</span> from ads.
                    </p>
                    <button onClick={() => setActiveModal('payment')} className="px-6 py-3 bg-[#39FF14] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors w-full rounded-sm">
                        UPGRADE NOW
                    </button>
                </div>

                {/* GAME CARDS Loop */}
                {visibleGames.map((game, i) => (
                  <div key={game.id} className="break-inside-avoid">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative group cursor-pointer rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-[#39FF14] transition-all duration-300 shadow-lg"
                        // FIXED: Click handler now works for everyone
                        onClick={() => handleLaunch(game)}
                      >
                        {/* 1. GAME COVER */}
                        <div className="relative w-full overflow-hidden aspect-[3/4]">
                            <img 
                              src={game.image} 
                              alt={game.title} 
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-all duration-300" />
                            
                            {/* 2. CENTER CONTENT - TEXT & ACTIONS */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 text-center">
                                
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-wider drop-shadow-md mb-1 scale-95 group-hover:scale-100 transition-transform duration-300">
                                  {game.title}
                                </h3>
                                
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                                  {game.cat}
                                </span>

                                {/* FIXED: Play Button is now visible to ALL users */}
                                <div className="mt-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                     <div className="flex flex-col items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLaunch(game);
                                            }}
                                            disabled={launchingId === game.id}
                                            className={`
                                                bg-[#39FF14] hover:bg-white text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_15px_#39FF14] transition-all
                                                ${launchingId === game.id ? 'opacity-80 scale-95 cursor-wait' : 'hover:scale-105 active:scale-95'}
                                            `}
                                        >
                                           {launchingId === game.id ? (
                                              <>
                                                 <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                 <span className="font-black text-xs tracking-wider">PROCESSING...</span>
                                              </>
                                           ) : (
                                              <>
                                                 <Play className="w-4 h-4 fill-black" />
                                                 <span className="font-black text-xs tracking-wider">PLAY NOW</span>
                                              </>
                                           )}
                                        </button>

                                        <div className="flex items-center gap-1 text-[#39FF14] text-xs font-mono font-bold bg-black/60 px-2 py-1 rounded border border-[#39FF14]/30 backdrop-blur-md">
                                           <Zap className="w-3 h-3 fill-[#39FF14]" />
                                           <span>{GAME_COST} ENERGY</span>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                      </motion.div>

                      {/* ADS INJECTION */}
                      {i === 3 && (
                          <div className="mt-6">
                              <AdDisplayPanel variant="square" />
                          </div>
                      )}
                      {i === 7 && (
                          <div className="mt-6">
                              <AdDisplayPanel variant="tall" />
                          </div>
                      )}
                  </div>
                ))}

                {/* 2. CALLOUT: ECONOMY */}
                <div className="break-inside-avoid bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6 rounded-2xl relative overflow-hidden mb-6 group hover:border-yellow-500 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Gem className="w-32 h-32 text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-white italic mb-2">POWER UP</h3>
                        <p className="text-gray-400 text-xs mb-4">
                            Running low on credits? Purchase Gold Packs instantly.
                        </p>
                        <button onClick={() => setActiveModal('payment')} className="text-yellow-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                            OPEN VAULT →
                        </button>
                    </div>
                </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. MOBILE STICKY AD */}
        {!activeGame && (
            <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-black/90 backdrop-blur-md border-t border-gray-800 flex justify-center py-2">
                <AdDisplayPanel variant="mobile" />
            </div>
        )}

      </main>
    </div>
  );
};

export default Home;