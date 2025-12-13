import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function PinCore() {
  const [pins, setPins] = useState<number[]>([]); 
  const [rotation, setRotation] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setRotation(r => (r + 2) % 360); 
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const shoot = () => {
    if (!playing) return;
    
    const currentAngle = (360 - rotation + 90) % 360; 
    
    const collision = pins.some(p => Math.abs(p - currentAngle) < 15);
    
    if (collision) {
      setPlaying(false);
      setGameOver(true);
    } else {
      setPins(prev => [...prev, currentAngle]);
    }
  };

  const startGame = () => {
    setPlaying(true);
    setPins([]);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="PIN THE CORE">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_10px)] animate-grid-med" />
      </div>

      {/* Core */}
      <div className="relative w-96 h-96 flex items-center justify-center mb-12 perspective-[1200px]">
        <div 
          className="w-40 h-40 bg-[#39FF14] rounded-full relative flex items-center justify-center shadow-[0_0_60px_#39FF14] transition-all duration-200"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
           <span className="text-black font-black text-4xl glow-text-lg">{pins.length}</span>
           
           {pins.map((angle, i) => (
             <div 
               key={i}
               className="absolute w-2 h-20 bg-white bottom-1/2 left-1/2 origin-bottom -translate-x-1/2 shadow-[0_0_10px_white]"
               style={{ transform: `rotate(${angle}deg) translateY(80px)` }} 
             >
                <div className="w-4 h-4 bg-red-500 rounded-full absolute top-0 -translate-x-1/2 left-1/2 shadow-[0_0_15px_red]" />
             </div>
           ))}
           
           {/* Glow Rings */}
           <div className="absolute inset-0 rounded-full border-8 border-[#39FF14]/40 animate-ring-expand-1 opacity-60" />
           <div className="absolute inset-0 rounded-full border-4 border-[#39FF14]/60 animate-ring-expand-2 delay-300" />
        </div>

        {/* Shooter */}
        <div className="absolute bottom-20 w-2 h-16 bg-white shadow-[0_0_20px_white]" />
      </div>
      
      {/* Button */}
      <button 
        onMouseDown={!playing ? startGame : shoot} 
        className="relative z-20 w-full py-8 bg-[#111] text-[#39FF14] border-t-4 border-[#39FF14] font-black uppercase tracking-[0.3em] text-2xl hover:bg-[#39FF14] hover:text-black transition-all duration-400 shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:shadow-[0_0_80px_#39FF14] group"
      >
        {!playing ? "START ROTATION" : "FIRE PIN"}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
      </button>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">CORE SHATTERED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">PINS PLACED</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{pins.length}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RESTART CORE
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 120px 120px; } }
        @keyframes ring-expand-1 { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes ring-expand-2 { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(3.5); opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-6px,6px); } 40% { transform: translate(6px,-6px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 60px #39FF14; } }
        .animate-grid-med { animation: grid-med 35s linear infinite; }
        .animate-ring-expand-1 { animation: ring-expand-1 2s ease-out infinite; }
        .animate-ring-expand-2 { animation: ring-expand-2 2.2s ease-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}