import { useState } from 'react';
import SwytchContainer from './SwytchContainer';

export default function SequenceEye() {
  const [grid, setGrid] = useState<(number | null)[]>(Array(16).fill(null)); 
  const [phase, setPhase] = useState("idle"); 
  const [nextNum, setNextNum] = useState(1);
  const [level, setLevel] = useState(3); 
  const [gameOver, setGameOver] = useState(false);
  const [wonRound, setWonRound] = useState(false);

  const startGame = () => {
    const newGrid = Array(16).fill(null);
    const indices = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);
    for(let i = 0; i < level; i++) {
      newGrid[indices[i]] = i + 1; 
    }
    setGrid(newGrid);
    setPhase("memorize");
    setNextNum(1);
    setGameOver(false);
    setWonRound(false);

    setTimeout(() => {
      setPhase("recall");
    }, 2000);
  };

  const handleCellClick = (value: number | null) => {
    if (phase !== "recall" || gameOver) return;

    if (value === nextNum) {
      if (nextNum === level) {
        setWonRound(true);
        setTimeout(() => {
          setLevel(l => Math.min(l + 1, 16));
          setPhase("idle");
          setGameOver(true);
        }, 800);
      } else {
        setNextNum(n => n + 1);
      }
    } else {
      setPhase("lost");
      setGameOver(true);
    }
  };

  const restart = () => {
    setGrid(Array(16).fill(null));
    setPhase("idle");
    setLevel(3);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="SEQUENCE EYE">
      {/* Background layers */}
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_5px)] animate-grid-slow" />
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-2 h-2 bg-[#39FF14]/50 rounded-full animate-float-mid shadow-[0_0_6px_#39FF14]" />
        </div>
      </div>

      <div className="perspective-[1200px] relative z-10 mb-8">
        <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
          {grid.map((val, i) => (
            <div
              key={i}
              onClick={() => handleCellClick(val)}
              className={`group relative w-20 h-20 border-4 rounded-xl cursor-pointer active:scale-95 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_50px_rgba(57,255,20,0.2)] transform-style-preserve-3d hover:[transform:rotateX(10deg)_rotateY(10deg)] backdrop-blur-sm ${
                phase === "memorize" && val ? "border-[#39FF14] bg-[#39FF14]/20 text-[#39FF14] shadow-[0_0_30px_#39FF14]" :
                phase === "recall" && val && val < nextNum ? "border-gray-600 bg-gray-900/50 text-gray-500" :
                phase === "lost" && val ? "border-red-500 bg-red-900/30 text-red-500 animate-pulse" : "border-gray-800 bg-black/60"
              } ${!gameOver && phase === "recall" ? '' : 'pointer-events-none'}`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#39FF14]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center text-3xl font-black h-full">
                {(phase === "memorize" || phase === "lost" || wonRound || (phase === "recall" && val && val < nextNum)) ? val : ""}
              </div>
              {(phase === "memorize" && val) && (
                <div className="absolute inset-0 rounded-xl border-4 border-[#39FF14] animate-ring-expand-1 opacity-70" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 text-white font-mono text-lg mb-8 h-10">
        {phase === "idle" && "READY TO SCAN?"}
        {phase === "memorize" && "MEMORIZE POSITIONS..."}
        {phase === "recall" && `LOCATE NUMBER: ${nextNum}`}
        {wonRound && <span className="text-[#39FF14] glow-text-lg">SUCCESS. LEVEL UP.</span>}
        {phase === "lost" && <span className="text-red-500 animate-pulse">FAILURE. DATA RESET.</span>}
      </div>

      {(phase === "idle" || gameOver) && (
        <button onClick={gameOver ? restart : startGame} className="relative z-20 px-12 py-6 border-3 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-[0.3em] text-xl overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_60px_rgba(57,255,20,0.7)] transition-all duration-400 group hover:scale-[1.05]">
          <span className="relative z-10">{gameOver ? "NEXT ROUND" : "START SCAN"}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && phase === "lost" && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.5)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">SEQUENCE BREACH</h2>
            <p className="text-3xl text-[#39FF14] mb-12">LEVEL REACHED: {level}</p>
            <button onClick={restart} className="px-16 py-6 bg-red-600 text-white font-black text-2xl uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_40px_red] hover:scale-105">
              RETRY SCAN
            </button>
          </div>
        </div>
      )}

      <style >{`
        .perspective-[1200px] { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .hud-panel { @apply bg-black/40 px-6 py-3 rounded-xl backdrop-blur-lg border border-gray-800/60 shadow-[0_10px_30px_rgba(0,0,0,0.4)]; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .animate-grid-med { animation: grid-move 20s linear infinite reverse; }
        @keyframes grid-move { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
        @keyframes ring-expand-1 { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes ring-expand-2 { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-15px);} }
        @keyframes float-fast { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-20px) scale(1.2);} }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 40px #39FF14, 0 0 60px #39FF14; } }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}