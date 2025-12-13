import { useState, useEffect } from 'react';
import SwytchContainer from './SwytchContainer';

interface Card {
    id: number;
    symbol: string;
}

const SYMBOLS = ["⚡", "☢", "☠", "☮", "☯", "☣", "Ω", "∞"];

export default function CardHack() {
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

  return (
    <SwytchContainer title="CARD HACK">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#39FF14]/40 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-12 perspective-[1200px]">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || solved.includes(i);
          const isSolved = solved.includes(i);

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(i)}
              className={`group relative w-24 h-32 cursor-pointer transition-all duration-500 transform-style-preserve-3d shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_30px_60px_rgba(57,255,20,0.2)] hover:[transform:translateY(-12px)_rotateX(15deg)] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              } ${gameOver ? 'pointer-events-none' : ''}`}
            >
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rounded-xl bg-[#111] border-4 border-[#39FF14]/60 flex items-center justify-center text-6xl hover:border-[#39FF14]">
                <div className="text-[#39FF14]/20">?</div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#39FF14]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Front */}
              <div className="absolute inset-0 [transform:rotateY(180deg)] backface-hidden rounded-xl bg-black border-4 border-[#39FF14] flex items-center justify-center text-6xl text-[#39FF14] shadow-[inset_0_0_40px_rgba(57,255,20,0.4)]">
                {card.symbol}
                {isSolved && (
                  <>
                    <div className="absolute inset-0 rounded-xl border-8 border-[#39FF14]/60 animate-ring-expand-1 opacity-80" />
                    <div className="absolute inset-0 rounded-xl border-4 border-[#39FF14] animate-ring-expand-2 delay-150" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* HUD */}
      <div className="relative z-10 flex justify-between w-full px-12 text-white font-mono text-xl tracking-widest mb-8">
        <span>ATTEMPTS: <span className="ml-4 px-6 py-2 bg-black/60 border-2 border-[#39FF14]/60 rounded-xl text-[#39FF14] glow-text-lg">{moves}</span></span>
        <span className={solved.length === 16 ? "text-[#39FF14] glow-text-lg" : "text-gray-500"}>
            STATUS: {solved.length === 16 ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-4 border-[#39FF14]/80 rounded-3xl bg-black/90 shadow-[0_0_100px_#39FF14] animate-glitch-panel">
            <h2 className="text-6xl font-black mb-8 text-[#39FF14] glow-text-xl">MEMORY UNLOCKED</h2>
            <p className="text-3xl text-[#39FF14] mb-4">COMPLETED IN</p>
            <p className="text-7xl font-black text-[#39FF14] mb-12 tracking-widest animate-score-glow">{moves} MOVES</p>
            <button onClick={initGame} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              RESET PROTOCOL
            </button>
          </div>
        </div>
      )}

      <style>{`
        .perspective-[1200px] { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-15px);} }
        @keyframes ring-expand-1 { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes ring-expand-2 { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        @keyframes score-glow { from { text-shadow: 0 0 20px #39FF14; } to { text-shadow: 0 0 60px #39FF14; } }
        .animate-grid-med { animation: grid-med 30s linear infinite; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-ring-expand-1 { animation: ring-expand-1 1s ease-out forwards; }
        .animate-ring-expand-2 { animation: ring-expand-2 1.2s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .animate-score-glow { animation: score-glow 2s ease-in-out infinite alternate; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}