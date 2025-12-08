import { FC } from 'react';
import { Plus, Coins } from 'lucide-react';
//
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
    // This matches the check inside your layout/modal manager
    setActiveModal('payment');
  };

  if (variant === 'hud') {
    return (
      <button 
        onClick={handleClick}
        className={`bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-500 p-1 rounded transition-all hover:scale-110 ${className}`}
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
      className={`group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-russo uppercase tracking-wider py-3 px-8 skew-x-[-10deg] border-2 border-yellow-400 hover:border-white transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] ${className}`}
    >
      <div className="skew-x-[10deg] flex items-center gap-2 justify-center">
        <Coins className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span>{label}</span>
      </div>
      <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-500" />
    </button>
  );
};

export default GetGoldButton;