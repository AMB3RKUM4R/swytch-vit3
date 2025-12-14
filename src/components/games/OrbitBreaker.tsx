import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const CORES = [
    "https://placehold.co/100x100/000000/39FF14?text=🟢",
    "https://placehold.co/100x100/000000/00FFFF?text=🔵",
    "https://placehold.co/100x100/000000/FF00FF?text=🟣"
];

export default function OrbitBreaker() {
  const { triggerSmartLink } = useAdSystem();

  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [targetZone, setTargetZone] = useState({ start: 45, end: 135 }); 
  const [gameOver, setGameOver] = useState(false);
  const [coreIdx, setCoreIdx] = useState(0);
  const reqRef = useRef<number>();

  const loop = () => {
    setAngle((prev) => (prev + (5 + score * 0.01)) % 360); // Speed increases with score
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

    if (angle >= targetZone.start && angle <= targetZone.end) {
      setScore(s => s + 100);
      const newStart = Math.floor(Math.random() * 260);
      setTargetZone({ start: newStart, end: newStart + 60 }); 
      setCoreIdx(prev => (prev + 1) % CORES.length); // Change core
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
        <div className="absolute inset-0 rounded-full border-4 border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]"></div>

        {/* Target Zone */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: `conic-gradient(transparent ${targetZone.start}deg, #39FF14 ${targetZone.start}deg, #39FF14 ${targetZone.end}deg, transparent ${targetZone.end}deg)`,
            opacity: 0.5
          }}
        ></div>

        {/* Player Cursor */}
        <div 
          className="absolute top-0 left-0 w-full h-full flex justify-center pointer-events-none"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-3 h-8 bg-white rounded-full -mt-4 shadow-[0_0_15px_white]"></div>
        </div>

        {/* Center Core Image */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-[#39FF14] shadow-[0_0_30px_#39FF14] ${playing ? 'animate-pulse' : ''}`}>
                <img src={CORES[coreIdx]} className="w-full h-full object-cover" />
            </div>
        </div>
        
        {/* Score Overlay */}
        <div className="absolute -bottom-8 left-0 right-0 text-center font-mono text-[#39FF14] font-bold">
            DATA: {score}
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
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-red-500 font-black text-3xl mb-2">ORBIT DECAY</h2>
            <p className="text-gray-400 text-sm mb-6">FINAL SCORE: {score}</p>
            <button onClick={handleRetry} className="px-10 py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white shadow-[0_0_40px_#39FF14]">
              RETRY
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}