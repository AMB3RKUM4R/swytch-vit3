// src/components/SwytchCard.tsx
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
  variant = 'default' 
}) => {
  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-lg font-inter",
        variant === 'default' && 'card',
        variant === 'holographic' && 'holographic-card',
        onClick && "cursor-pointer",
        className
      )}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default SwytchCard;