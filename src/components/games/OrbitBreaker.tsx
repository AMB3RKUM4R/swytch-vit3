import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function OrbitBreaker() {
  const { triggerSmartLink } = useAdSystem();

  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [targetZone, setTargetZone] = useState({ start: 45, end: 135 }); 
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setAngle((prev) => (prev + 5) % 360); // Speed
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const clickCheck = () => {
    if (!playing) {
      setPlaying(true);
      setScore(0);
      setGameOver(false);
      return;
    }

    // Normalizing angle logic for the 360 circle
    if (angle >= targetZone.start && angle <= targetZone.end) {
      setScore(s => s + 100);
      // Move target zone randomly
      const newStart = Math.floor(Math.random() * 260);
      setTargetZone({ start: newStart, end: newStart + 60 }); 
    } else {
      setPlaying(false);
      setGameOver(true);
    }
  };

  const handleRetry = () => {
      triggerSmartLink();
      setPlaying(true);
      setScore(0);
      setGameOver(false);
  };

  return (
    <SwytchContainer title="ORBIT BREAKER">
      <div className="relative w-64 h-64 mb-8 mx-auto mt-4">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>

        {/* Target Zone */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: `conic-gradient(transparent ${targetZone.start}deg, #39FF14 ${targetZone.start}deg, #39FF14 ${targetZone.end}deg, transparent ${targetZone.end}deg)`
          }}
        ></div>

        {/* Player Cursor */}
        <div 
          className="absolute top-0 left-0 w-full h-full flex justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-4 h-4 bg-white rounded-full mt-1 shadow-[0_0_15px_white]"></div>
        </div>

        {/* Center Score */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[#39FF14] font-black text-3xl">{score}</span>
        </div>
      </div>

      <button 
        onMouseDown={clickCheck} 
        disabled={gameOver}
        className="w-full py-6 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_25px_rgba(57,255,20,0.4)]"
      >
        {playing ? "BREACH" : "START ROTATION"}
      </button>

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-2xl mb-2">SYNC FAILED</h2>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RETRY
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}