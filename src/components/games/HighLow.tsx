import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function HighLow() {
  const { triggerSmartLink } = useAdSystem();

  const [currentNum, setCurrentNum] = useState(50);
  const [message, setMessage] = useState("PREDICT THE NEXT HASH");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const guess = (isHigher: boolean) => {
    const nextNum = Math.floor(Math.random() * 100) + 1;
    
    // Prevent duplicates for better UX
    if (nextNum === currentNum) {
        guess(isHigher); 
        return;
    }

    const win = isHigher ? nextNum > currentNum : nextNum < currentNum;

    if (win) {
      setMessage("CORRECT // CHAIN CONTINUED");
      setScore(score + 1);
    } else {
      setMessage("FAILURE // LINK BROKEN");
      setGameOver(true);
    }
    setCurrentNum(nextNum);
  };

  const handleRestart = () => {
    triggerSmartLink();
    setCurrentNum(50);
    setMessage("PREDICT THE NEXT HASH");
    setScore(0);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="HIGH / LOW">
      <div className="text-8xl font-black text-[#39FF14] mb-8 glow-text">
        {currentNum}
      </div>
      
      <div className="flex gap-4 w-full px-8 mb-8">
        <button 
            onClick={() => guess(false)} 
            disabled={gameOver}
            className="flex-1 py-6 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          LOWER
        </button>
        <button 
            onClick={() => guess(true)} 
            disabled={gameOver}
            className="flex-1 py-6 border-2 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          HIGHER
        </button>
      </div>

      <div className="text-white font-mono text-sm mb-2">
        STREAK: <span className="text-[#39FF14] font-bold text-xl">{score}</span>
      </div>
      <p className={`text-xs font-mono h-4 ${gameOver ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
          {message}
      </p>

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-3xl mb-2">LINK SEVERED</h2>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRestart} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
              RECONNECT
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}