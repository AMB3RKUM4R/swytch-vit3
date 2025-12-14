import { useState } from 'react';
import SwytchContainer from './SwytchContainer';
import { useAdSystem } from '@/hooks/useAdSystem';

const ICONS = ["⚡", "☢", "☣", "Ω", "∞"];

export default function LuckyHash() {
  const { triggerSmartLink } = useAdSystem();
  
  const [slots, setSlots] = useState<string[]>(["?", "?", "?"]);
  const [result, setResult] = useState("SPIN TO WIN");
  const [spinning, setSpinning] = useState(false);
  const [jackpot, setJackpot] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setJackpot(false);
    setResult("DECRYPTING...");

    const spins = 20;
    let count = 0;

    const interval = setInterval(() => {
      setSlots(prev => prev.map(() => ICONS[Math.floor(Math.random() * ICONS.length)]));
      count++;
      if (count >= spins) {
        clearInterval(interval);
        
        // Result Logic
        const finalSlots = [
            ICONS[Math.floor(Math.random() * ICONS.length)],
            ICONS[Math.floor(Math.random() * ICONS.length)],
            ICONS[Math.floor(Math.random() * ICONS.length)]
        ];
        
        // Force Win/Loss Ratio if needed (Pure RNG here)
        setSlots(finalSlots);

        if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
          setResult("JACKPOT // SYSTEM BREACHED");
          setJackpot(true);
        } else {
          setResult("ACCESS DENIED");
        }
        setSpinning(false);
      }
    }, 100);
  };

  return (
    <SwytchContainer title="LUCKY HASH">
      <div className="flex gap-4 mb-8 justify-center">
        {slots.map((icon, i) => (
          <div key={i} className={`w-24 h-32 border-4 ${jackpot ? 'border-[#39FF14] shadow-[0_0_30px_#39FF14]' : 'border-gray-700'} rounded-xl bg-[#050505] flex items-center justify-center text-5xl text-[#39FF14] font-black`}>
            {icon}
          </div>
        ))}
      </div>
      
      <p className={`font-mono mb-8 text-lg tracking-widest uppercase text-center ${jackpot ? "text-[#39FF14] animate-pulse" : "text-gray-500"}`}>
          {result}
      </p>
      
      {jackpot ? (
          <button onClick={() => { triggerSmartLink(); setJackpot(false); spin(); }} className="w-full py-4 bg-white text-black font-black text-xl uppercase tracking-widest hover:bg-[#39FF14] transition-colors">
            CLAIM REWARD
          </button>
      ) : (
          <button 
            onClick={spin}
            disabled={spinning}
            className="w-full py-4 bg-[#39FF14] text-black font-black text-xl uppercase hover:bg-white transition-colors tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            {spinning ? "RUNNING..." : "EXECUTE SPIN"}
          </button>
      )}
    </SwytchContainer>
  );
}