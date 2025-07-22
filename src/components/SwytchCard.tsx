// src/components/SwytchCard.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { SwytchCardProps } from '@/lib/types'; // Import the type from your types.ts

const SwytchCard: FC<SwytchCardProps> = ({ children, gradient, className = '', onClick }) => {
  return (
    <motion.div
      className={`relative p-6 rounded-xl shadow-lg border border-rose-500/20 overflow-hidden
                  bg-gradient-to-br ${gradient} ${className}`}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Background noise texture */}
      <div className="absolute inset-0 bg-noise opacity-10 z-0"></div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default SwytchCard;
