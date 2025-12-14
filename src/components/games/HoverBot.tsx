import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function HoverBot() {
  const { triggerSmartLink } = useAdSystem();

  const [y, setY] = useState(100);
  const [velocity, setVelocity] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setY(prevY => {
      // Collision bounds (Top or Bottom)
      if (prevY > 230 || prevY < 0) { 
        setPlaying(false);
        setGameOver(true);
        return prevY;
      }
      return prevY + velocity;
    });
    
    setVelocity(v => v + 0.25); // Gravity
    setScore(s => s + 1); 
    
    if (playing) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const boost = () => {
    if (!gameOver) setVelocity(-5); 
  };

  const startGame = () => {
    setPlaying(true);
    setVelocity(0);
    setY(100);
    setScore(0);
    setGameOver(false);
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="HOVER BOT">
      <div 
        onMouseDown={boost}
        className="relative w-[300px] h-[250px] border-y-4 border-red-600 bg-[#0a0a0a] cursor-pointer overflow-hidden rounded-lg mx-auto mb-4"
      >
        {/* Red Zones */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-red-600/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-red-600/50 to-transparent pointer-events-none" />

        {/* Bot */}
        <div 
          className="absolute left-10 w-8 h-8 bg-[#39FF14] border-2 border-white rounded-md flex items-center justify-center shadow-[0_0_15px_#39FF14]"
          style={{ top: `${y}px`, transform: `rotate(${velocity * 3}deg)` }}
        >
          <div className="w-4 h-1 bg-black/50 rounded-full"></div>
        </div>

        {/* HUD */}
        <div className="absolute top-2 right-2 text-white font-mono text-xs bg-black/50 px-2 py-1 rounded">
            ALT: {score}
        </div>
      </div>
      
      {!playing && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
          IGNITE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-2xl mb-2">CRASHED</h2>
            <p className="text-gray-400 text-xs uppercase mb-1">Max Altitude</p>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RE-IGNITE
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}