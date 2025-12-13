import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function NeonRunner() {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [dinoY, setDinoY] = useState(0); 
  const [obstacleX, setObstacleX] = useState(300); 
  const [gameOver, setGameOver] = useState(false);
  
  const isJumping = useRef(false);
  const gameLoop = useRef<NodeJS.Timeout>();

  const jump = () => {
    if (!playing || isJumping.current || gameOver) return;
    isJumping.current = true;
    
    let jumpHeight = 0;
    const upInterval = setInterval(() => {
      if (jumpHeight >= 60) {
        clearInterval(upInterval);
        const downInterval = setInterval(() => {
          if (jumpHeight <= 0) {
            clearInterval(downInterval);
            isJumping.current = false;
            setDinoY(0);
          } else {
            jumpHeight -= 5;
            setDinoY(jumpHeight);
          }
        }, 20);
      } else {
        jumpHeight += 5;
        setDinoY(jumpHeight);
      }
    }, 20);
  };

  useEffect(() => {
    if (playing) {
      gameLoop.current = setInterval(() => {
        setObstacleX(prev => {
          if (prev < -20) {
             setScore(s => s + 1);
             return 300; 
          }
          return prev - 5; 
        });
      }, 20);
    }
    return () => clearInterval(gameLoop.current);
  }, [playing]);

  useEffect(() => {
    if (obstacleX < 50 && obstacleX > 10 && dinoY < 20) {
      setPlaying(false);
      setGameOver(true);
    }
  }, [obstacleX, dinoY]);

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setObstacleX(300);
    setDinoY(0);
    setGameOver(false);
    isJumping.current = false;
  };

  return (
    <SwytchContainer title="NEON RUNNER">
      {/* Background Layers */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-12 left-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
        <div className="absolute bottom-16 right-16 w-1.5 h-1.5 bg-[#39FF14]/50 rounded-full animate-float-fast shadow-[0_0_5px_#39FF14]" />
      </div>

      {/* Game Area */}
      <div 
        className="relative w-[300px] h-[150px] border-b-4 border-[#39FF14] overflow-hidden bg-[#111]/90 shadow-[0_0_40px_rgba(57,255,20,0.4)] rounded-2xl mx-auto mb-8" 
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        {/* Ground Line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#39FF14] shadow-[0_0_20px_#39FF14]" />
        
        {/* Player */}
        <div 
          className="absolute left-8 w-10 h-10 bg-[#39FF14] border-4 border-black rounded-lg shadow-[0_0_30px_#39FF14] transition-all duration-100"
          style={{ bottom: `${dinoY + 20}px` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent animate-shine" />
        </div>

        {/* Obstacle */}
        <div 
          className="absolute bottom-4 w-8 h-12 bg-red-500 rounded-sm shadow-[0_0_20px_red]"
          style={{ left: `${obstacleX}px` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        
        {/* Score */}
        <div className="absolute top-4 right-4 text-[#39FF14] font-black text-3xl glow-text-lg animate-score-glow">
          {score}
        </div>
      </div>

      {/* Start / Instructions */}
      {!playing && !gameOver && (
        <button onClick={startGame} className="relative z-20 px-12 py-6 bg-[#39FF14] text-black font-black uppercase tracking-[0.3em] text-2xl hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:shadow-[0_0_80px_#39FF14] hover:scale-105">
          RUN PROGRAM
        </button>
      )}
      {playing && <p className="relative z-20 mt-4 text-gray-400 text-lg">TAP / CLICK TO JUMP</p>}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">CRASHED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">DISTANCE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RESTART RUN
            </button>
          </div>
        </div>
      )}

      <style >{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 100px 0; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
        @keyframes float-fast { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
        @keyframes shine { 0% { transform: translateX(-200%); } 100% { transform: translateX(200%); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 50px #39FF14; } }
        .animate-grid-med { animation: grid-med 25s linear infinite reverse; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 7s ease-in-out infinite; }
        .animate-shine { animation: shine 2s linear infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}