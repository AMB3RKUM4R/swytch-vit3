import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function CyberSlice() {
  const { triggerSmartLink } = useAdSystem();

  const [width, setWidth] = useState(200); 
  const [left, setLeft] = useState(0);     
  const [direction, setDirection] = useState(1); 
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const containerWidth = 300; 
  const requestRef = useRef<number>();

  const moveBar = () => {
    setLeft((prev) => {
      let nextPos = prev + (4 * direction); // Speed
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
      } else if (diff > 5) { 
        setWidth((prev) => prev - diff);
        setScore((prev) => prev + 1);
      } else {
        setScore((prev) => prev + 2); // Perfect cut
      }
    }
  };

  const handleRetry = () => {
      triggerSmartLink();
      handleAction();
  };

  return (
    <SwytchContainer title="CYBER SLICE">
      <div className="relative h-64 w-[300px] border-x-2 border-dashed border-gray-800 bg-[#050505] overflow-hidden mb-6 mx-auto">
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gray-600 -translate-x-1/2 z-0"></div>
        
        <div 
          className="absolute top-1/2 h-12 bg-[#39FF14] shadow-[0_0_20px_#39FF14] z-10 transition-none"
          style={{ 
            width: `${width}px`, 
            left: `${left}px`,
            opacity: width > 0 ? 1 : 0.5,
            transform: 'translateY(-50%)'
          }}
        ></div>
        
        {width <= 0 && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-2xl z-20">SIGNAL LOST</div>}
      </div>

      <div className="flex justify-between w-full px-8 text-white font-mono text-sm mb-6">
        <span>WIDTH: {Math.floor(width)}px</span>
        <span>SCORE: <span className="text-[#39FF14]">{score}</span></span>
      </div>

      {!gameOver ? (
        <button onClick={handleAction} className="w-full py-4 border-2 border-[#39FF14] text-[#39FF14] font-bold uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors">
            {playing ? "LOCK POSITION" : "INITIALIZE"}
        </button>
      ) : (
        <button onClick={handleRetry} className="w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
            RE-ALIGN
        </button>
      )}
    </SwytchContainer>
  );
}