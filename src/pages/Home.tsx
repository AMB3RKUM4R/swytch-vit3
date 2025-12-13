import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Dna } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import CurrencyHUD from '@/components/CurrencyHUD';

// --- BATCH 1 (REFLEX) ---
import LuckyHash from '@/components/games/LuckyHash';
import HighLow from '@/components/games/HighLow';
import StopWatchGame from '@/components/games/StopWatchGame';
import CyberSlice from '@/components/games/CyberSlice';
import OrbitBreaker from '@/components/games/OrbitBreaker';
import GlitchNinja from '@/components/games/GlitchNinja';

// --- BATCH 2 (MEMORY) ---
import CyberSimon from '@/components/games/CyberSimon';
import CardHack from '@/components/games/CardHack';
import SequenceEye from '@/components/games/SequenceEye';
import ShellGame from '@/components/games/ShellGame';
import ColorBlind from '@/components/games/ColorBlind';

// --- BATCH 3 (ACTION) ---
import NeonRunner from '@/components/games/NeonRunner';
import VoidShooter from '@/components/games/VoidShooter';
import DataStream from '@/components/games/DataStream';
import WallBall from '@/components/games/WallBall';
import HoverBot from '@/components/games/HoverBot';
import PinCore from '@/components/games/PinCore';

// Game Definition Interface
interface GameDef {
  id: string;
  title: string;
  cat: 'REFLEX' | 'MEMORY' | 'ACTION' | 'RNG';
  component: JSX.Element;
  icon?: JSX.Element;
}

const GAMES: GameDef[] = [
  { id: 'luck', title: 'LUCKY HASH', cat: 'RNG', component: <LuckyHash />, icon: <Zap /> },
  { id: 'hilo', title: 'HIGH / LOW', cat: 'RNG', component: <HighLow />, icon: <Zap /> },
  { id: 'stop', title: 'CHRONO SYNC', cat: 'REFLEX', component: <StopWatchGame />, icon: <Zap /> },
  { id: 'slice', title: 'CYBER SLICE', cat: 'REFLEX', component: <CyberSlice />, icon: <Zap /> },
  { id: 'orbit', title: 'ORBIT BREAKER', cat: 'REFLEX', component: <OrbitBreaker />, icon: <Zap /> },
  { id: 'ninja', title: 'GLITCH HUNT', cat: 'REFLEX', component: <GlitchNinja />, icon: <Zap /> },
  
  { id: 'simon', title: 'CYBER SIMON', cat: 'MEMORY', component: <CyberSimon />, icon: <Brain /> },
  { id: 'cards', title: 'CARD HACK', cat: 'MEMORY', component: <CardHack />, icon: <Brain /> },
  { id: 'seq', title: 'SEQUENCE EYE', cat: 'MEMORY', component: <SequenceEye />, icon: <Brain /> },
  { id: 'shell', title: 'DATA SHUFFLE', cat: 'MEMORY', component: <ShellGame />, icon: <Brain /> },
  { id: 'blind', title: 'PIXEL DIFF', cat: 'MEMORY', component: <ColorBlind />, icon: <Brain /> },

  { id: 'run', title: 'NEON RUNNER', cat: 'ACTION', component: <NeonRunner />, icon: <Dna /> },
  { id: 'shoot', title: 'VOID DEFENDER', cat: 'ACTION', component: <VoidShooter />, icon: <Dna /> },
  { id: 'drop', title: 'DATA STREAM', cat: 'ACTION', component: <DataStream />, icon: <Dna /> },
  { id: 'pong', title: 'WALL BALL', cat: 'ACTION', component: <WallBall />, icon: <Dna /> },
  { id: 'fly', title: 'HOVER BOT', cat: 'ACTION', component: <HoverBot />, icon: <Dna /> },
  { id: 'pin', title: 'PIN CORE', cat: 'ACTION', component: <PinCore />, icon: <Dna /> },
];

const Home: FC = () => {
  usePlayer();
  useModal();
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);
  const [filter, setFilter] = useState('ALL');

  const visibleGames = filter === 'ALL' ? GAMES : GAMES.filter(g => g.cat === filter);

  const handleLaunch = (game: GameDef) => {
      // Optional: Require login to play
      // if (!userId) {
      //     setShowMessage("⚠️ CONNECT WALLET TO ENTER");
      //     setActiveModal('auth');
      //     return;
      // }
      setActiveGame(game);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-mono selection:bg-[#39FF14] selection:text-black">
      
      {/* HEADER HUD */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#39FF14]/20 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          SWYTCH <span className="text-[#39FF14]">ARCADE</span>
        </h1>
        <CurrencyHUD />
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* ACTIVE GAME VIEW */}
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div 
              key="game-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <button 
                onClick={() => setActiveGame(null)}
                className="mb-6 px-6 py-2 border border-gray-600 text-gray-400 hover:border-[#39FF14] hover:text-[#39FF14] transition-colors flex items-center gap-2 uppercase text-sm tracking-widest"
              >
                ← Terminate Session
              </button>
              
              <div className="w-full max-w-md">
                {activeGame.component}
              </div>
            </motion.div>
          ) : (
            
            /* LOBBY GRID VIEW */
            <motion.div 
              key="lobby-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Hero Banner */}
              <div className="relative mb-12 border border-[#39FF14]/30 rounded-xl overflow-hidden bg-[#050505]">
                 <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20"></div>
                 <div className="relative p-8 md:p-12 text-center">
                    <Sparkles className="w-12 h-12 text-[#39FF14] mx-auto mb-4 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-600">Online</span>
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
                        ACCESS 18 HYPER-CASUAL PROTOCOLS. COMPETE FOR HIGH SCORES.
                    </p>
                 </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {['ALL', 'ACTION', 'REFLEX', 'MEMORY', 'RNG'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2 border rounded-full text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                      filter === cat 
                        ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_15px_#39FF14]' 
                        : 'bg-black text-gray-500 border-gray-800 hover:border-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Game Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleGames.map((game) => (
                  <div 
                    key={game.id}
                    onClick={() => handleLaunch(game)}
                    className="group relative h-48 bg-[#0a0a0a] border border-gray-800 hover:border-[#39FF14] cursor-pointer transition-all hover:-translate-y-1 overflow-hidden rounded-lg"
                  >
                    {/* Background Icon Opacity */}
                    <div className="absolute top-4 right-4 text-gray-800 group-hover:text-[#39FF14]/20 transition-colors">
                        {game.icon}
                    </div>

                    <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <div className="text-[#39FF14] text-[10px] font-bold mb-1 tracking-[0.2em]">{game.cat}</div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#39FF14] transition-colors uppercase italic">{game.title}</h3>
                    </div>
                    
                    {/* Scanline Hover Effect */}
                    <div className="absolute inset-0 bg-[#39FF14] opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;