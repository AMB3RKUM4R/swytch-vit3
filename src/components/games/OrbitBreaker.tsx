import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

export default function OrbitBreaker() {
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [targetZone, setTargetZone] = useState({ start: 45, end: 135 }); 
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    setAngle((prev) => (prev + 4) % 360); 
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const clickCheck = () => {
    if (!playing) {
      setPlaying(true);
      setScore(0);
      setGameOver(false);
      return;
    }

    if (angle >= targetZone.start && angle <= targetZone.end) {
      setScore(s => s + 100);
      const newStart = Math.floor(Math.random() * 260);
      setTargetZone({ start: newStart, end: newStart + 60 }); 
    } else {
      setPlaying(false);
      setGameOver(true);
    }
  };

  return (
    <SwytchContainer title="ORBIT BREAKER">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_10px)] animate-grid-med" />
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Orbit Circle */}
      <div className="relative w-80 h-80 mb-12 mx-auto perspective-[1200px]">
        <div className="absolute inset-0 rounded-full border-8 border-gray-800/80 shadow-[0_0_40px_rgba(0,0,0,0.8)]" />
        
        {/* Target Zone */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-500 shadow-[0_0_40px_#39FF14]"
          style={{
            background: `conic-gradient(transparent ${targetZone.start}deg, #39FF14 ${targetZone.start}deg, #39FF14 ${targetZone.end}deg, transparent ${targetZone.end}deg)`
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#39FF14]/30 to-transparent animate-pulse" />
        </div>

        {/* Rotating Pointer */}
        <div 
          className="absolute top-0 left-0 w-full h-full flex justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-6 h-6 bg-white rounded-full mt-2 shadow-[0_0_20px_white] animate-ping" />
          <div className="absolute w-2 h-32 bg-gradient-to-t from-white to-[#39FF14] -mt-2" />
        </div>

        {/* Center Score */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[#39FF14] font-black text-5xl glow-text-xl animate-score-glow">{score}</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onMouseDown={clickCheck} 
        className="relative z-20 w-full py-8 bg-[#39FF14] text-black font-black uppercase tracking-widest text-3xl hover:bg-white transition-all duration-300 shadow-[0_0_50px_#39FF14] hover:shadow-[0_0_100px_#39FF14] group"
      >
        {playing ? "BREACH" : "START ROTATION"}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
      </button>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">SYNC FAILED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL SCORE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={clickCheck} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RESTART ORBIT
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 120px 120px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-16px);} }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-6px,6px); } 40% { transform: translate(6px,-6px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 60px #39FF14; } }
        .animate-grid-med { animation: grid-med 30s linear infinite; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}