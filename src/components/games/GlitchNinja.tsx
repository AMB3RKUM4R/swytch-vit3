import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';

const GRID_SIZE = 9;

export default function GlitchNinja() {
  const [activeSlot, setActiveSlot] = useState<number | null>(null); 
  const [score, setScore] = useState(0);
  const [gameOn, setGameOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); 
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameOn && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setGameOn(false);
      setActiveSlot(null);
      setGameOver(true);
      setWon(score > 50); // arbitrary win threshold for demo feel
    }
    return () => clearInterval(interval);
  }, [gameOn, timeLeft, score]);

  useEffect(() => {
    let moveInterval: NodeJS.Timeout;
    if (gameOn) {
      moveInterval = setInterval(() => {
        const randomSlot = Math.floor(Math.random() * GRID_SIZE);
        setActiveSlot(randomSlot);
      }, 700); 
    }
    return () => clearInterval(moveInterval);
  }, [gameOn]);

  const handleClick = (index: number) => {
    if (!gameOn) return;
    if (index === activeSlot) {
      setScore(s => s + 10);
      setActiveSlot(null); 
    } else {
        setScore(s => s - 5); 
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameOn(true);
    setGameOver(false);
    setWon(false);
  };

  return (
    <SwytchContainer title="GLITCH HUNT">
      {/* Multi-Layered Background (same as previous) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_4px),repeating-linear-gradient(90deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_4px)] animate-grid-slow" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.08)_0,rgba(57,255,20,0.08)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute inset-0">
          <div className="absolute top-8 left-8 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
          <div className="absolute top-20 right-12 w-1 h-1 bg-[#39FF14]/60 rounded-full animate-float-mid shadow-[0_0_4px_#39FF14]" />
          <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-[#39FF14]/50 rounded-full animate-float-fast shadow-[0_0_5px_#39FF14]" />
        </div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.04)_0,rgba(57,255,20,0.04)_1px,transparent_1px,transparent_3px)] animate-scan-up" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,transparent_70%)]" />
      </div>

      {/* Game Grid (same multi-layered cells as before) */}
      <div className="perspective-[1200px] relative z-10 px-4 mb-8">
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div key={i} onClick={() => handleClick(i)}
              className={`group relative w-32 h-32 cursor-pointer active:scale-[0.97] transition-all duration-300 overflow-hidden bg-black/50 backdrop-blur-sm border border-gray-900/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_rgba(57,255,20,0.15)] transform-style-preserve-3d hover:[transform:rotateX(8deg)_rotateY(8deg)] ${activeSlot === i ? "border-[#39FF14] shadow-[0_0_40px_#39FF14,inset_0_0_30px_rgba(57,255,20,0.2)] scale-[1.03] animate-glitch-layer-pulse mix-blend-screen" : "hover:border-[#39FF14]/40"} ${!gameOn && !gameOver ? 'opacity-60' : ''}`}>
              <div className={`absolute inset-0 bg-[radial-gradient(circle,rgba(57,255,20,0.06)_0%,black_60%)] rounded-2xl ${activeSlot === i ? 'animate-circuit-glow scale-110' : ''}`} />
              <div className={`absolute inset-2 border-4 border-transparent rounded-xl bg-gradient-to-r from-[#39FF14]/20 to-transparent ${activeSlot === i ? '[border-image:linear-gradient(45deg,#39FF14,transparent)_1] animate-frame-pulse delay-200' : ''}`} />
              <div className={`relative z-20 flex items-center justify-center h-full ${activeSlot === i ? 'animate-icon-emerge delay-400 scale-110' : 'opacity-0 scale-90'}`}>
                {activeSlot === i && (
                  <svg viewBox="0 0 48 48" fill="none" stroke="#39FF14" strokeWidth="3.5" className="w-20 h-20 drop-shadow-[0_0_12px_#39FF14] animate-[spin_1.2s_linear_infinite]">
                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z" strokeDasharray="5 5" className="animate-ping" />
                    <circle cx="24" cy="24" r="10" fill="#39FF14" fillOpacity="0.25" className="animate-pulse scale-[1.2]" />
                    <path d="M18 6L6 18M6 6l12 12" className="stroke-white/90 animate-[glitch-layer_0.4s_infinite] stroke-[4px]" />
                  </svg>
                )}
              </div>
              {activeSlot === i && (
                <>
                  <div className="absolute inset-0 rounded-2xl border-8 border-[#39FF14]/30 animate-ring-expand-1 opacity-80 mix-blend-screen" />
                  <div className="absolute inset-0 rounded-2xl border-4 border-[#39FF14]/50 animate-ring-expand-2 delay-150 opacity-90" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#39FF14] animate-ring-expand-3 delay-300" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* HUD */}
      <div className="relative z-20 flex justify-between w-full px-10 mb-8 text-white font-mono text-xl tracking-[0.1em]">
        <div className="hud-panel">TIMER: <span className={`ml-3 px-4 py-2 bg-black/60 backdrop-blur-md border-2 border-${timeLeft < 5 ? 'red-500/80' : '[#39FF14]/60'} rounded-xl ${timeLeft < 5 ? "text-red-300 animate-pulse" : "text-[#39FF14] glow-text-lg"}`}>{timeLeft.toString().padStart(2, '0')}s</span></div>
        <div className="hud-panel">SCORE: <span className="ml-3 px-6 py-2 bg-gradient-to-r from-[#39FF14]/30 via-black/50 to-[#39FF14]/30 border border-[#39FF14]/80 rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.5)] text-[#39FF14] font-black text-2xl animate-score-glow">{score}</span></div>
      </div>

      {/* Start Button */}
      {!gameOn && !gameOver && (
        <button onClick={startGame} className="relative z-20 px-12 py-6 border-3 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-[0.3em] text-xl overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_60px_rgba(57,255,20,0.7)] transition-all duration-400 group hover:scale-[1.05]">
          <span className="relative z-10">INITIATE PURGE</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-12 border-4 border-[#39FF14]/80 rounded-3xl bg-black/80 shadow-[0_0_80px_rgba(57,255,20,0.6)] animate-glitch-panel">
            <h2 className={`text-6xl font-black mb-8 ${won ? 'text-[#39FF14]' : 'text-red-500'} glow-text-xl`}>
              {won ? "PURGE COMPLETE" : "SYSTEM BREACHED"}
            </h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL SCORE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RETRY PROTOCOL
            </button>
          </div>
        </div>
      )}

      {/* Epic Styles - Multi-Layer Keyframes */}
      <style>{`
        .perspective-\\[1200px\\] { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .hud-panel { @apply relative bg-black/40 px-4 py-2 rounded-xl backdrop-blur-lg border border-gray-800/50 shadow-[0_10px_30px_rgba(0,0,0,0.4)]; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14, 0 0 36px #39FF14; }
        .shadow-red-glow { box-shadow: 0 0 20px rgba(239,68,68,0.6), inset 0 0 20px rgba(239,68,68,0.3); }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .animate-grid-slow { animation: grid-move 40s linear infinite; }
        .animate-grid-med { animation: grid-move 20s linear infinite reverse; }
        .animate-scan-up { animation: scanlines 3s linear infinite; }
        .animate-glitch-layer-pulse {
          0%, 100% { transform: scale(1.03) rotateZ(0deg); filter: drop-shadow(0 0 30px #39FF14) hue-rotate(0deg); }
          10% { transform: scale(1.06) rotateZ(1deg); filter: drop-shadow(0 0 40px #39FF14) hue-rotate(60deg); }
          20% { transform: scale(1.03) rotateZ(-1deg); filter: drop-shadow(0 0 35px #39FF14) hue-rotate(120deg); }
          30% { transform: scale(1.07) rotateZ(2deg); filter: drop-shadow(0 0 45px #39FF14) hue-rotate(180deg); }
          40% { transform: scale(1.04) rotateZ(0deg); filter: drop-shadow(0 0 30px #39FF14) hue-rotate(240deg); }
          50% { transform: scale(1.06) rotateZ(-2deg); filter: drop-shadow(0 0 40px #39FF14) hue-rotate(300deg); }
          60%, 100% { transform: scale(1.03) rotateZ(0deg); filter: drop-shadow(0 0 30px #39FF14) hue-rotate(360deg); }
        }
        .animate-circuit-glow { animation: circuit-glow 1.5s ease-in-out infinite alternate; box-shadow: inset 0 0 20px rgba(57,255,20,0.4); }
        .animate-frame-pulse { animation: frame-pulse 1s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .animate-icon-emerge { animation: icon-emerge 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards; opacity: 1 !important; }
        .animate-ring-expand-1 { animation: ring-expand 1s ease-out forwards; }
        .animate-ring-expand-2 { animation: ring-expand 1.2s ease-out 0.15s forwards; }
        .animate-ring-expand-3 { animation: ring-expand 1.4s ease-out 0.3s forwards; }
        .animate-crack-multi { animation: crack-multi 0.6s ease-in-out; }
        .particle { position: absolute; width: 4px; height: 4px; background: #39FF14; border-radius: 50%; opacity: 0; pointer-events: none; }
        .particle-1 { top: 20%; left: 20%; animation: burst-particle 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) 0.1s forwards; }
        .particle-2 { top: 30%; right: 20%; animation: burst-particle 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) 0.15s forwards rotate(45deg); }
        .particle-3 { bottom: 20%; left: 30%; animation: burst-particle 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) 0.2s forwards rotate(-45deg); }
        .particle-4 { top: 40%; left: 10%; animation: burst-particle 0.5s cubic-bezier(0.68,-0.55,0.265,1.55) 0.25s forwards rotate(90deg); }
        .particle-5 { bottom: 30%; right: 10%; animation: burst-particle 0.5s cubic-bezier(0.68,-0.55,0.265,1.55) 0.3s forwards rotate(-90deg); }
        .particle-6 { top: 50%; right: 30%; animation: burst-particle 0.7s cubic-bezier(0.68,-0.55,0.265,1.55) 0.35s forwards; }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes float-deep { 0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-12px) rotate(180deg);}}
        @keyframes float-mid { 0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(16px,-8px) rotate(120deg);}66%{transform:translate(-12px,8px) rotate(240deg);}}
        @keyframes float-fast { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-16px) scale(1.15);}}
        @keyframes float-deep2 { 0%,100%{transform:translate(0,0) scale(0.8);}50%{transform:translate(8px,-10px) scale(1.2);}}
        @keyframes glitch-layer {
          0%,100%{transform:translate(0);}
          20%{transform:translate(-2px,2px);}
          40%{transform:translate(-2px,-2px);}
          60%{transform:translate(2px,2px);}
          80%{transform:translate(2px,-2px);}
        }
        @keyframes circuit-glow {
          from { box-shadow: inset 0 0 10px rgba(57,255,20,0.2); }
          to { box-shadow: inset 0 0 30px rgba(57,255,20,0.5); }
        }
        @keyframes frame-pulse {
          0%,100%{opacity:0.7; transform:scale(1);}
          50%{opacity:1; transform:scale(1.05);}
        }
        @keyframes icon-emerge {
          0% { opacity:0; transform: scale(0.5) translateZ(-50px) rotateY(180deg); }
          100% { opacity:1; transform: scale(1.1) translateZ(20px) rotateY(0deg); }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.5); opacity:1; }
          100% { transform: scale(4); opacity:0; }
        }
        @keyframes crack-multi {
          0% { clip-path: inset(0 100% 100% 0); transform: skew(0deg); opacity:0.6; }
          30% { clip-path: inset(0 0 0 0); transform: skew(2deg) scale(1.02); opacity:1; }
          70% { clip-path: inset(0 0 0 0); transform: skew(-1deg) scale(0.98); opacity:0.8; }
          100% { clip-path: inset(0 100% 100% 0); transform: skew(0deg); opacity:0; }
        }
        @keyframes burst-particle {
          0% { opacity:1; transform: scale(0) translate(0,0); }
          50% { opacity:1; transform: scale(1.2) translate(var(--tx,0), var(--ty,0)); }
          100% { opacity:0; transform: scale(0) translate(var(--tx,0) var(--ty,0)); }
        }
        @keyframes score-glow {
          from { text-shadow: 0 0 20px #39FF14, 0 0 30px #39FF14; }
          to { text-shadow: 0 0 30px #39FF14, 0 0 40px #39FF14, 0 0 50px #39FF14; }
        }
        .transform-gpu { transform: translateZ(0); }
        .group-hover\\:\\[transform:rotateX\\(8deg\\)_rotateY\\(8deg\\)\\] { }
      `}</style>
    </SwytchContainer>
  );
}