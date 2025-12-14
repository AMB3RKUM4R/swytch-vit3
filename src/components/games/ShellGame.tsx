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
  const [won, setWon] = useState(false);

  const shuffle = () => {
    setMessage("SHUFFLING...");
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
      setWon(true);
    } else {
      setMessage("EMPTY VAULT");
      setWon(false);
    }
  };

  const handleRetry = () => {
      triggerSmartLink();
      shuffle();
  };

  return (
    <SwytchContainer title="DATA SHUFFLE">
      <div className="flex gap-4 mb-8 h-32 items-center justify-center w-full px-2">
        {positions.map((boxId) => (
          <div
            key={boxId}
            onClick={() => handlePick(boxId)}
            className={`w-24 h-24 border-2 rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-200 bg-[#050505]
              ${shuffling ? "border-gray-600 animate-pulse" : "border-[#39FF14] hover:border-white"}
              ${revealed && boxId === winningId ? "shadow-[0_0_40px_#39FF14] border-white" : ""}
              ${revealed && boxId !== winningId ? "opacity-30" : ""}
            `}
          >
            {revealed && boxId === winningId ? (
                <img src="https://placehold.co/100x100/000000/39FF14?text=💎" className="w-12 h-12 animate-bounce" />
            ) : (
                <img src="https://placehold.co/100x100/000000/666666?text=📦" className="w-12 h-12 opacity-50" />
            )}
          </div>
        ))}
      </div>

      <p className={`font-mono text-sm uppercase tracking-widest h-6 mb-6 text-center ${won ? "text-[#39FF14]" : "text-gray-400"}`}>
        {message}
      </p>

      {!shuffling && !gameOver && (
        <button onClick={shuffle} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
          START SHUFFLE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in text-center p-6">
            <h2 className={`${won ? "text-[#39FF14]" : "text-red-500"} font-black text-3xl mb-2`}>
                {won ? "FOUND" : "LOST"}
            </h2>
            <button onClick={handleRetry} className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-[#39FF14] transition-colors">
              PLAY AGAIN
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}