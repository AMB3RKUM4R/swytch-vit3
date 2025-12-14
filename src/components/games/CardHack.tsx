import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

// 8 Icons for pairs
const ICONS = [
    "https://placehold.co/100x100/000000/39FF14?text=A",
    "https://placehold.co/100x100/000000/39FF14?text=B",
    "https://placehold.co/100x100/000000/39FF14?text=C",
    "https://placehold.co/100x100/000000/39FF14?text=D",
    "https://placehold.co/100x100/000000/39FF14?text=E",
    "https://placehold.co/100x100/000000/39FF14?text=F",
    "https://placehold.co/100x100/000000/39FF14?text=G",
    "https://placehold.co/100x100/000000/39FF14?text=H",
];

interface Card {
    id: number;
    icon: string;
}

export default function CardHack() {
  const { triggerSmartLink } = useAdSystem();

  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, i) => ({ icon, id: i }));
    
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || solved.includes(index) || flipped.includes(index) || gameOver) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.icon === secondCard.icon) {
        setSolved(prev => [...prev, newFlipped[0], newFlipped[1]]);
        setFlipped([]);
        if (solved.length + 2 === 16) {
          setGameOver(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleRestart = () => {
      triggerSmartLink();
      initGame();
  };

  return (
    <SwytchContainer title="CARD HACK">
      <div className="grid grid-cols-4 gap-2 mb-6 perspective-[1000px]">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || solved.includes(i);
          const isSolved = solved.includes(i);

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(i)}
              className={`relative w-16 h-20 cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              } ${isSolved ? "opacity-50 pointer-events-none" : ""}`}
            >
              {/* Front (Hidden initially) */}
              <div className="absolute inset-0 backface-hidden bg-gray-900 border-2 border-gray-700 rounded-md flex items-center justify-center">
                  <span className="text-2xl text-gray-600">?</span>
              </div>

              {/* Back (Revealed) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black border-2 border-[#39FF14] rounded-md overflow-hidden shadow-[0_0_15px_#39FF14]">
                  <img src={card.icon} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between w-full px-4 text-white font-mono text-xs uppercase tracking-wider mb-4">
        <span>MOVES: {moves}</span>
        <span className={gameOver ? "text-[#39FF14] animate-pulse" : "text-gray-500"}>
            {gameOver ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6 text-center">
            <h2 className="text-[#39FF14] font-black text-3xl mb-2">ACCESS GRANTED</h2>
            <p className="text-gray-500 text-sm mb-6">MOVES: {moves}</p>
            <button onClick={handleRestart} className="px-10 py-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white shadow-[0_0_30px_#39FF14]">
                RESET
            </button>
        </div>
      )}
      
      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </SwytchContainer>
  );
}