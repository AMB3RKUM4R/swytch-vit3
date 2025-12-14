import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function PinCore() {
  const { triggerSmartLink } = useAdSystem();

  const [pins, setPins] = useState<number[]>([]); 
  const [rotation, setRotation] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setRotation(r => (r + 2.5) % 360); // Speed
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const shoot = () => {
    if (!playing || gameOver) return;
    
    // Calculate angle relative to the core's current rotation
    const currentAngle = (360 - rotation + 90) % 360; 
    
    // Check collision (too close to another pin)
    const collision = pins.some(p => Math.abs(p - currentAngle) < 12);
    
    if (collision) {
      setPlaying(false);
      setGameOver(true);
    } else {
      setPins(prev => [...prev, currentAngle]);
    }
  };

  const startGame = () => {
    setPlaying(true);
    setPins([]);
    setGameOver(false);
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="PIN THE CORE">
      <div className="relative w-[300px] h-[300px] flex items-center justify-center overflow-hidden mb-4">
        {/* Core */}
        <div 
          className="w-24 h-24 bg-[#39FF14] rounded-full relative flex items-center justify-center shadow-[0_0_30px_#39FF14]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
           <span className="text-black font-black text-xl">{pins.length}</span>
           
           {/* Existing Pins attached to Core */}
           {pins.map((angle, i) => (
             <div 
               key={i}
               className="absolute w-1 h-16 bg-white bottom-1/2 left-1/2 origin-bottom -translate-x-1/2"
               style={{ transform: `rotate(${angle}deg) translateY(60px)` }} 
             >
                <div className="w-3 h-3 bg-red-500 rounded-full absolute top-0 -translate-x-1/2 left-1/2 border border-black"></div>
             </div>
           ))}
        </div>

        {/* Player Pin (Ready to fire) */}
        <div className="absolute bottom-8 w-1 h-12 bg-white animate-pulse"></div>
      </div>
      
      {/* Controls */}
      {!playing && !gameOver ? (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
            START
        </button>
      ) : (
        <button 
            onMouseDown={shoot} 
            disabled={gameOver}
            className="w-full py-4 bg-gray-900 border-t-2 border-[#39FF14] text-[#39FF14] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors"
        >
            FIRE PIN
        </button>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-2xl mb-2">SHATTERED</h2>
            <p className="text-white text-4xl font-bold mb-6">{pins.length} PINS</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              REBOOT
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}