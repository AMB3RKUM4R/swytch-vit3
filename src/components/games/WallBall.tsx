import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function WallBall() {
  const { triggerSmartLink } = useAdSystem();

  const [ball, setBall] = useState({ x: 150, y: 50, dx: 3, dy: 3 });
  const [paddleX, setPaddleX] = useState(120);
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
        return { x: 150, y: 50, dx: 3, dy: 3 }; 
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
    setBall({ x: 150, y: 50, dx: 3, dy: 3 });
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="WALL BALL">
      <div 
        className="relative w-[300px] h-[250px] border border-[#39FF14] bg-black cursor-none overflow-hidden mx-auto mb-6 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
        onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setPaddleX(e.clientX - rect.left - 30);
        }}
        onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            setPaddleX(touch.clientX - rect.left - 30);
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(57,255,20,0.1)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Ball */}
        <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]" style={{ left: `${ball.x}px`, top: `${ball.y}px` }}></div>
        
        {/* Paddle */}
        <div className="absolute bottom-2 h-4 bg-[#39FF14] shadow-[0_0_20px_#39FF14] rounded-sm" style={{ width: '60px', left: `${paddleX}px` }}>
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
        
        {/* Score */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-800 text-8xl font-black pointer-events-none opacity-30 select-none">
            {score}
        </div>
      </div>
      
      {!playing && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-white text-black font-bold uppercase hover:bg-[#39FF14] transition-colors tracking-widest">
            SERVE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-red-500 font-black text-2xl mb-2">MISSED</h2>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRetry} className="px-10 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RELOAD
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}