import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

interface GameItem {
  id: number;
  x: number;
  y: number;
  type: string;
}

export default function DataStream() {
  const { triggerSmartLink } = useAdSystem();

  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<GameItem[]>([]);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef<number>();

  const loop = () => {
    // Spawn
    if (Math.random() < 0.03) {
      setItems(prev => [...prev, { 
        id: Math.random(), 
        x: Math.random() * 280, 
        y: 0, 
        type: Math.random() > 0.3 ? 'good' : 'bad' 
      }]);
    }

    // Move & Collide
    setItems(prev => {
      const next: GameItem[] = [];
      prev.forEach(item => {
        const newY = item.y + 3;
        // Hitbox
        if (newY > 230 && newY < 250 && Math.abs(item.x - basketX) < 30) {
           if (item.type === 'good') setScore(s => s + 10);
           else setScore(s => s - 50); 
        } else if (newY < 260) {
           next.push({ ...item, y: newY });
        }
      });
      return next;
    });

    if (playing) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (playing) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  useEffect(() => {
      // Loose condition: Negative score
      if (score < -50 && playing) {
          setPlaying(false);
          setGameOver(true);
      }
  }, [score, playing]);

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setItems([]);
    setGameOver(false);
  };

  const handleRetry = () => {
      triggerSmartLink();
      startGame();
  };

  return (
    <SwytchContainer title="DATA STREAM">
      <div 
        className="relative w-[300px] h-[260px] border-2 border-gray-700 bg-[#050505] overflow-hidden cursor-crosshair mb-4 rounded-md"
        onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setBasketX(e.clientX - rect.left - 20); 
        }}
      >
        {/* Basket */}
        <div 
            className="absolute bottom-0 w-10 h-5 bg-[#39FF14] rounded-t-lg shadow-[0_0_15px_#39FF14]"
            style={{ left: `${basketX}px` }}
        ></div>

        {/* Items */}
        {items.map(item => (
           <div 
             key={item.id}
             className={`absolute w-4 h-4 rounded-full shadow-lg ${item.type === 'good' ? 'bg-white shadow-white' : 'bg-red-500 shadow-red-500'}`}
             style={{ left: `${item.x}px`, top: `${item.y}px` }}
           ></div>
        ))}
        
        <div className="absolute top-2 left-2 text-[#39FF14] font-bold font-mono text-xs">
            DATA: {score}
        </div>
      </div>
      
      {!playing && !gameOver && (
        <button onClick={startGame} className="w-full py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
            CONNECT STREAM
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in text-center p-4">
            <h2 className="text-red-500 font-black text-xl mb-2">CONNECTION LOST</h2>
            <p className="text-gray-400 text-xs mb-6">Too much corrupted data.</p>
            <button onClick={handleRetry} className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white">
              RECONNECT
            </button>
        </div>
      )}
    </SwytchContainer>
  );
}