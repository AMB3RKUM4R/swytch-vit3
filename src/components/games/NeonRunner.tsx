import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function NeonRunner() {
  const { triggerSmartLink } = useAdSystem();
  
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
      if (jumpHeight >= 70) { // Higher Jump
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
        jumpHeight += 7;
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
          return prev - 6; // Faster speed
        });
      }, 20);
    }
    return () => clearInterval(gameLoop.current);
  }, [playing]);

  useEffect(() => {
    // Hitbox logic
    if (obstacleX < 40 && obstacleX > 10 && dinoY < 30) {
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

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="NEON RUNNER">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#39FF14_0,#39FF14_1px,transparent_1px,transparent_20px)] animate-grid-fast" />
      </div>

      {/* Game Area */}
      <div 
        className="relative w-[300px] h-[180px] border-b-4 border-[#39FF14] bg-[#050505] overflow-hidden rounded-t-lg mx-auto mb-6 cursor-pointer active:bg-[#111]"
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        {/* Ground */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#39FF14] shadow-[0_0_20px_#39FF14]" />
        
        {/* Player */}
        <div 
          className="absolute left-6 w-10 h-10 bg-[#39FF14] rounded-sm shadow-[0_0_20px_#39FF14] transition-all duration-0 border-2 border-black"
          style={{ bottom: `${dinoY + 4}px` }}
        >
           <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>

        {/* Obstacle */}
        <div 
          className="absolute bottom-0 w-6 h-12 bg-red-600 rounded-t-sm border border-red-400 shadow-[0_0_15px_red]"
          style={{ left: `${obstacleX}px` }}
        />
        
        {/* Score */}
        <div className="absolute top-2 right-4 text-[#39FF14] font-black text-4xl opacity-50 font-mono">
          {score.toString().padStart(3, '0')}
        </div>
      </div>

      {/* Start Button */}
      {!playing && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(57,255,20,0.4)]">
          RUN PROGRAM
        </button>
      )}
      
      {playing && <p className="text-gray-500 font-mono text-xs animate-pulse">TAP SCREEN TO JUMP</p>}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in text-center p-6">
            <h2 className="text-red-500 font-black text-3xl mb-2 uppercase tracking-tighter glow-text">CRASHED</h2>
            <p className="text-[#39FF14] font-mono text-5xl font-bold mb-8">{score}</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_#39FF14]">
              RESTART
            </button>
        </div>
      )}
      
      <style>{`
        @keyframes grid-fast { from { background-position: 0 0; } to { background-position: -20px 0; } }
        .animate-grid-fast { animation: grid-fast 0.5s linear infinite; }
      `}</style>
    </SwytchContainer>
  );
}