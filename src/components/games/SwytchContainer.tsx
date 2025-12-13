import { ReactNode } from 'react';

interface SwytchContainerProps {
  title: string;
  children: ReactNode;
}

const SwytchContainer = ({ title, children }: SwytchContainerProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-black border-2 border-[#39FF14] p-4 rounded-xl shadow-[0_0_15px_#39FF14]">
      <h2 className="text-[#39FF14] font-bold text-2xl mb-4 tracking-widest uppercase glow-text">
        {title}
      </h2>
      <div className="w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
      
      <style>{`
        .glow-text { text-shadow: 0 0 10px #39FF14; }
        .glow-box { box-shadow: 0 0 10px #39FF14; }
      `}</style>
    </div>
  );
};

export default SwytchContainer;