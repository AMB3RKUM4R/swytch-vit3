import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function ShellGame() {
  const { triggerSmartLink } = useAdSystem();

  const [positions, setPositions] = useState([0, 1, 2]); 
  const [winningId] = useState(1); 
  const [shuffling, setShuffling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("FIND THE DATA CORE");
  const [gameOver, setGameOver] = useState(false);

  const shuffle = () => {
    setMessage("ENCRYPTING...");
    setRevealed(false);
    setShuffling(true);
    setGameOver(false);

    let shuffles = 0;
    const maxShuffles = 10;
    const interval = setInterval(() => {
      setPositions(prev => [...prev].sort(() => Math.random() - 0.5));
      shuffles++;
      if (shuffles >= maxShuffles) {
        clearInterval(interval);
        setShuffling(false);
        setMessage("SELECT A VAULT");
      }
    }, 250); 
  };

  const handlePick = (boxId: number) => {
    if (shuffling || revealed) return;
    setRevealed(true);
    setGameOver(true);
    if (boxId === winningId) {
      setMessage("ACCESS GRANTED");
    } else {
      setMessage("EMPTY VAULT");
    }
  };

  const handleRetry = () => {
      if (message.includes("EMPTY")) triggerSmartLink(); // Ad only on loss/retry
      shuffle();
  };

  return (
    <SwytchContainer title="DATA SHUFFLE">
      <div className="flex gap-4 mb-8 h-24 items-center justify-center w-full px-4">
        {positions.map((boxId) => (
          <div
            key={boxId}
            onClick={() => handlePick(boxId)}
            className={`w-24 h-24 border-4 rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-200
              ${shuffling ? "border-gray-500 animate-pulse" : "border-[#39FF14] bg-[#050505] hover:bg-[#39FF14]/20"}
              ${revealed && boxId === winningId ? "bg-[#39FF14] text-black shadow-[0_0_30px_#39FF14]" : "text-white"}
              ${revealed && boxId !== winningId ? "border-red-500 text-red-500 opacity-50" : ""}
            `}
          >
            {revealed && boxId === winningId && "♦"} 
            {!revealed && !shuffling && "?"}
          </div>
        ))}
      </div>

      <p className="text-gray-400 font-mono text-sm mb-6 h-6 animate-pulse">{message}</p>

      {!shuffling && (
        <button 
            onClick={gameOver ? handleRetry : shuffle} 
            className="w-full py-4 bg-white text-black font-bold uppercase hover:bg-[#39FF14] transition-colors"
        >
          {gameOver ? "NEW SHUFFLE" : "START SHUFFLE"}
        </button>
      )}
    </SwytchContainer>
  );
}