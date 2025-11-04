// src/components/SwytchCard.tsx
import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // We'll use cn for better class merging

// Refactored to be a more flexible and professional component
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
        variant === 'default' && 'card', // Uses the new .card style from index.css
        variant === 'holographic' && 'holographic-card', // Uses the new .holographic-card style
        onClick && "cursor-pointer",
        className
      )}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default SwytchCard;
