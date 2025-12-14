import { ReactNode } from 'react';
import AdDisplayPanel from '@/components/AdDisplayPanel';

interface SwytchContainerProps {
  title: string;
  children: ReactNode;
}

const SwytchContainer = ({ title, children }: SwytchContainerProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4">
      {/* Game Bezel */}
      <div className="w-full bg-black border-2 border-[#39FF14] p-1 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.15)] relative overflow-hidden">
          
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

          {/* Game Content */}
          <div className="w-full flex flex-col items-center justify-center min-h-[350px] relative bg-[#0a0a0a] p-4">
            {children}
          </div>
      </div>

      {/* Systematic Ad Slot */}
      <div className="mt-4 w-full">
          <AdDisplayPanel zoneType="banner" />
      </div>
      
      <style>{`
        .glow-text { text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
      `}</style>
    </div>
  );
};

export default SwytchContainer;