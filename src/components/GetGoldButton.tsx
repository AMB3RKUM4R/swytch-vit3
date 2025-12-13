import { FC } from 'react';
import { Plus, Coins } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

interface GetGoldButtonProps {
  variant?: 'hud' | 'cta' | 'shop-card'; 
  label?: string;
  className?: string;
}

const GetGoldButton: FC<GetGoldButtonProps> = ({ 
  variant = 'cta', 
  label = "GET GOLD", 
  className = "" 
}) => {
  const { setActiveModal } = useModal();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setActiveModal('payment');
  };

  if (variant === 'hud') {
    return (
      <button 
        onClick={handleClick}
        className={`bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500 text-yellow-500 p-1 rounded-sm transition-all hover:shadow-[0_0_10px_rgba(234,179,8,0.4)] ${className}`}
        title="Buy Gold"
      >
        <Plus className="w-3 h-3" />
      </button>
    );
  }

  if (variant === 'shop-card') {
      return <button onClick={handleClick} className={`w-full h-full absolute inset-0 z-10 cursor-pointer ${className}`} />
  }

  return (
    <button 
      onClick={handleClick}
      className={`group relative overflow-hidden bg-yellow-500 text-black font-black font-mono uppercase tracking-wider py-3 px-8 border border-yellow-400 hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] ${className}`}
    >
      <div className="flex items-center gap-2 justify-center relative z-10">
        <Coins className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span>{label}</span>
      </div>
      
      {/* Glitch Shine Effect */}
      <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-[100%] transition-all duration-300 ease-out" />
    </button>
  );
};

export default GetGoldButton;