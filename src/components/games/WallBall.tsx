import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function WallBall() {
  const [ball, setBall] = useState({ x: 50, y: 50, dx: 2, dy: 2 });
  const [paddleX, setPaddleX] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setBall(b => {
      let { x, y, dx, dy } = b;
      let newX = x + dx;
      let newY = y + dy;

      if (newX <= 0 || newX >= 290) dx = -dx;
      if (newY <= 0) dy = -dy;

      if (newY >= 230 && newY <= 240) {
        if (newX >= paddleX && newX <= paddleX + 60) {
             dy = -dy * 1.05; 
             setScore(s => s + 1);
        }
      }

      if (newY > 250) {
        setPlaying(false);
        setGameOver(true);
        return { x: 50, y: 50, dx: 2, dy: 2 }; 
      }

      return { x: newX, y: newY, dx, dy };
    });

    if (playing) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setGameOver(false);
    setBall({ x: 50, y: 50, dx: 2, dy: 2 });
  };

  return (
    <SwytchContainer title="WALL BALL">
      {/* Multi-Layered Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_4px)] animate-grid-slow" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
          <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-[#39FF14]/50 rounded-full animate-float-fast shadow-[0_0_5px_#39FF14]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,transparent_70%)]" />
      </div>

      {/* Game Area */}
      <div 
        className="relative w-[300px] h-[250px] border-4 border-[#39FF14]/80 bg-black/90 overflow-hidden cursor-none shadow-[0_0_40px_rgba(57,255,20,0.4)] rounded-2xl mx-auto mb-8"
        onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setPaddleX(e.clientX - rect.left - 30);
        }}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.03)_0,rgba(57,255,20,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none" />

        {/* Ball */}
        <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#ffffff] animate-pulse" style={{ left: `${ball.x}px`, top: `${ball.y}px` }}>
          <div className="absolute inset-0 rounded-full bg-[#39FF14] mix-blend-screen animate-ping" />
        </div>
        
        {/* Paddle */}
        <div className="absolute bottom-4 h-3 bg-[#39FF14] shadow-[0_0_20px_#39FF14]" style={{ width: '60px', left: `${paddleX}px`, transform: 'translateX(-50%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
        </div>
        
        {/* Score */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#39FF14] text-7xl font-black pointer-events-none glow-text-xl animate-score-glow">
          {score}
        </div>
      </div>

      {/* Start Button */}
      {!playing && !gameOver && (
        <button onClick={startGame} className="relative z-20 px-12 py-6 border-3 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-[0.3em] text-xl overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_60px_rgba(57,255,20,0.7)] transition-all duration-400 group hover:scale-[1.05]">
          <span className="relative z-10">SERVE</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">WALL BREACHED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL SCORE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RELOAD
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes grid-slow { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        @keyframes float-fast { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 50px #39FF14, 0 0 70px #39FF14; } }
        .animate-grid-slow { animation: grid-slow 40s linear infinite; }
        .animate-float-deep { animation: float-deep 8s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 6s ease-in-out infinite; }
        .animate-shine { animation: shine 2s linear infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}