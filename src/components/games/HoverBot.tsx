import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function HoverBot() {
  const [y, setY] = useState(100);
  const [velocity, setVelocity] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setY(prevY => {
      if (prevY > 230 || prevY < 0) { 
        setPlaying(false);
        setGameOver(true);
        return 100;
      }
      return prevY + velocity;
    });
    
    setVelocity(v => v + 0.2); 
    setScore(s => s + 1); 
    
    if (playing) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing, velocity]);

  const boost = () => {
    setVelocity(-4); 
  };

  const startGame = () => {
    setPlaying(true);
    setVelocity(0);
    setY(100);
    setScore(0);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="HOVER BOT">
      {/* Background Layers */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_4px)] animate-grid-slow" />
        <div className="absolute top-12 left-16 w-2 h-2 bg-[#39FF14]/50 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
        <div className="absolute bottom-16 right-20 w-1.5 h-1.5 bg-[#39FF14]/40 rounded-full animate-float-fast shadow-[0_0_5px_#39FF14]" />
      </div>

      {/* Game Area */}
      <div 
        onMouseDown={boost}
        onTouchStart={(e) => { e.preventDefault(); boost(); }}
        className="relative w-[300px] h-[250px] border-y-8 border-red-500/80 bg-[#0a0a0a] overflow-hidden cursor-pointer shadow-[0_0_50px_rgba(239,68,68,0.4)] rounded-2xl mx-auto mb-8"
      >
        {/* Red Zone Glow */}
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-red-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-red-900/60 to-transparent" />

        {/* Bot */}
        <div 
          className="absolute left-12 w-12 h-12 bg-[#39FF14] border-4 border-white rounded-xl flex items-center justify-center shadow-[0_0_30px_#39FF14] transition-all duration-100"
          style={{ top: `${y}px`, transform: `rotate(${velocity * 6}deg)` }}
        >
          <div className="w-8 h-2 bg-black rounded-full" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent animate-shine" />
        </div>

        {/* Trail Particles */}
        <div className="absolute left-20 w-4 h-4 bg-[#39FF14]/60 rounded-full blur-md" style={{ top: `${y + 40}px` }} />
        <div className="absolute left-16 w-3 h-3 bg-[#39FF14]/40 rounded-full blur-sm" style={{ top: `${y + 50}px` }} />

        {/* Altitude HUD */}
        <div className="absolute top-4 right-4 text-[#39FF14] font-mono text-xl bg-black/60 px-6 py-3 rounded-xl border border-[#39FF14]/60 glow-text-lg animate-score-glow">
            ALTITUDE: {score}
        </div>
      </div>

      {/* Instructions / Start */}
      {!playing && !gameOver && (
        <button onClick={startGame} className="relative z-20 px-12 py-6 bg-[#39FF14] text-black font-black uppercase tracking-[0.3em] text-2xl hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:shadow-[0_0_80px_#39FF14] hover:scale-105">
          IGNITE THRUSTERS
        </button>
      )}
      {playing && <p className="relative z-20 mt-4 text-gray-400 text-lg">HOLD TO HOVER // AVOID RED ZONES</p>}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">CRASH DETECTED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">MAX ALTITUDE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RE-IGNITE
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes grid-slow { 0% { background-position: 0 0; } 100% { background-position: 0 80px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
        @keyframes float-fast { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-22px);} }
        @keyframes shine { 0% { transform: translateX(-150%); } 100% { transform: translateX(150%); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 50px #39FF14; } }
        .animate-grid-slow { animation: grid-slow 35s linear infinite; }
        .animate-float-deep { animation: float-deep 9s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 6s ease-in-out infinite; }
        .animate-shine { animation: shine 2.5s linear infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}