import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function SequenceEye() {
  const { triggerSmartLink } = useAdSystem();

  const [grid, setGrid] = useState<(number | null)[]>(Array(16).fill(null)); 
  const [phase, setPhase] = useState("idle"); 
  const [nextNum, setNextNum] = useState(1);
  const [level, setLevel] = useState(3); 
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    const newGrid = Array(16).fill(null);
    const indices = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);
    
    for(let i = 0; i < level; i++) {
      newGrid[indices[i]] = i + 1; 
    }

    setGrid(newGrid);
    setPhase("memorize");
    setNextNum(1);
    setGameOver(false);

    setTimeout(() => {
      setPhase("recall");
    }, 2000);
  };

  const handleCellClick = (value: number | null) => {
    if (phase !== "recall") return;

    if (value === nextNum) {
      if (nextNum === level) {
        setPhase("won");
        setLevel(l => Math.min(l + 1, 16)); 
        setTimeout(startGame, 1000); 
      } else {
        setNextNum(n => n + 1);
      }
    } else {
      setPhase("lost");
      setGameOver(true);
    }
  };

  const handleRestart = () => {
      triggerSmartLink();
      setLevel(3);
      setGrid(Array(16).fill(null));
      setPhase("idle");
      setGameOver(false);
  };

  return (
    <SwytchContainer title="SEQUENCE EYE">
      <div className="grid grid-cols-4 gap-2 mb-6">
        {grid.map((val, i) => (
          <div
            key={i}
            onClick={() => handleCellClick(val)}
            className={`w-16 h-16 border-2 flex items-center justify-center font-black text-xl select-none cursor-pointer rounded-md transition-all duration-300
              ${phase === "memorize" && val ? "border-[#39FF14] bg-[#39FF14] text-black shadow-[0_0_20px_#39FF14]" : "border-gray-800 bg-[#050505] text-transparent"}
              ${phase === "recall" && val && val < nextNum ? "border-gray-600 bg-gray-800 text-gray-500" : ""} 
              ${phase === "lost" && val ? "border-red-500 bg-red-500 text-black" : ""}
            `}
          >
            {(phase === "memorize" || phase === "lost" || phase === "won" || (phase === "recall" && val && val < nextNum)) ? val : ""}
          </div>
        ))}
      </div>

      <div className="h-8 mb-4 text-center">
        <p className={`font-mono text-xs uppercase tracking-widest ${gameOver ? 'text-red-500' : 'text-white'}`}>
            {phase === "idle" && "READY TO SCAN?"}
            {phase === "memorize" && "MEMORIZE PATTERN..."}
            {phase === "recall" && `LOCATE: ${nextNum}`}
            {phase === "won" && "SUCCESS"}
            {phase === "lost" && "FAILURE"}
        </p>
      </div>

      {phase === "idle" && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
          START SCAN
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in text-center p-6">
            <h2 className="text-red-500 font-black text-3xl mb-2">BREACHED</h2>
            <p className="text-gray-500 text-xs uppercase mb-1">Level Reached</p>
            <p className="text-white text-5xl font-bold mb-8">{level}</p>
            <button onClick={handleRestart} className="px-10 py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RETRY
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}