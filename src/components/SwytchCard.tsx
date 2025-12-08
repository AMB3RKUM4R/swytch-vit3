import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwytchCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'holographic'; // Kept props for compatibility, but style is unified
}

const SwytchCard: FC<SwytchCardProps> = ({ 
  children, 
  className = '', 
  onClick,
}) => {
  return (
    <motion.div
      className={cn(
        "bg-black border border-white/10 p-0 relative overflow-hidden",
        onClick && "cursor-pointer hover:border-white/30 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default SwytchCard;