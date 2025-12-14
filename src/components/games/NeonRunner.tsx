import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const SKINS = [
    "https://placehold.co/100x100/000000/39FF14?text=🏃",
    "https://placehold.co/100x100/000000/00FFFF?text=🤖",
    "https://placehold.co/100x100/000000/FFFF00?text=⚡"
];

export default function NeonRunner() {
  const { triggerSmartLink } = useAdSystem();
  
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [dinoY, setDinoY] = useState(0); 
  const [obstacleX, setObstacleX] = useState(300); 
  const [gameOver, setGameOver] = useState(false);
  const [skinIdx, setSkinIdx] = useState(0);
  
  const isJumping = useRef(false);
  const gameLoop = useRef<NodeJS.Timeout>();

  const jump = () => {
    if (!playing || isJumping.current || gameOver) return;
    isJumping.current = true;
    
    let jumpHeight = 0;
    const upInterval = setInterval(() => {
      if (jumpHeight >= 80) { // Higher Jump
        clearInterval(upInterval);
        const downInterval = setInterval(() => {
          if (jumpHeight <= 0) {
            clearInterval(downInterval);
            isJumping.current = false;
            setDinoY(0);
          } else {
            jumpHeight -= 6;
            setDinoY(jumpHeight);
          }
        }, 20);
      } else {
        jumpHeight += 8;
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
          return prev - (7 + score * 0.1); // Accelerates
        });
      }, 20);
    }
    return () => clearInterval(gameLoop.current);
  }, [playing, score]);

  useEffect(() => {
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
    setSkinIdx(prev => (prev + 1) % SKINS.length); // Change skin
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="NEON RUNNER">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[repeating-linear-gradient(90deg,#39FF14_0,#39FF14_1px,transparent_1px,transparent_40px)] ${playing ? 'animate-grid-fast' : ''}`} />
      </div>

      <div 
        className="relative w-[300px] h-[180px] border-b-4 border-[#39FF14] bg-[#050505] overflow-hidden rounded-t-lg mx-auto mb-6 cursor-pointer active:bg-[#111] shadow-inner"
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        {/* Player */}
        <div 
          className="absolute left-6 w-10 h-10 rounded-sm transition-all duration-0"
          style={{ bottom: `${dinoY + 4}px` }}
        >
           <img src={SKINS[skinIdx]} className="w-full h-full object-cover rounded-sm shadow-[0_0_10px_#39FF14]" />
        </div>

        {/* Obstacle */}
        <div 
          className="absolute bottom-0 w-8 h-12 bg-red-600 rounded-t-sm border border-red-400 shadow-[0_0_15px_red]"
          style={{ left: `${obstacleX}px` }}
        />
        
        {/* Score */}
        <div className="absolute top-2 right-4 text-[#39FF14] font-black text-4xl opacity-50 font-mono">
          {score.toString().padStart(3, '0')}
        </div>
      </div>

      {!playing && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(57,255,20,0.4)]">
          RUN PROGRAM
        </button>
      )}
      
      {playing && <p className="text-gray-500 font-mono text-xs animate-pulse text-center">TAP TO JUMP</p>}

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
        @keyframes grid-fast { from { background-position: 0 0; } to { background-position: -40px 0; } }
        .animate-grid-fast { animation: grid-fast 0.3s linear infinite; }
      `}</style>
    </SwytchContainer>
  );
}