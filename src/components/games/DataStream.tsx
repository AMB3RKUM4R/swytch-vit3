import { useState, useEffect, useRef } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const PACKETS = [
    "https://placehold.co/50x50/000000/39FF14?text=💾",
    "https://placehold.co/50x50/000000/00FFFF?text=💿",
    "https://placehold.co/50x50/000000/FFFF00?text=📁"
];
const VIRUS = "https://placehold.co/50x50/000000/FF0000?text=🦠";

interface GameItem {
  id: number;
  x: number;
  y: number;
  type: 'good' | 'bad';
  imgIdx: number;
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
    if (Math.random() < 0.04) {
      const type = Math.random() > 0.25 ? 'good' : 'bad';
      setItems(prev => [...prev, { 
        id: Math.random(), 
        x: Math.random() * 280, 
        y: 0, 
        type,
        imgIdx: Math.floor(Math.random() * PACKETS.length)
      }]);
    }

    setItems(prev => {
      const next: GameItem[] = [];
      prev.forEach(item => {
        const newY = item.y + 4;
        // Hitbox
        if (newY > 230 && newY < 250 && Math.abs(item.x - basketX) < 35) {
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
        onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            setBasketX(touch.clientX - rect.left - 20);
        }}
      >
        {/* Basket */}
        <div 
            className="absolute bottom-0 w-12 h-6 bg-[#39FF14] rounded-t-lg shadow-[0_0_20px_#39FF14] flex justify-center items-center"
            style={{ left: `${basketX}px` }}
        >
            <div className="w-8 h-1 bg-black/50 rounded-full mt-2"></div>
        </div>

        {/* Items */}
        {items.map(item => (
           <div 
             key={item.id}
             className="absolute w-6 h-6"
             style={{ left: `${item.x}px`, top: `${item.y}px` }}
           >
               <img src={item.type === 'good' ? PACKETS[item.imgIdx] : VIRUS} className="w-full h-full object-contain" />
           </div>
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