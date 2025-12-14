import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

// 4 Distinct Neon Runes
const PADS = [
    "https://placehold.co/200x200/000000/39FF14?text=▲", // Top-Left (Green)
    "https://placehold.co/200x200/000000/FF0000?text=■", // Top-Right (Red)
    "https://placehold.co/200x200/000000/FFFF00?text=●", // Bottom-Left (Yellow)
    "https://placehold.co/200x200/000000/00FFFF?text=★"  // Bottom-Right (Blue)
];

export default function CyberSimon() {
  const { triggerSmartLink } = useAdSystem();

  const [sequence, setSequence] = useState<number[]>([]);
  const [playingIdx, setPlayingIdx] = useState(0); 
  const [userStep, setUserStep] = useState(0);     
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);        
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayingIdx(0);
    setUserStep(0);
    setIsPlayerTurn(false);
    setGameOver(false);
  };

  useEffect(() => {
    if (sequence.length > 0 && !isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        setFlash(sequence[playingIdx]);
        setTimeout(() => setFlash(null), 300);

        if (playingIdx < sequence.length - 1) {
          setPlayingIdx(prev => prev + 1);
        } else {
          setTimeout(() => setIsPlayerTurn(true), 500);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [sequence, playingIdx, isPlayerTurn, gameOver]);

  const handlePadClick = (index: number) => {
    if (!isPlayerTurn || gameOver) return;

    setFlash(index);
    setTimeout(() => setFlash(null), 200);

    if (index === sequence[userStep]) {
      if (userStep === sequence.length - 1) {
        setIsPlayerTurn(false);
        setUserStep(0);
        setPlayingIdx(0);
        setTimeout(() => {
            setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
        }, 800);
      } else {
        setUserStep(prev => prev + 1);
      }
    } else {
      setGameOver(true);
    }
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="CYBER SIMON">
      <div className="grid grid-cols-2 gap-4 mb-8">
        {PADS.map((src, i) => (
          <div
            key={i}
            onClick={() => handlePadClick(i)}
            className={`relative w-24 h-24 border-2 rounded-xl cursor-pointer transition-all duration-100 overflow-hidden
              ${flash === i 
                ? "border-[#39FF14] shadow-[0_0_40px_#39FF14] scale-105 z-10" 
                : "border-gray-800 opacity-50 hover:opacity-80"
              }`}
          >
              <img src={src} className="w-full h-full object-cover" />
              {flash === i && <div className="absolute inset-0 bg-white/30 animate-ping"></div>}
          </div>
        ))}
      </div>

      <p className={`font-mono text-sm uppercase tracking-widest h-6 ${gameOver ? 'text-red-500 animate-pulse' : 'text-[#39FF14]'}`}>
          {gameOver 
          ? "SEQUENCE CORRUPTED" 
          : isPlayerTurn 
              ? ">> REPEAT SEQUENCE <<" 
              : sequence.length > 0 ? "OBSERVING..." : "READY"}
      </p>

      {!sequence.length && (
        <button onClick={startGame} className="w-full mt-6 py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
          INITIATE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in text-center p-6">
            <h2 className="text-red-500 font-black text-3xl mb-2">FAILED</h2>
            <p className="text-gray-500 text-xs uppercase mb-1">Score</p>
            <p className="text-white text-5xl font-bold mb-8">{sequence.length - 1}</p>
            <button onClick={handleRetry} className="px-10 py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RETRY
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}