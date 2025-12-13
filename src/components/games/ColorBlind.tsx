import { useState } from 'react';
import SwytchContainer from './SwytchContainer';

export default function ColorBlind() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [targetIndex, setTargetIndex] = useState(Math.floor(Math.random() * 16));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const getOpacity = () => Math.min(0.7 + (level * 0.02), 0.95);

  const handleClick = (index: number) => {
    if (gameOver) return;
    if (index === targetIndex) {
      setScore(s => s + 1);
      setLevel(l => l + 1);
      setTargetIndex(Math.floor(Math.random() * 16));
      if (level + 1 > 20) { // win condition
        setGameOver(true);
        setWon(true);
      }
    } else {
      setGameOver(true);
      setWon(false);
      setLevel(1);
    }
  };

  const restart = () => {
    setScore(0);
    setLevel(1);
    setTargetIndex(Math.floor(Math.random() * 16));
    setGameOver(false);
    setWon(false);
  };

  return (
    <SwytchContainer title="PIXEL DIFF">
      {/* Multi-Layered Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute inset-0">
          <div className="absolute top-12 left-12 w-2 h-2 bg-[#39FF14]/50 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
          <div className="absolute bottom-20 right-16 w-1.5 h-1.5 bg-[#39FF14]/40 rounded-full animate-float-fast shadow-[0_0_5px_#39FF14]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_70%)]" />
      </div>

      {/* Grid with 3D layered cells */}
      <div className="perspective-[1200px] relative z-10 mb-10">
        <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              onClick={() => handleClick(i)}
              style={{
                backgroundColor: '#39FF14',
                opacity: i === targetIndex ? getOpacity() : 1
              }}
              className={`group relative w-20 h-20 rounded-xl cursor-pointer active:scale-95 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_50px_rgba(57,255,20,0.2)] transform-style-preserve-3d hover:[transform:rotateX(12deg)_rotateY(12deg)] ${gameOver ? 'pointer-events-none' : ''}`}
            >
              {/* Inner glow layer */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-[#39FF14]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${i === targetIndex ? 'opacity-70 animate-pulse' : ''}`} />
              {/* Border pulse on target */}
              {i === targetIndex && (
                <>
                  <div className="absolute inset-0 rounded-xl border-4 border-[#39FF14]/60 animate-ring-expand-1 opacity-70" />
                  <div className="absolute inset-0 rounded-xl border-2 border-[#39FF14] animate-ring-expand-2 delay-150" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* HUD */}
      <div className="relative z-20 flex justify-between w-full px-12 text-white font-mono text-xl tracking-widest mb-8">
        <div className="hud-panel">LEVEL: <span className="ml-3 px-5 py-2 bg-black/60 backdrop-blur-md border-2 border-[#39FF14]/60 rounded-xl text-[#39FF14] glow-text-lg">{level}</span></div>
        <div className="hud-panel">SCORE: <span className="ml-3 px-6 py-2 bg-gradient-to-r from-[#39FF14]/30 to-[#39FF14]/10 border border-[#39FF14]/80 rounded-xl text-[#39FF14] font-black text-2xl animate-score-glow">{score}</span></div>
      </div>

      <p className="relative z-20 text-sm text-gray-400 mb-6">FIND THE DIMMER BLOCK</p>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-[#39FF14]/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(57,255,20,0.7)] animate-glitch-panel">
            <h2 className={`text-6xl font-black mb-8 ${won ? 'text-[#39FF14]' : 'text-red-500'} glow-text-xl`}>
              {won ? "PERFECT VISION" : "EYE STRAIN DETECTED"}
            </h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL SCORE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={restart} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RECALIBRATE
            </button>
          </div>
        </div>
      )}

      {/* Styles (shared keyframes) */}
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