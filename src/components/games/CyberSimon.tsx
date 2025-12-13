import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';

const COLORS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export default function CyberSimon() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playingIdx, setPlayingIdx] = useState(0); 
  const [userStep, setUserStep] = useState(0);     
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);        
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayingIdx(0);
    setUserStep(0);
    setIsPlayerTurn(false);
    setGameOver(false);
  };

  useEffect(() => {
    if (sequence.length > 0 && !isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        setFlash(sequence[playingIdx]);
        setTimeout(() => setFlash(null), 400);

        if (playingIdx < sequence.length - 1) {
          setPlayingIdx(prev => prev + 1);
        } else {
          setTimeout(() => setIsPlayerTurn(true), 500);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sequence, playingIdx, isPlayerTurn, gameOver]);

  const handlePadClick = (index: number) => {
    if (!isPlayerTurn || gameOver) return;

    setFlash(index);
    setTimeout(() => setFlash(null), 200);

    if (index === sequence[userStep]) {
      if (userStep === sequence.length - 1) {
        setIsPlayerTurn(false);
        setUserStep(0);
        setPlayingIdx(0);
        setTimeout(() => {
            setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
        }, 1000);
      } else {
        setUserStep(prev => prev + 1);
      }
    } else {
      setGameOver(true);
    }
  };

  return (
    <SwytchContainer title="CYBER SIMON">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
      </div>

      {/* Pads */}
      <div className="grid grid-cols-2 gap-8 mb-12 perspective-[1200px]">
        {COLORS.map((_, i) => (
          <div
            key={i}
            onClick={() => handlePadClick(i)}
            className={`relative w-40 h-40 border-8 rounded-3xl cursor-pointer transition-all duration-200 shadow-[0_30px_60px_rgba(0,0,0,0.6)] transform-style-preserve-3d hover:[transform:translateY(-10px)_rotateX(10deg)] ${
              flash === i 
                ? "bg-[#39FF14] border-[#39FF14] shadow-[0_0_80px_#39FF14,inset_0_0_40px_#39FF14] scale-105" 
                : "bg-black/80 border-[#39FF14]/60 hover:border-[#39FF14] hover:shadow-[0_0_40px_rgba(57,255,20,0.4)]"
            } ${!isPlayerTurn || gameOver ? 'pointer-events-none opacity-70' : ''}`}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            {flash === i && (
              <>
                <div className="absolute inset-0 rounded-3xl border-8 border-white/60 animate-ring-expand-1 opacity-80" />
                <div className="absolute inset-0 rounded-3xl border-4 border-[#39FF14] animate-ring-expand-2 delay-150" />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-white font-mono text-2xl h-12 mb-12">
        {gameOver 
          ? <span className="text-red-500 glow-text-lg">SEQUENCE BROKEN // SCORE: {sequence.length - 1}</span>
          : isPlayerTurn 
            ? "YOUR TURN" 
            : sequence.length > 0 ? "OBSERVE PATTERN..." : "READY"}
      </div>

      {/* Buttons */}
      {gameOver && (
        <button onClick={startGame} className="relative z-20 px-16 py-8 bg-[#39FF14] text-black font-black uppercase text-3xl tracking-[0.3em] hover:bg-white transition-all duration-300 shadow-[0_0_50px_#39FF14] hover:scale-105">
          REBOOT SYSTEM
        </button>
      )}
      {!sequence.length && (
        <button onClick={startGame} className="relative z-20 px-16 py-8 border-8 border-[#39FF14] text-[#39FF14] uppercase text-3xl tracking-[0.3em] hover:bg-[#39FF14] hover:text-black transition-all duration-300 shadow-[0_0_50px_rgba(57,255,20,0.4)] hover:scale-105">
          INITIATE
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">PATTERN FAILED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">SEQUENCE LENGTH</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{sequence.length - 1}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RESTART SIMON
            </button>
          </div>
        </div>
      )}

      <style >{`
        .perspective-[1200px] { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 120px 120px; } }
        @keyframes ring-expand-1 { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes ring-expand-2 { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-6px,6px); } 40% { transform: translate(6px,-6px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 60px #39FF14; } }
        .animate-grid-med { animation: grid-med 35s linear infinite; }
        .animate-ring-expand-1 { animation: ring-expand-1 0.8s ease-out forwards; }
        .animate-ring-expand-2 { animation: ring-expand-2 1s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}