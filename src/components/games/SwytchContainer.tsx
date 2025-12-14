import { ReactNode } from 'react';
import AdDisplayPanel from '@/components/AdDisplayPanel';

interface SwytchContainerProps {
  title: string;
  children: ReactNode;
}

const SwytchContainer = ({ title, children }: SwytchContainerProps) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto p-2 md:p-4 flex flex-col xl:flex-row items-start justify-center gap-6">
      
      {/* LEFT COLUMN: Skyscraper Ad (Visible on Large Screens) */}
      <div className="hidden xl:flex flex-col gap-4 sticky top-24">
          <AdDisplayPanel variant="skyscraper" />
      </div>

      {/* CENTER COLUMN: Game Cabinet */}
      <div className="flex-1 flex flex-col items-center w-full max-w-2xl mx-auto">
          
          {/* TOP BANNER: Leaderboard (728x90) - Falls back to smaller on mobile */}
          <div className="hidden md:block w-full mb-4">
              <AdDisplayPanel variant="leaderboard" />
          </div>
          <div className="md:hidden w-full mb-4">
              <AdDisplayPanel variant="mobile" />
          </div>

          {/* GAME BEZEL */}
          <div className="w-full bg-black border-2 border-[#39FF14] p-1 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.15)] relative overflow-hidden mb-6">
              
              {/* Header */}
              <div className="bg-[#050505] border-b border-[#39FF14]/30 px-4 py-3 flex justify-between items-center rounded-t-lg">
                  <h2 className="text-[#39FF14] font-black text-lg tracking-[0.2em] uppercase glow-text italic">
                    {title}
                  </h2>
                  <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_5px_yellow]"></div>
                      <div className="w-2 h-2 bg-[#39FF14] rounded-full shadow-[0_0_5px_#39FF14]"></div>
                  </div>
              </div>

              {/* Game Viewport */}
              <div className="w-full flex flex-col items-center justify-center min-h-[350px] relative bg-[#0a0a0a] p-4">
                {children}
              </div>
          </div>

          {/* BOTTOM BANNER: Standard 468x60 */}
          <div className="w-full">
              <AdDisplayPanel variant="header" />
          </div>

      </div>

      {/* RIGHT COLUMN: Tall Box Ad (Visible on Large Screens) */}
      <div className="hidden xl:flex flex-col gap-4 sticky top-24">
          <AdDisplayPanel variant="tall" />
          
          {/* Bonus Square Ad below it for maximum yield */}
          <div className="mt-4">
            <AdDisplayPanel variant="square" />
          </div>
      </div>

      <style>{`
        .glow-text { text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
      `}</style>
    </div>
  );
};

export default SwytchContainer;