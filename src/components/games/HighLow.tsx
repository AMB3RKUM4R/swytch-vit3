import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const BG_IMAGES = [
    "https://placehold.co/600x400/001100/003300?text=SAFE+ZONE", // Streak 0-2
    "https://placehold.co/600x400/222200/444400?text=CAUTION",   // Streak 3-5
    "https://placehold.co/600x400/330000/660000?text=DANGER"     // Streak 6+
];

export default function HighLow() {
  const { triggerSmartLink } = useAdSystem();

  const [currentNum, setCurrentNum] = useState(50);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const guess = (isHigher: boolean) => {
    const nextNum = Math.floor(Math.random() * 100) + 1;
    if (nextNum === currentNum) { guess(isHigher); return; }

    const win = isHigher ? nextNum > currentNum : nextNum < currentNum;

    if (win) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > 2) setBgIndex(1);
      if (newStreak > 5) setBgIndex(2);
    } else {
      setGameOver(true);
    }
    setCurrentNum(nextNum);
  };

  const handleRestart = () => {
    triggerSmartLink();
    setCurrentNum(50);
    setStreak(0);
    setBgIndex(0);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="HIGH / LOW">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-30 transition-opacity duration-500">
          <img src={BG_IMAGES[bgIndex]} className="w-full h-full object-cover" alt="bg" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
          <div className="w-40 h-56 bg-black border-4 border-[#39FF14] rounded-xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(57,255,20,0.2)]">
            <span className="text-8xl font-black text-[#39FF14] drop-shadow-[0_0_10px_#39FF14]">{currentNum}</span>
          </div>
          
          <div className="flex gap-4 w-full px-4 mb-6">
            <button 
                onClick={() => guess(false)} 
                disabled={gameOver}
                className="flex-1 py-4 border-2 border-red-500 bg-black/50 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest transition-all"
            >
              LOWER
            </button>
            <button 
                onClick={() => guess(true)} 
                disabled={gameOver}
                className="flex-1 py-4 border-2 border-[#39FF14] bg-black/50 text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-widest transition-all"
            >
              HIGHER
            </button>
          </div>

          <div className="flex justify-between w-full px-8 text-xs font-mono uppercase text-gray-400">
            <span>RISK LEVEL: <span className={bgIndex === 2 ? "text-red-500 animate-pulse" : "text-white"}>{bgIndex === 2 ? "CRITICAL" : bgIndex === 1 ? "MODERATE" : "STABLE"}</span></span>
            <span>STREAK: <span className="text-[#39FF14] font-bold text-lg">{streak}</span></span>
          </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-red-500 font-black text-4xl mb-2 tracking-tighter">LINK SEVERED</h2>
            <p className="text-gray-500 text-sm mb-6">FINAL STREAK: {streak}</p>
            <button onClick={handleRestart} className="px-10 py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_40px_#39FF14]">
              RECONNECT
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}