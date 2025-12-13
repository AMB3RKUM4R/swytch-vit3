import { useState } from 'react';
import SwytchContainer from './SwytchContainer';

const ICONS = [
  "https://placehold.co/100x100/000000/39FF14?text=⚡",
  "https://placehold.co/100x100/000000/39FF14?text=☢",
  "https://placehold.co/100x100/000000/39FF14?text=☣" 
];

export default function LuckyHash() {
  const [slots, setSlots] = useState<number[]>([0, 0, 0]);
  const [result, setResult] = useState("SPIN TO WIN");
  const [spinning, setSpinning] = useState(false);
  const [jackpot, setJackpot] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setJackpot(false);

    const spins = 20 + Math.floor(Math.random() * 10);
    let count = 0;

    const interval = setInterval(() => {
      setSlots(prev => prev.map(() => Math.floor(Math.random() * ICONS.length)));
      count++;
      if (count >= spins) {
        clearInterval(interval);
        const newSlots = slots.map(() => Math.floor(Math.random() * ICONS.length));
        setSlots(newSlots);

        if (newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2]) {
          setResult("JACKPOT! // SYSTEM BREACHED");
          setJackpot(true);
        } else {
          setResult("ACCESS DENIED // TRY AGAIN");
        }
        setSpinning(false);
      }
    }, 100);
  };

  return (
    <SwytchContainer title="LUCKY HASH">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(57,255,20,0.05)_0,rgba(57,255,20,0.05)_2px,transparent_2px,transparent_8px)] animate-grid-med" />
        <div className="absolute top-16 right-16 w-2 h-2 bg-[#39FF14]/50 rounded-full animate-float-fast shadow-[0_0_6px_#39FF14]" />
      </div>

      {/* Slots */}
      <div className="relative flex gap-8 mb-12">
        {slots.map((iconIndex, i) => (
          <div key={i} className={`relative w-32 h-40 border-4 border-[#39FF14]/80 rounded-2xl bg-[#050505] flex items-center justify-center shadow-[0_0_40px_rgba(57,255,20,0.3)] overflow-hidden ${spinning ? 'animate-spin-slot' : ''} ${jackpot ? 'animate-jackpot-glow' : ''}`}>
            <img src={ICONS[iconIndex]} alt="slot" className="w-28 h-28 object-contain" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#39FF14]/20 to-transparent opacity-0 animate-shine" />
          </div>
        ))}
      </div>
      
      <p className={`relative z-10 font-mono text-2xl tracking-widest uppercase mb-12 ${jackpot ? "text-[#39FF14] animate-jackpot-pulse glow-text-xl" : "text-gray-400"}`}>
          {result}
      </p>
      
      {/* Spin Button */}
      <button 
        onClick={spin}
        disabled={spinning}
        className="relative z-20 px-16 py-8 bg-[#39FF14] text-black font-black text-3xl uppercase hover:bg-white transition-all duration-300 shadow-[0_0_50px_#39FF14] hover:shadow-[0_0_100px_#39FF14] tracking-[0.3em] group disabled:opacity-70"
      >
        EXECUTE SPIN
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
      </button>

      {/* Jackpot "Win" Panel */}
      {jackpot && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-16 border-8 border-[#39FF14] rounded-3xl bg-black/95 shadow-[0_0_120px_#39FF14] animate-jackpot-glow">
            <h2 className="text-7xl font-black mb-8 text-[#39FF14] glow-text-xl">JACKPOT</h2>
            <p className="text-4xl text-[#39FF14] mb-12 animate-jackpot-pulse">SYSTEM BREACHED</p>
            <button onClick={spin} className="px-20 py-8 bg-white text-black font-black text-3xl uppercase tracking-[0.4em] hover:bg-[#39FF14] hover:text-black transition-all duration-300 shadow-[0_0_60px_white]">
              SPIN AGAIN
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes grid-med { 0% { background-position: 0 0; } 100% { background-position: 100px 0; } }
        @keyframes float-fast { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
        @keyframes shine { 0% { transform: translateY(-200%); } 100% { transform: translateY(200%); } }
        @keyframes spin-slot { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(360deg); } }
        @keyframes jackpot-glow { 0%,100% { box-shadow: 0 0 40px #39FF14; } 50% { box-shadow: 0 0 100px #39FF14; } }
        @keyframes jackpot-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-grid-med { animation: grid-med 28s linear infinite reverse; }
        .animate-float-fast { animation: float-fast 7s ease-in-out infinite; }
        .animate-shine { animation: shine 1.5s linear infinite; }
        .animate-spin-slot { animation: spin-slot 0.1s linear; }
        .animate-jackpot-glow { animation: jackpot-glow 2s ease-in-out infinite; }
        .animate-jackpot-pulse { animation: jackpot-pulse 1.5s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .glow-text-xl { text-shadow: 0 0 20px #39FF14, 0 0 40px #39FF14, 0 0 80px #39FF14; }
      `}</style>
    </SwytchContainer>
  );
}