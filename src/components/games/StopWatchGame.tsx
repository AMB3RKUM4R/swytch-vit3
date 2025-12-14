import { useState, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const RINGS = {
    idle: "https://placehold.co/300x300/000000/39FF14?text=⚪",
    running: "https://placehold.co/300x300/000000/39FF14?text=🟢",
    fail: "https://placehold.co/300x300/000000/FF0000?text=🔴"
};

export default function StopWatchGame() {
  const { triggerSmartLink } = useAdSystem();

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [perfect, setPerfect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAction = () => {
    if (running) {
      if (timerRef.current) clearInterval(timerRef.current);
      setRunning(false);
      setGameOver(true);
      
      const decimalPart = (time % 100); 
      if (decimalPart < 5 || decimalPart > 95) setPerfect(true);
      else setPerfect(false);
    } else {
      setTime(0);
      setRunning(true);
      setGameOver(false);
      setPerfect(false);
      timerRef.current = setInterval(() => setTime(p => p + 1), 10);
    }
  };

  const handleRestart = () => {
      triggerSmartLink();
      handleAction();
  };

  return (
    <SwytchContainer title="CHRONO SYNC">
      <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
          {/* Rotating Ring Image */}
          <div className={`absolute inset-0 rounded-full opacity-30 ${running ? 'animate-spin-slow' : ''}`}>
              <img src={gameOver && !perfect ? RINGS.fail : running ? RINGS.running : RINGS.idle} className="w-full h-full object-cover rounded-full" />
          </div>

          <div className={`relative z-10 text-6xl font-mono font-black tracking-tighter ${running ? 'text-white' : perfect ? 'text-[#39FF14] scale-110' : 'text-red-500'} transition-all`}>
            {(time / 100).toFixed(2)}<span className="text-xl opacity-50">s</span>
          </div>
      </div>
      
      <p className="text-center text-xs text-gray-500 mb-6 uppercase tracking-[0.2em]">Target: X.00s</p>

      {!gameOver ? (
        <button 
            onClick={handleAction}
            className={`w-full py-6 font-black text-2xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
            running 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-[#39FF14] text-black hover:bg-white"
            }`}
        >
            {running ? "HALT" : "SYNC"}
        </button>
      ) : (
        <button 
            onClick={handleRestart}
            className="w-full py-6 border-2 border-[#39FF14] text-[#39FF14] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors"
        >
            RE-SYNC
        </button>
      )}
      
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
      `}</style>
    </SwytchContainer>
  );
}