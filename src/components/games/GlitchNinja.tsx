import { useState, useEffect, useRef } from 'react';
import { Bug, ShieldAlert, Zap, Crosshair } from 'lucide-react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const GRID_SIZE = 9;
const MAX_TIME = 30;

type EntityType = 'glitch' | 'firewall' | 'energy' | null;

export default function GlitchNinja() {
  const { triggerSmartLink } = useAdSystem();
  
  // Game State
  const [grid, setGrid] = useState<EntityType[]>(Array(GRID_SIZE).fill(null));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [gameOn, setGameOn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("SYSTEM STANDBY");

  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  // SPAWNING
  useEffect(() => {
    let spawnInterval: NodeJS.Timeout;
    if (gameOn) {
      const speed = timeLeft > 20 ? 700 : timeLeft > 10 ? 500 : 350;
      spawnInterval = setInterval(() => {
        setGrid(currentGrid => {
          const newGrid = [...currentGrid];
          // Decay random old entity
          if (Math.random() > 0.7) {
             const randomClear = Math.floor(Math.random() * GRID_SIZE);
             newGrid[randomClear] = null;
          }
          
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

  // TIMER
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (gameOn && timeLeft > 0) {
      timerInterval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft <= 0) {
      endGame();
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
    setMessage("PURGE PROTOCOL ACTIVE");
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame(); 
  };

  const endGame = () => {
    setGameOn(false);
    setGameOver(true);
    setGrid(Array(GRID_SIZE).fill(null));
    setMessage("SESSION COMPLETE");
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
        setMessage("FIREWALL HIT! // SYSTEM DAMAGED");
        clearSlot(index);
    } else if (entity === 'energy') {
        setTimeLeft(t => Math.min(t + 5, MAX_TIME));
        setMessage("ENERGY RESTORED");
        clearSlot(index);
    } else {
        setCombo(1);
        setScore(s => Math.max(0, s - 50));
    }
  };

  const clearSlot = (index: number) => {
    setGrid(prev => { const n = [...prev]; n[index] = null; return n; });
  };

  const getEntityIcon = (type: EntityType) => {
      switch(type) {
          case 'glitch': return <Bug className="w-8 h-8 text-[#39FF14] animate-pulse drop-shadow-[0_0_8px_#39FF14]" />;
          case 'firewall': return <ShieldAlert className="w-8 h-8 text-red-500 drop-shadow-[0_0_8px_red]" />;
          case 'energy': return <Zap className="w-8 h-8 text-blue-400 animate-bounce drop-shadow-[0_0_8px_blue]" />;
          default: return null;
      }
  };

  return (
    <SwytchContainer title="GLITCH NINJA 2.0">
      
      {/* HUD */}
      <div className="flex justify-between items-center w-full px-4 mb-6 border-b border-gray-800 pb-2 font-mono">
          <div className="text-left">
              <p className="text-[10px] text-gray-500 uppercase">MULTIPLIER</p>
              <p className={`text-2xl font-black ${combo > 1 ? "text-[#39FF14] animate-pulse" : "text-white"}`}>x{combo}</p>
          </div>
          <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">TIME REMAINING</p>
              <p className={`text-2xl font-mono ${timeLeft < 5 ? "text-red-500 animate-ping" : "text-white"}`}>
                  {timeLeft}s
              </p>
          </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        {grid.map((entity, i) => (
          <div 
            key={i}
            onMouseDown={() => handleSlotClick(i)}
            className={`
                w-20 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-100 relative overflow-hidden
                ${entity === 'glitch' ? "border-[#39FF14] bg-[#39FF14]/20 shadow-[0_0_20px_#39FF14]" : 
                  entity === 'firewall' ? "border-red-500 bg-red-900/30 shadow-[0_0_15px_red]" : 
                  entity === 'energy' ? "border-blue-500 bg-blue-900/30 shadow-[0_0_15px_blue]" :
                  "border-gray-800 bg-[#050505] hover:border-gray-600"}
            `}
          >
            {/* Grid Pattern BG */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
            
            {getEntityIcon(entity)}
            
            {!entity && <Crosshair className="w-4 h-4 text-gray-800 opacity-20" />}
          </div>
        ))}
      </div>

      {/* MESSAGE */}
      <div className="w-full text-center mb-4 h-6">
          <p className="text-xs font-mono text-[#39FF14] uppercase tracking-widest animate-pulse">
              {gameOn ? (combo > 3 ? ">> MAX OVERDRIVE <<" : message) : message}
          </p>
      </div>

      {/* SCORE */}
      <div className="text-4xl font-black text-white mb-6 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {score.toLocaleString()} <span className="text-xs text-gray-500 font-normal align-middle">PTS</span>
      </div>

      {/* CONTROLS */}
      {!gameOn && !gameOver && (
        <button 
            onClick={startGame} 
            className="w-full py-4 border-2 border-[#39FF14] text-[#39FF14] font-black uppercase tracking-[0.3em] hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]"
        >
          INITIATE LINK
        </button>
      )}

      {/* GAME OVER */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-4xl font-black text-[#39FF14] mb-2 uppercase italic tracking-tighter">Mission Report</h2>
            <p className="text-gray-500 font-mono text-xs mb-8">Session ID: {Math.floor(Math.random()*99999)}</p>
            
            <div className="mb-8">
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Final Score</p>
                <p className="text-6xl font-black text-white drop-shadow-[0_0_20px_#39FF14]">{scoreRef.current}</p>
            </div>

            <button 
                onClick={handleRetry}
                className="px-10 py-4 bg-[#39FF14] text-black font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_40px_#39FF14]"
            >
                RETRY PROTOCOL
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}