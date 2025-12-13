import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwytchCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'holographic';
}

const SwytchCard: FC<SwytchCardProps> = ({ 
  children, 
  className = '', 
  onClick,
}) => {
  return (
    <motion.div
      className={cn(
        "bg-black border border-gray-800 p-0 relative overflow-hidden",
        onClick && "cursor-pointer hover:border-[#39FF14] transition-colors group",
        className
      )}
      onClick={onClick}
    >
      {/* Optional Scanline Overlay on Hover */}
      {onClick && (
        <div className="absolute inset-0 bg-[#39FF14] opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity z-0" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default SwytchCard;