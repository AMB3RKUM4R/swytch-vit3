import { useState, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function StopWatchGame() {
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
      if (decimalPart < 5 || decimalPart > 95) {
        setResult("PERFECT SYNC // UPLOAD COMPLETE");
        setPerfect(true);
      } else {
        setResult(`OFFSET: .${String(decimalPart).padStart(2,'0')} // FAILED`);
        setPerfect(false);
      }
    } else {
      setTime(0);
      setResult("RUNNING...");
      setRunning(true);
      setGameOver(false);
      setPerfect(false);
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1); 
      }, 10);
    }
  };

  const formatTime = (t: number) => (t / 100).toFixed(2);

  return (
    <SwytchContainer title="CHRONO SYNC">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_1px,transparent_1px,transparent_4px)] animate-grid-slow" />
        <div className="absolute top-20 right-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Timer Display */}
      <div className="relative z-10 text-9xl font-black text-white mb-12 tracking-widest glow-text-xl animate-score-glow">
        {formatTime(time)}<span className="text-6xl text-[#39FF14]">s</span>
      </div>
      
      <p className={`relative z-10 text-3xl mb-16 h-12 ${perfect ? 'text-[#39FF14]' : gameOver ? 'text-red-500' : 'text-[#39FF14]'}`}>
        {result}
      </p>

      {/* Button */}
      <button 
        onClick={handleAction}
        className={`relative z-20 w-64 h-24 font-black text-3xl uppercase tracking-[0.3em] transition-all duration-400 shadow-[0_0_50px] hover:scale-105 ${
          running 
            ? "border-8 border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-red-500/60" 
            : "border-8 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black shadow-[#39FF14]/60"
        }`}
      >
        {running ? "HALT" : "INITIATE"}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-800" />
      </button>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className={`text-center p-16 border-4 rounded-3xl bg-black/90 animate-glitch-panel ${perfect ? 'border-[#39FF14]/80 shadow-[0_0_100px_#39FF14]' : 'border-red-500/80 shadow-[0_0_100px_rgba(239,68,68,0.6)]'}`}>
            <h2 className={`text-6xl font-black mb-8 ${perfect ? 'text-[#39FF14]' : 'text-red-500'} glow-text-xl`}>
              {perfect ? "PERFECT SYNC" : "TIMING OFFSET"}
            </h2>
            <p className="text-4xl text-[#39FF14] mb-12">FINAL TIME: {formatTime(time)}s</p>
            <button onClick={handleAction} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              REINITIATE
            </button>
          </div>
        </div>
      )}

      <style >{`
        @keyframes grid-slow { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-16px);} }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 60px #39FF14; } }
        .animate-grid-slow { animation: grid-slow 40s linear infinite; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}