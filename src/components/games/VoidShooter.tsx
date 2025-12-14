import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

interface GameObject {
  id: number;
  x: number;
  y: number;
}

export default function VoidShooter() {
  const { triggerSmartLink } = useAdSystem();

  const [playerX, setPlayerX] = useState(50);
  const [bullets, setBullets] = useState<GameObject[]>([]); 
  const [enemies, setEnemies] = useState<GameObject[]>([]); 
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    // Bullets
    setBullets(prev => prev.map(b => ({ ...b, y: b.y + 2 })).filter(b => b.y < 100));

    // Enemies
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
                    setScore(s => s + 100);
                    return false;
                }
                return true;
            });
            return nextEnemies;
        });
        return nextBullets;
    });

    // Spawn
    if (Math.random() < 0.03) {
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

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="VOID DEFENDER">
      <div className="relative w-[300px] h-[300px] border-2 border-gray-800 bg-[#050505] overflow-hidden mb-4 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] mx-auto">
        {/* Starfield */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>

        {/* Player */}
        <div 
            className="absolute bottom-4 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#39FF14] filter drop-shadow-[0_0_10px_#39FF14] transition-all duration-75"
            style={{ left: `${playerX}%` }}
        />

        {/* Bullets */}
        {bullets.map(b => (
            <div key={b.id} className="absolute w-1 h-3 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${b.x}%`, bottom: `${b.y}%` }}></div>
        ))}

        {/* Enemies */}
        {enemies.map(e => (
            <div key={e.id} className="absolute w-8 h-8 flex items-center justify-center text-red-500 font-bold text-lg animate-pulse" style={{ left: `${e.x}%`, top: `${e.y}%` }}>
                👾
            </div>
        ))}

        <div className="absolute top-2 left-2 text-[#39FF14] font-mono text-xs opacity-70">
          SCORE: {score}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[300px]">
        <button onMouseDown={() => setPlayerX(x => Math.max(x-10, 0))} className="bg-gray-900 border border-gray-700 text-white py-4 hover:border-[#39FF14]">◀</button>
        <button onMouseDown={shoot} className="bg-[#39FF14] text-black font-black tracking-widest hover:bg-white shadow-[0_0_15px_#39FF14]">FIRE</button>
        <button onMouseDown={() => setPlayerX(x => Math.min(x+10, 90))} className="bg-gray-900 border border-gray-700 text-white py-4 hover:border-[#39FF14]">▶</button>
      </div>

      {!playing && !gameOver && (
        <button onClick={startGame} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-[#39FF14] text-black font-black uppercase tracking-widest shadow-[0_0_40px_#39FF14] hover:scale-105 transition-transform">
            START
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-red-500 font-black text-2xl mb-2">BREACHED</h2>
            <p className="text-white text-4xl font-bold mb-6">{score}</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RETRY
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}