import { useState } from 'react';
import SwytchContainer from './SwytchContainer';

export default function ShellGame() {
  const [positions, setPositions] = useState([0, 1, 2]); 
  const [winningId] = useState(1); 
  const [shuffling, setShuffling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("FIND THE DATA CORE");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const shuffle = () => {
    setMessage("ENCRYPTING LOCATION...");
    setRevealed(false);
    setShuffling(true);
    setGameOver(false);

    let shuffles = 0;
    const maxShuffles = 12;
    const interval = setInterval(() => {
      setPositions(prev => [...prev].sort(() => Math.random() - 0.5));
      shuffles++;
      if (shuffles >= maxShuffles) {
        clearInterval(interval);
        setShuffling(false);
        setMessage("SELECT A VAULT");
      }
    }, 200); 
  };

  const handlePick = (boxId: number) => {
    if (shuffling || revealed || gameOver) return;
    setRevealed(true);
    setGameOver(true);
    if (boxId === winningId) {
      setMessage("ACCESS GRANTED // SUCCESS");
      setWon(true);
    } else {
      setMessage("EMPTY VAULT // FAILURE");
      setWon(false);
    }
  };

  const restart = () => {
    setRevealed(false);
    setGameOver(false);
    setWon(false);
    setMessage("FIND THE DATA CORE");
    shuffle();
  };

  return (
    <SwytchContainer title="DATA SHUFFLE">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(57,255,20,0.06)_0,rgba(57,255,20,0.06)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#39FF14]/50 rounded-full animate-float-deep shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Vaults */}
      <div className="relative flex gap-12 mb-16 h-32 items-end justify-center perspective-[1200px]">
        {positions.map((boxId) => (
          <div
            key={boxId}
            onClick={() => handlePick(boxId)}
            className={`group relative w-28 h-28 border-4 rounded-2xl flex items-center justify-center text-6xl cursor-pointer transition-all duration-300 shadow-[0_30px_60px_rgba(0,0,0,0.7)] transform-style-preserve-3d hover:[transform:translateY(-12px)_rotateX(15deg)] active:scale-95 ${
              shuffling ? "border-gray-600 animate-shuffle" : 
              revealed && boxId === winningId ? "border-[#39FF14] bg-[#39FF14]/20 shadow-[0_0_60px_#39FF14]" : 
              revealed && boxId !== winningId ? "border-red-500 bg-red-900/30 shadow-[0_0_40px_red]" : 
              "border-[#39FF14]/80 hover:border-[#39FF14] hover:shadow-[0_0_40px_rgba(57,255,20,0.4)]"
            } ${gameOver ? 'pointer-events-none' : ''}`}
          >
            {/* Glow Layer */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-[#39FF14]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${revealed && boxId === winningId ? 'opacity-100 animate-pulse' : ''}`} />
            
            {/* Content */}
            <div className="relative z-10">
              {revealed && boxId === winningId && "♦"} 
              {!revealed && !shuffling && "?"}
            </div>

            {/* Win Rings */}
            {revealed && boxId === winningId && (
              <>
                <div className="absolute inset-0 rounded-2xl border-8 border-[#39FF14]/60 animate-ring-expand-1 opacity-80" />
                <div className="absolute inset-0 rounded-2xl border-4 border-[#39FF14] animate-ring-expand-2 delay-150" />
              </>
            )}
          </div>
        ))}
      </div>

      <p className={`relative z-10 text-gray-400 font-mono text-xl mb-12 tracking-widest ${won ? 'text-[#39FF14] glow-text-lg' : ''}`}>
        {message}
      </p>

      {!shuffling && !gameOver && (
        <button onClick={shuffle} className="relative z-20 px-12 py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-2xl hover:bg-[#39FF14] transition-all duration-300 shadow-[0_0_40px_white] hover:shadow-[0_0_80px_#39FF14] hover:scale-105">
          {revealed ? "RETRY" : "SHUFFLE"}
        </button>
      )}

      {/* End Game Panel */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className={`text-center p-16 border-4 rounded-3xl bg-black/90 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-glitch-panel ${won ? 'border-[#39FF14]/80 shadow-[0_0_100px_#39FF14]' : 'border-red-500/80 shadow-[0_0_100px_rgba(239,68,68,0.6)]'}`}>
            <h2 className={`text-6xl font-black mb-8 ${won ? 'text-[#39FF14]' : 'text-red-500'} glow-text-xl`}>
              {won ? "ACCESS GRANTED" : "VAULT EMPTY"}
            </h2>
            <button onClick={restart} className="px-16 py-6 bg-[#39FF14] text-black font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all duration-300 shadow-[0_0_40px_#39FF14] hover:scale-105">
              NEW SHUFFLE
            </button>
          </div>
        </div>
      )}

      <style >{`
        .perspective-[1200px] { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
        @keyframes float-deep { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-15px);} }
        @keyframes shuffle { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-40px); } 50% { transform: translateX(40px); } 75% { transform: translateX(-20px); } }
        @keyframes ring-expand-1 { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes ring-expand-2 { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch-panel { 0%,100% { transform: translate(0); } 20% { transform: translate(-5px,5px); } 40% { transform: translate(5px,-5px); } }
        .animate-grid-med { animation: grid-med 30s linear infinite; }
        .animate-float-deep { animation: float-deep 10s ease-in-out infinite; }
        .animate-shuffle { animation: shuffle 0.6s ease-in-out; }
        .animate-ring-expand-1 { animation: ring-expand-1 1s ease-out forwards; }
        .animate-ring-expand-2 { animation: ring-expand-2 1.2s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-glitch-panel { animation: glitch-panel 0.6s infinite; }
        .glow-text-lg { text-shadow: 0 0 12px #39FF14, 0 0 24px #39FF14; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}