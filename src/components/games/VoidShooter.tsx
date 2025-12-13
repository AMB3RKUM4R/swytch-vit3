import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';

interface GameObject {
  id: number;
  x: number;
  y: number;
}

export default function VoidShooter() {
  const [playerX, setPlayerX] = useState(50);
  const [bullets, setBullets] = useState<GameObject[]>([]); 
  const [enemies, setEnemies] = useState<GameObject[]>([]); 
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    // Move Bullets
    setBullets(prev => prev.map(b => ({ ...b, y: b.y + 2 })).filter(b => b.y < 100));

    // Move Enemies
    setEnemies(prev => {
      const moved = prev.map(e => ({ ...e, y: e.y + 0.5 })); 
      if (moved.some(e => e.y > 90)) {
        setPlaying(false);
        setGameOver(true);
      }
      return moved;
    });

    // Collision
    setBullets(currBullets => {
        let nextBullets = [...currBullets];
        setEnemies(currEnemies => {
            let nextEnemies = [...currEnemies];
            nextBullets = nextBullets.filter(b => {
                const hitIndex = nextEnemies.findIndex(e => Math.abs(e.x - b.x) < 10 && Math.abs(e.y - (100-b.y)) < 10);
                if (hitIndex > -1) {
                    nextEnemies.splice(hitIndex, 1);
                    setScore(s => s + 10);
                    return false;
                }
                return true;
            });
            return nextEnemies;
        });
        return nextBullets;
    });

    // Spawn Enemy
    if (Math.random() < 0.02) {
      setEnemies(prev => [...prev, { id: Math.random(), x: Math.random() * 90, y: 0 }]);
    }
    
    if (playing) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const shoot = () => {
    setBullets(prev => [...prev, { id: Math.random(), x: playerX + 2, y: 10 }]); 
  };

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setEnemies([]);
    setBullets([]);
    setGameOver(false);
  };

  return (
    <SwytchContainer title="VOID DEFENDER">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Game Area */}
      <div className="relative w-[300px] h-[300px] border-4 border-gray-700 bg-black/90 overflow-hidden mb-8 rounded-2xl shadow-[0_0_40px_rgba(57,255,20,0.3)] mx-auto">
        {/* Player */}
        <div 
            className="absolute bottom-8 w-12 h-12 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-[#39FF14] shadow-[0_0_30px_#39FF14]"
            style={{ left: `${playerX}%` }}
        />

        {/* Bullets */}
        {bullets.map(b => (
            <div key={b.id} className="absolute w-2 h-4 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${b.x}%`, bottom: `${b.y}%` }}></div>
        ))}

        {/* Enemies */}
        {enemies.map(e => (
            <div key={e.id} className="absolute w-10 h-10 border-4 border-red-500 rounded-full flex items-center justify-center text-red-500 text-2xl shadow-[0_0_20px_red] animate-pulse" style={{ left: `${e.x}%`, top: `${e.y}%` }}>
                X
            </div>
        ))}

        {/* Score */}
        <div className="absolute top-4 left-4 text-[#39FF14] font-black text-2xl bg-black/60 px-4 py-2 rounded-xl border border-[#39FF14]/60 glow-text-lg animate-score-glow">
          SCORE: {score}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 w-full max-w-[300px] mb-8">
        <button onMouseDown={() => setPlayerX(x => Math.max(x-10, 0))} className="flex-1 bg-gray-900 border-4 border-gray-700 text-white py-6 font-black text-xl hover:border-[#39FF14] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]">LEFT</button>
        <button onMouseDown={shoot} className="flex-1 bg-[#39FF14] text-black py-6 font-black text-xl tracking-widest hover:bg-white transition-all shadow-[0_0_30px_#39FF14]">FIRE</button>
        <button onMouseDown={() => setPlayerX(x => Math.min(x+10, 90))} className="flex-1 bg-gray-900 border-4 border-gray-700 text-white py-6 font-black text-xl hover:border-[#39FF14] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]">RIGHT</button>
      </div>

      {/* Start Overlay */}
      {!playing && !gameOver && (
        <button 
            onClick={startGame} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-12 py-8 bg-[#39FF14] text-black font-black uppercase tracking-[0.4em] text-3xl hover:bg-white transition-all duration-300 shadow-[0_0_60px_#39FF14] hover:scale-105 z-10"
        >
            START DEFENSE
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-red-500/80 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.6)] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-red-500 glow-text-xl">BASE BREACHED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">FINAL SCORE</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{score}</p>
            <button onClick={startGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              REDEPLOY
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 120px 120px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-16px);} }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-6px,6px); } 40% { transform: translate(6px,-6px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 60px #39FF14; } }
        .animate-grid-med { animation: grid-med 30s linear infinite; }
        .animate-float-deep { animation: float-deep 12s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}