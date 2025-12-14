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
        setTimeout(startGame, 1000); // Auto next level
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
            className={`w-14 h-14 border border-gray-800 flex items-center justify-center font-bold text-xl select-none cursor-pointer rounded-md transition-all
              ${phase === "memorize" && val ? "text-[#39FF14] border-[#39FF14] bg-[#39FF14]/10" : "text-transparent"}
              ${phase === "recall" && val && val < nextNum ? "text-gray-500 border-gray-600 bg-gray-900" : ""} 
              ${phase === "lost" && val ? "text-red-500 border-red-500" : ""}
            `}
          >
            {(phase === "memorize" || phase === "lost" || phase === "won" || (phase === "recall" && val && val < nextNum)) ? val : ""}
          </div>
        ))}
      </div>

      <div className="h-8 mb-4 text-center">
        <p className={`font-mono text-xs uppercase tracking-widest ${gameOver ? 'text-red-500' : 'text-white'}`}>
            {phase === "idle" && "READY TO SCAN?"}
            {phase === "memorize" && "MEMORIZE POSITIONS..."}
            {phase === "recall" && `LOCATE NUMBER: ${nextNum}`}
            {phase === "won" && "SUCCESS. UPLOADING..."}
            {phase === "lost" && "SEQUENCE FAILED."}
        </p>
      </div>

      {phase === "idle" && !gameOver && (
        <button onClick={startGame} className="w-full py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
          START SCAN
        </button>
      )}

      {gameOver && (
        <button onClick={handleRestart} className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
          RETRY
        </button>
      )}
    </SwytchContainer>
  );
}