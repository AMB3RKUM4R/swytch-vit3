import { useState } from 'react';
import SwytchContainer from './SwytchContainer';

export default function HighLow() {
  const [currentNum, setCurrentNum] = useState(50);
  const [message, setMessage] = useState("PREDICT THE NEXT HASH");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const guess = (isHigher: boolean) => {
    const nextNum = Math.floor(Math.random() * 100) + 1;
    
    const win = isHigher ? nextNum > currentNum : nextNum < currentNum;

    if (win) {
      setMessage("CORRECT // CHAIN CONTINUED");
      setScore(score + 1);
    } else {
      setMessage("FAILURE // LINK BROKEN");
      setGameOver(true);
    }
    setCurrentNum(nextNum);
  };

  const restart = () => {
    setCurrentNum(50);
    setMessage("PREDICT THE NEXT HASH");
    setScore(0);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="HIGH / LOW">
      {/* Background */}
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Current Number */}
      <div className="relative z-10 text-9xl font-black text-[#39FF14] mb-12 glow-text-xl animate-score-glow tracking-widest">
        {currentNum}
      </div>
      
      {/* Buttons */}
      <div className="relative z-10 flex gap-8 mb-12">
        <button onClick={() => guess(false)} disabled={gameOver} className="w-40 h-20 border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase tracking-widest text-2xl transition-all duration-300 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.7)] disabled:opacity-50 disabled:cursor-not-allowed">
          LOWER
        </button>
        <button onClick={() => guess(true)} disabled={gameOver} className="w-40 h-20 border-4 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-widest text-2xl transition-all duration-300 shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_60px_rgba(57,255,20,0.7)] disabled:opacity-50 disabled:cursor-not-allowed">
          HIGHER
        </button>
      </div>

      {/* HUD */}
      <div className="relative z-10 mt-8 text-white font-mono text-2xl">
        STREAK: <span className="text-[#39FF14] glow-text-lg ml-4 px-6 py-2 bg-black/60 border-2 border-[#39FF14]/60 rounded-xl">{score}</span>
      </div>
      <p className="relative z-10 mt-4 text-gray-400 text-lg">{message}</p>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">CHAIN BROKEN</h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL STREAK</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={restart} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RESTART HASH
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 100px 0; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-15px);} }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-4px,4px); } 40% { transform: translate(4px,-4px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 50px #39FF14, 0 0 70px #39FF14; } }
        .animate-grid-med { animation: grid-med 30s linear infinite reverse; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}