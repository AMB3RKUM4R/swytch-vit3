import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const SPRITES = {
    glitch: "https://placehold.co/100x100/000000/39FF14?text=👾",
    firewall: "https://placehold.co/100x100/330000/FF0000?text=🛡️",
    energy: "https://placehold.co/100x100/000033/00FFFF?text=⚡"
};

const GRID_SIZE = 9;
const MAX_TIME = 30;

type EntityType = 'glitch' | 'firewall' | 'energy' | null;

export default function GlitchNinja() {
  const { triggerSmartLink } = useAdSystem();
  
  const [grid, setGrid] = useState<EntityType[]>(Array(GRID_SIZE).fill(null));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [gameOn, setGameOn] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  // SPAWNING & TIMER (Same logic logic as before, solid)
  useEffect(() => {
    let spawnInterval: NodeJS.Timeout;
    if (gameOn) {
      const speed = timeLeft > 20 ? 700 : timeLeft > 10 ? 500 : 350;
      spawnInterval = setInterval(() => {
        setGrid(currentGrid => {
          const newGrid = [...currentGrid];
          if (Math.random() > 0.7) newGrid[Math.floor(Math.random() * GRID_SIZE)] = null;
          
          const emptySlots = newGrid.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
          if (emptySlots.length > 0) {
            const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
            const rng = Math.random();
            if (rng < 0.7) newGrid[slot] = 'glitch'; 
            else if (rng < 0.9) newGrid[slot] = 'firewall';
            else newGrid[slot] = 'energy';
          }
          return newGrid;
        });
      }, speed);
    }
    return () => clearInterval(spawnInterval);
  }, [gameOn, timeLeft]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (gameOn && timeLeft > 0) {
      timerInterval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft <= 0) {
      setGameOn(false);
      setGameOver(true);
      setGrid(Array(GRID_SIZE).fill(null));
    }
    return () => clearInterval(timerInterval);
  }, [gameOn, timeLeft]);

  const startGame = () => {
    setGrid(Array(GRID_SIZE).fill(null));
    setScore(0);
    setCombo(1);
    setTimeLeft(MAX_TIME);
    setGameOn(true);
    setGameOver(false);
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame(); 
  };

  const handleSlotClick = (index: number) => {
    if (!gameOn) return;
    const entity = grid[index];

    if (entity === 'glitch') {
        const points = 100 * comboRef.current;
        setScore(s => s + points);
        setCombo(c => Math.min(c + 1, 5));
        clearSlot(index);
    } else if (entity === 'firewall') {
        setScore(s => Math.max(0, s - 500));
        setCombo(1);
        setTimeLeft(t => Math.max(0, t - 3));
        clearSlot(index);
    } else if (entity === 'energy') {
        setTimeLeft(t => Math.min(t + 5, MAX_TIME));
        clearSlot(index);
    } else {
        setCombo(1);
        setScore(s => Math.max(0, s - 50));
    }
  };

  const clearSlot = (index: number) => setGrid(prev => { const n = [...prev]; n[index] = null; return n; });

  return (
    <SwytchContainer title="GLITCH NINJA">
      <div className="flex justify-between items-center w-full px-4 mb-4 border-b border-gray-800 pb-2">
          <div className="text-left">
              <p className="text-[10px] text-gray-500 uppercase">COMBO</p>
              <p className={`text-2xl font-black ${combo > 1 ? "text-[#39FF14] animate-pulse" : "text-white"}`}>x{combo}</p>
          </div>
          <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">TIMER</p>
              <p className={`text-2xl font-mono ${timeLeft < 5 ? "text-red-500 animate-ping" : "text-white"}`}>{timeLeft}s</p>
          </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10 w-full max-w-[300px] mx-auto">
        {grid.map((entity, i) => (
          <div 
            key={i}
            onMouseDown={() => handleSlotClick(i)}
            className={`
                w-20 h-20 border border-gray-800 rounded-md flex items-center justify-center cursor-pointer transition-all duration-100 bg-[#050505] overflow-hidden
                ${entity ? 'active:scale-95' : ''}
            `}
          >
            {entity && <img src={SPRITES[entity]} className="w-full h-full object-cover animate-bounce-short" />}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Score</p>
          <p className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{score}</p>
      </div>

      {!gameOn && !gameOver && (
        <button onClick={startGame} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]">
          START PURGE
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-4xl font-black text-[#39FF14] mb-2 uppercase italic">Mission Over</h2>
            <p className="text-gray-500 font-mono text-xs mb-8">Score: {scoreRef.current}</p>
            <button onClick={handleRetry} className="px-10 py-4 bg-[#39FF14] text-black font-black uppercase tracking-[0.2em] hover:bg-white transition-all">
                RETRY
            </button>
        </div>
      )}
      
      <style>{`
        .animate-bounce-short { animation: bounce 0.3s ease-out; }
      `}</style>
    </SwytchContainer>
  );
}