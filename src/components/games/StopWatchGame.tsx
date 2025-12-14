import { useState, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

export default function StopWatchGame() {
  const { triggerSmartLink } = useAdSystem();

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("STOP AT X.00");
  const [gameOver, setGameOver] = useState(false);
  const [perfect, setPerfect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAction = () => {
    if (running) {
      if (timerRef.current) clearInterval(timerRef.current);
      setRunning(false);
      setGameOver(true);
      
      const decimalPart = (time % 100); 
      // Allow slight margin of error (0-5 or 95-99)
      if (decimalPart < 5 || decimalPart > 95) {
        setResult("PERFECT SYNC");
        setPerfect(true);
      } else {
        setResult(`OFFSET: .${String(decimalPart).padStart(2,'0')}`);
        setPerfect(false);
      }
    } else {
      setTime(0);
      setResult("RUNNING...");
      setRunning(true);
      setGameOver(false);
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1); 
      }, 10);
    }
  };

  const handleRestart = () => {
      triggerSmartLink();
      handleAction(); // Starts the game immediately
  };

  const formatTime = (t: number) => (t / 100).toFixed(2);

  return (
    <SwytchContainer title="CHRONO SYNC">
      <div className="relative mb-8">
          <div className="text-7xl font-mono font-black text-white tracking-tighter">
            {formatTime(time)}<span className="text-2xl text-[#39FF14] ml-1">s</span>
          </div>
      </div>
      
      <p className={`text-lg font-black uppercase mb-8 h-8 tracking-widest ${perfect ? 'text-[#39FF14]' : gameOver ? 'text-red-500' : 'text-gray-500'}`}>
        {result}
      </p>

      {!gameOver && (
        <button 
            onClick={handleAction}
            className={`w-full py-6 font-black text-xl uppercase tracking-[0.2em] transition-all ${
            running 
                ? "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_30px_red]" 
                : "bg-[#39FF14] text-black hover:bg-white shadow-[0_0_30px_#39FF14]"
            }`}
        >
            {running ? "HALT" : "INITIATE"}
        </button>
      )}

      {gameOver && (
        <button 
            onClick={handleRestart}
            className="w-full py-6 border-2 border-[#39FF14] text-[#39FF14] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors"
        >
            RE-INITIATE
        </button>
      )}
    </SwytchContainer>
  );
}