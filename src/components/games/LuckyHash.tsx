import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

// 3 Distinct Slot Icons
const ASSETS = [
  "https://placehold.co/150x150/000000/39FF14?text=💀", // Skull
  "https://placehold.co/150x150/000000/39FF14?text=7️⃣", // Seven
  "https://placehold.co/150x150/000000/39FF14?text=☢️"  // Biohazard
];

export default function LuckyHash() {
  const { triggerSmartLink } = useAdSystem();
  
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [result, setResult] = useState("INITIATE SPIN");
  const [jackpot, setJackpot] = useState(false);

  const spin = () => {
    if (spinning.some(s => s)) return;
    
    setSpinning([true, true, true]);
    setJackpot(false);
    setResult("ROLLING...");

    // Staggered stopping for dramatic effect
    const outcomes = [
        Math.floor(Math.random() * ASSETS.length),
        Math.floor(Math.random() * ASSETS.length),
        Math.floor(Math.random() * ASSETS.length)
    ];

    // Reel 1 Stop
    setTimeout(() => {
        setReels(prev => [outcomes[0], prev[1], prev[2]]);
        setSpinning([false, true, true]);
    }, 1000);

    // Reel 2 Stop
    setTimeout(() => {
        setReels(prev => [outcomes[0], outcomes[1], prev[2]]);
        setSpinning([false, false, true]);
    }, 2000);

    // Reel 3 Stop
    setTimeout(() => {
        setReels(outcomes);
        setSpinning([false, false, false]);
        
        if (outcomes[0] === outcomes[1] && outcomes[1] === outcomes[2]) {
            setResult("JACKPOT // SYSTEM BREACHED");
            setJackpot(true);
        } else {
            setResult("ACCESS DENIED");
        }
    }, 3000); // Long suspense for last reel
  };

  return (
    <SwytchContainer title="LUCKY HASH">
      <div className="flex gap-4 mb-8 justify-center perspective-[1000px]">
        {reels.map((iconIdx, i) => (
          <div key={i} className={`relative w-24 h-32 bg-[#050505] border-4 ${jackpot ? 'border-[#39FF14] shadow-[0_0_40px_#39FF14]' : 'border-gray-800'} rounded-xl overflow-hidden`}>
            {/* Moving Blur Effect when spinning */}
            {spinning[i] && (
                <div className="absolute inset-0 flex flex-col animate-slot-blur">
                    {ASSETS.map((src, k) => <img key={k} src={src} className="w-full h-full object-cover opacity-50" />)}
                </div>
            )}
            
            {/* Static Icon */}
            {!spinning[i] && (
                <img src={ASSETS[iconIdx]} alt="slot" className="w-full h-full object-contain p-2 animate-bounce-short" />
            )}
            
            {/* Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          </div>
        ))}
      </div>
      
      <p className={`font-mono mb-8 text-lg tracking-widest uppercase text-center h-8 ${jackpot ? "text-[#39FF14] animate-pulse font-black" : "text-gray-500"}`}>
          {result}
      </p>
      
      {jackpot ? (
          <button onClick={() => { triggerSmartLink(); setJackpot(false); }} className="w-full py-4 bg-white text-black font-black text-xl uppercase tracking-widest hover:bg-[#39FF14] transition-all shadow-[0_0_30px_white]">
            CLAIM REWARD
          </button>
      ) : (
          <button 
            onClick={spin}
            disabled={spinning.some(s => s)}
            className="w-full py-4 bg-[#39FF14] text-black font-black text-xl uppercase hover:bg-white transition-all tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            {spinning.some(s => s) ? "DECRYPTING..." : "EXECUTE SPIN"}
          </button>
      )}

      <style>{`
        @keyframes slot-blur { 0% { transform: translateY(-100%); } 100% { transform: translateY(0); } }
        .animate-slot-blur { animation: slot-blur 0.1s linear infinite; }
        .animate-bounce-short { animation: bounce 0.3s ease-out; }
      `}</style>
    </SwytchContainer>
  );
}