import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function WallBall() {
  const { triggerSmartLink } = useAdSystem();

  const [ball, setBall] = useState({ x: 50, y: 50, dx: 3, dy: 3 });
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

      // Walls
      if (newX <= 0 || newX >= 290) dx = -dx; // Left/Right
      if (newY <= 0) dy = -dy; // Top

      // Paddle Collision
      if (newY >= 230 && newY <= 240) {
        if (newX >= paddleX && newX <= paddleX + 60) {
             dy = -dy * 1.05; // Speed up slightly
             setScore(s => s + 1);
        }
      }

      // Game Over (Bottom)
      if (newY > 250) {
        setPlaying(false);
        setGameOver(true);
        return { x: 50, y: 50, dx: 3, dy: 3 }; 
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
    setBall({ x: 50, y: 50, dx: 3, dy: 3 });
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="WALL BALL">
      <div 
        className="relative w-[300px] h-[250px] border border-[#39FF14] bg-black cursor-none overflow-hidden mx-auto mb-6"
        onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setPaddleX(e.clientX - rect.left - 30);
        }}
      >
        {/* Ball */}
        <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${ball.x}px`, top: `${ball.y}px` }}></div>
        
        {/* Paddle */}
        <div className="absolute bottom-2 h-3 bg-[#39FF14] shadow-[0_0_15px_#39FF14]" style={{ width: '60px', left: `${paddleX}px` }}></div>
        
        {/* Score */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-800 text-7xl font-black pointer-events-none opacity-50">{score}</div>
      </div>
      
      {!playing && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-white text-black font-bold uppercase hover:bg-[#39FF14] transition-colors">
            SERVE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-2xl mb-2">MISSED</h2>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RELOAD
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}