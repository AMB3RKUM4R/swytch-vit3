import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const CORE_COLORS = ["#39FF14", "#00FFFF", "#FF00FF"];

export default function PinCore() {
  const { triggerSmartLink } = useAdSystem();

  const [pins, setPins] = useState<number[]>([]); 
  const [rotation, setRotation] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const reqRef = useRef<number>();

  const loop = () => {
    setRotation(r => (r + 2.5 + (pins.length * 0.1)) % 360); // Gets faster
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const shoot = () => {
    if (!playing || gameOver) return;
    
    const currentAngle = (360 - rotation + 90) % 360; 
    const collision = pins.some(p => Math.abs(p - currentAngle) < 15);
    
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
    setColorIdx(prev => (prev + 1) % CORE_COLORS.length);
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  const activeColor = CORE_COLORS[colorIdx];

  return (
    <SwytchContainer title="PIN THE CORE">
      <div className="relative w-[300px] h-[300px] flex items-center justify-center overflow-hidden mb-4">
        {/* Core */}
        <div 
          className="w-24 h-24 rounded-full relative flex items-center justify-center transition-all duration-75"
          style={{ 
              transform: `rotate(${rotation}deg)`,
              backgroundColor: activeColor,
              boxShadow: `0 0 30px ${activeColor}`
          }}
        >
           <span className="text-black font-black text-xl">{pins.length}</span>
           
           {/* Pins */}
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

        {/* Player Pin */}
        <div className="absolute bottom-8 w-1 h-12 bg-white animate-pulse"></div>
      </div>
      
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