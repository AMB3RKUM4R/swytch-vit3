import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const COLORS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

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
        setTimeout(() => setFlash(null), 300); // Faster flash

        if (playingIdx < sequence.length - 1) {
          setPlayingIdx(prev => prev + 1);
        } else {
          setTimeout(() => setIsPlayerTurn(true), 500);
        }
      }, 600); // Delay between flashes
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
        {COLORS.map((_, i) => (
          <div
            key={i}
            onClick={() => handlePadClick(i)}
            className={`w-24 h-24 border-2 rounded-lg cursor-pointer transition-all duration-100 ${
              flash === i 
                ? "bg-[#39FF14] border-[#39FF14] shadow-[0_0_40px_#39FF14]" 
                : "bg-black/50 border-gray-800 hover:border-[#39FF14]/50"
            }`}
          ></div>
        ))}
      </div>

      <div className="h-8 mb-4">
        <p className={`font-mono text-sm uppercase tracking-widest ${gameOver ? 'text-red-500 animate-pulse' : 'text-[#39FF14]'}`}>
            {gameOver 
            ? "SEQUENCE CORRUPTED" 
            : isPlayerTurn 
                ? ">> ENTER SEQUENCE <<" 
                : sequence.length > 0 ? "OBSERVING..." : "READY"}
        </p>
      </div>

      {!sequence.length && (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
          INITIATE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-2xl mb-2">FAILED</h2>
            <p className="text-gray-500 text-xs uppercase mb-1">Sequence Length</p>
            <p className="text-white text-4xl font-bold mb-6">{sequence.length - 1}</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              REBOOT SYSTEM
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}