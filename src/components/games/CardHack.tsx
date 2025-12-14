import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

interface Card {
    id: number;
    symbol: string;
}

const SYMBOLS = ["⚡", "☢", "☠", "☮", "☯", "☣", "Ω", "∞"];

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
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, i) => ({ symbol, id: i }));
    
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

      if (firstCard.symbol === secondCard.symbol) {
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
      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || solved.includes(i);
          const isSolved = solved.includes(i);

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(i)}
              className={`w-16 h-20 flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 transform rounded-md border-2 ${
                isFlipped 
                    ? "bg-black border-[#39FF14] text-[#39FF14] rotate-y-180 shadow-[0_0_15px_#39FF14]" 
                    : "bg-[#111] border-gray-700 text-transparent hover:border-gray-500"
              } ${isSolved ? "opacity-30 pointer-events-none" : ""}`}
            >
              {isFlipped ? card.symbol : "?"}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between w-full px-4 text-white font-mono text-xs uppercase tracking-wider mb-4">
        <span>MOVES: {moves}</span>
        <span className={gameOver ? "text-[#39FF14] animate-pulse" : "text-gray-500"}>
            STATUS: {gameOver ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      {gameOver && (
        <button onClick={handleRestart} className="w-full py-3 bg-[#39FF14] text-black font-bold uppercase hover:bg-white transition-colors shadow-[0_0_20px_#39FF14]">
          RESET PROTOCOL
        </button>
      )}
    </SwytchContainer>
  );
}