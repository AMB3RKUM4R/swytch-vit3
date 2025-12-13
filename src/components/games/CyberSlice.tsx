import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function CyberSlice() {
  const [width, setWidth] = useState(200); 
  const [left, setLeft] = useState(0);     
  const [direction, setDirection] = useState(1); 
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const containerWidth = 300; 
  const requestRef = useRef<number>();

  const moveBar = () => {
    setLeft((prev) => {
      let nextPos = prev + (3 * direction); 
      if (nextPos > containerWidth - width || nextPos < 0) {
        setDirection((prevDir) => prevDir * -1); 
        return prev;
      }
      return nextPos;
    });
    requestRef.current = requestAnimationFrame(moveBar);
  };

  useEffect(() => {
    if(playing) requestRef.current = requestAnimationFrame(moveBar);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [direction, playing, width]);

  const handleAction = () => {
    if (!playing) {
      setPlaying(true);
      setScore(0);
      setWidth(200);
      setLeft(0);
      setGameOver(false);
    } else {
      const center = (containerWidth - width) / 2; 
      const diff = Math.abs(left - center); 
      
      if (diff > width) {
        setPlaying(false);
        setWidth(0); 
        setGameOver(true);
      } else if (diff > 5) { 
        setWidth((prev) => prev - diff);
        setScore((prev) => prev + 1);
      } else {
        setScore((prev) => prev + 2); 
      }
    }
  };

  return (
    <SwytchContainer title="CYBER SLICE">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-20 right-20 w-2 h-2 bg-[#39FF14]/50 rounded-full animate-float-fast shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Game Area */}
      <div className="relative h-64 w-[300px] border-x-4 border-dashed border-[#39FF14]/60 bg-[#050505] overflow-hidden mx-auto mb-8 rounded-2xl shadow-[0_0_40px_rgba(57,255,20,0.3)]">
        <div className="absolute top-0 bottom-0 left-1/2 w-[4px] bg-[#39FF14]/80 -translate-x-1/2 z-0 shadow-[0_0_20px_#39FF14]" />
        
        <div 
          className="absolute top-1/2 h-16 bg-[#39FF14] shadow-[0_0_30px_#39FF14] z-10 transition-all duration-100"
          style={{ 
            width: `${width}px`, 
            left: `${left}px`,
            opacity: width > 0 ? 1 : 0.3,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
        </div>
        
        {width <= 0 && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-4xl bg-black/90 z-20 animate-pulse">SIGNAL LOST</div>}
      </div>

      {/* HUD */}
      <div className="relative z-10 mt-4 flex justify-between w-full px-8 text-white font-mono text-xl mb-8">
        <span>WIDTH: <span className="text-[#39FF14] glow-text-lg ml-2 px-4 py-1 bg-black/60 border border-[#39FF14]/60 rounded-xl">{Math.floor(width)}px</span></span>
        <span>SCORE: <span className="text-[#39FF14] glow-text-lg ml-2 px-4 py-1 bg-black/60 border border-[#39FF14]/60 rounded-xl animate-score-glow">{score}</span></span>
      </div>

      {/* Action Button */}
      <button onClick={handleAction} className="relative z-20 w-full py-6 border-4 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-widest text-2xl overflow-hidden shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:shadow-[0_0_80px_rgba(57,255,20,0.7)] transition-all duration-400 group">
        <span className="relative z-10">{playing ? "LOCK POSITION" : "INITIALIZE"}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
      </button>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">SLICE FAILED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL SCORE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={handleAction} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              REINITIALIZE
            </button>
          </div>
        </div>
      )}

      <style >{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
        @keyframes float-fast { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-18px);} }
        @keyframes shine { 0% { transform: translateX(-200%); } 100% { transform: translateX(200%); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 50px #39FF14; } }
        .animate-grid-med { animation: grid-med 25s linear infinite; }
        .animate-float-fast { animation: float-fast 7s ease-in-out infinite; }
        .animate-shine { animation: shine 3s linear infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}