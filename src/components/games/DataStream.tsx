import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

interface GameItem {
  id: number;
  x: number;
  y: number;
  type: string;
}

export default function DataStream() {
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<GameItem[]>([]);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    // Spawn new items
    if (Math.random() < 0.03) {
      setItems(prev => [...prev, { 
        id: Math.random(), 
        x: Math.random() * 280, 
        y: 0, 
        type: Math.random() > 0.3 ? 'good' : 'bad' 
      }]);
    }

    // Move items and check collection
    setItems(prev => {
      const next: GameItem[] = [];
      prev.forEach(item => {
        const newY = item.y + 3;
        if (newY > 230 && newY < 250 && Math.abs(item.x - basketX) < 30) {
           if (item.type === 'good') setScore(s => s + 10);
           else setScore(s => s - 50); 
        } else if (newY < 260) {
           next.push({ ...item, y: newY });
        }
      });
      return next;
    });

    if (playing) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing, basketX]);

  // Auto game over on very low score
  useEffect(() => {
    if (score <= -100 && playing) {
      setPlaying(false);
      setGameOver(true);
    }
  }, [score, playing]);

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setItems([]);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="DATA STREAM">
      {/* Background Layers */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_4px)] animate-grid-slow" />
        <div className="absolute top-16 left-16 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
        <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-[#39FF14]/50 rounded-full animate-float-fast shadow-[0_0_5px_#39FF14]" />
      </div>

      {/* Game Area */}
      <div 
        className="relative w-[300px] h-[260px] border-4 border-[#39FF14]/60 bg-[#050505]/90 overflow-hidden cursor-crosshair rounded-2xl shadow-[0_0_50px_rgba(57,255,20,0.4)] mx-auto mb-8"
        onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setBasketX(e.clientX - rect.left - 20); 
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          setBasketX(touch.clientX - rect.left - 20);
        }}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.03)_0,rgba(57,255,20,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none" />

        {/* Basket */}
        <div 
            className="absolute bottom-4 w-16 h-8 bg-[#39FF14] rounded-t-2xl shadow-[0_0_30px_#39FF14] transition-all duration-100"
            style={{ left: `${basketX}px` }}
        >
          <div className="absolute inset-x-2 top-2 h-1 bg-black/50" />
        </div>

        {/* Items */}
        {items.map(item => (
           <div 
             key={item.id}
             className={`absolute w-6 h-6 rounded-full shadow-[0_0_15px] transition-all duration-100 ${
               item.type === 'good' ? 'bg-white shadow-white' : 'bg-red-500 shadow-red-500'
             }`}
             style={{ left: `${item.x}px`, top: `${item.y}px` }}
           >
             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent animate-pulse" />
           </div>
        ))}
        
        {/* Score */}
        <div className="absolute top-4 left-4 text-[#39FF14] font-black text-3xl bg-black/60 px-6 py-3 rounded-xl border border-[#39FF14]/60 glow-text-lg animate-score-glow">
          DATA: {score}
        </div>
      </div>

      {/* Start Button */}
      {!playing && !gameOver && (
        <button onClick={startGame} className="relative z-20 w-full py-8 border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-3xl transition-all duration-400 shadow-[0_0_50px_white] hover:shadow-[0_0_100px_white] group">
          <span className="relative z-10">CONNECT STREAM</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#39FF14]/50 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">STREAM CORRUPTED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL DATA</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RECONNECT
            </button>
          </div>
        </div>
      )}

      <style >{`
        @keyframes grid-slow { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
        @keyframes float-fast { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 50px #39FF14; } }
        .animate-grid-slow { animation: grid-slow 40s linear infinite; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 7s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}