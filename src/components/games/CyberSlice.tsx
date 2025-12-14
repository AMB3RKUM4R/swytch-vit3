import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const TARGET_IMGS = [
    "https://placehold.co/300x50/39FF14/000000?text=DATA",
    "https://placehold.co/300x50/00FFFF/000000?text=CODE",
    "https://placehold.co/300x50/FF00FF/000000?text=CORE"
];

export default function CyberSlice() {
  const { triggerSmartLink } = useAdSystem();

  const [width, setWidth] = useState(200); 
  const [left, setLeft] = useState(0);     
  const [direction, setDirection] = useState(1); 
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [textureIdx, setTextureIdx] = useState(0);
  
  const containerWidth = 300; 
  const requestRef = useRef<number>();

  const moveBar = () => {
    setLeft((prev) => {
      let nextPos = prev + (4 + (score * 0.5) * direction); // Gets faster
      if (nextPos > containerWidth - width || nextPos < 0) {
        setDirection((prevDir) => prevDir * -1); 
        return prev;
      }
      return nextPos;
    });
    requestRef.current = requestAnimationFrame(moveBar);
  };

  useEffect(() => {
    if(playing) requestRef.current = requestAnimationFrame(moveBar);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [direction, playing, width]);

  const handleAction = () => {
    if (!playing) {
      setPlaying(true);
      setScore(0);
      setWidth(200);
      setLeft(0);
      setGameOver(false);
    } else {
      const center = (containerWidth - width) / 2; 
      const diff = Math.abs(left - center); 
      
      if (diff > width) {
        setPlaying(false);
        setWidth(0); 
        setGameOver(true);
      } else {
        // Slice logic
        if (diff > 5) setWidth((prev) => prev - diff);
        setScore((prev) => prev + 1);
        // Cycle texture
        setTextureIdx(prev => (prev + 1) % TARGET_IMGS.length);
      }
    }
  };

  const handleRetry = () => {
      triggerSmartLink();
      handleAction();
  };

  return (
    <SwytchContainer title="CYBER SLICE">
      <div className="relative h-64 w-[300px] border-x-2 border-dashed border-gray-800 bg-[#050505] overflow-hidden mb-6 mx-auto rounded-lg shadow-inner">
        {/* Center Line Guide */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gray-500 -translate-x-1/2 z-0 opacity-50"></div>
        
        {/* Moving Bar with Texture */}
        <div 
          className="absolute top-1/2 h-12 shadow-[0_0_20px_#39FF14] z-10 transition-none overflow-hidden rounded-sm"
          style={{ 
            width: `${width}px`, 
            left: `${left}px`,
            opacity: width > 0 ? 1 : 0,
            transform: 'translateY(-50%)'
          }}
        >
            <img src={TARGET_IMGS[textureIdx]} className="w-full h-full object-cover" />
        </div>
        
        {gameOver && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-3xl z-20 animate-ping">MISS</div>}
      </div>

      <div className="flex justify-between w-full px-8 text-white font-mono text-sm mb-6">
        <span>INTEGRITY: {Math.floor((width / 200) * 100)}%</span>
        <span>SCORE: <span className="text-[#39FF14] font-bold">{score}</span></span>
      </div>

      {!gameOver ? (
        <button onClick={handleAction} className="w-full py-4 border-b-4 border-[#39FF14] bg-[#111] text-[#39FF14] font-bold uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-all">
            {playing ? "LOCK" : "INITIALIZE"}
        </button>
      ) : (
        <button onClick={handleRetry} className="w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-[0_0_30px_red]">
            RE-ALIGN
        </button>
      )}
    </SwytchContainer>
  );
}