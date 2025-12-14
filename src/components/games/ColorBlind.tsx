import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function ColorBlind() {
  const { triggerSmartLink } = useAdSystem();
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [targetIndex, setTargetIndex] = useState(Math.floor(Math.random() * 16));
  const [gameOver, setGameOver] = useState(false);

  const getOpacity = () => Math.min(0.7 + (level * 0.02), 0.95);

  const handleClick = (index: number) => {
    if (gameOver) return;
    
    if (index === targetIndex) {
      setScore(s => s + 1);
      setLevel(l => l + 1);
      setTargetIndex(Math.floor(Math.random() * 16));
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    triggerSmartLink();
    setScore(0);
    setLevel(1);
    setTargetIndex(Math.floor(Math.random() * 16));
    setGameOver(false);
  };

  return (
    <SwytchContainer title="PIXEL DIFF">
      <div className="relative mb-6">
          <div className="grid grid-cols-4 gap-2 p-2 bg-gray-900 rounded-lg">
            {Array.from({ length: 16 }).map((_, i) => (
            <div
                key={i}
                onClick={() => handleClick(i)}
                style={{
                backgroundColor: '#39FF14',
                opacity: i === targetIndex ? getOpacity() : 1
                }}
                className={`w-14 h-14 rounded-sm cursor-pointer transition-transform active:scale-95 ${gameOver ? 'pointer-events-none' : ''}`}
            ></div>
            ))}
          </div>
          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-10 pointer-events-none"></div>
      </div>

      <div className="flex justify-between w-full px-8 text-white font-mono text-sm mb-4">
        <span>LEVEL: {level}</span>
        <span>SCORE: <span className="text-[#39FF14] font-bold">{score}</span></span>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-red-500 font-black text-2xl mb-2">VISION FAILURE</h2>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRestart} className="px-10 py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
              RECALIBRATE
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}