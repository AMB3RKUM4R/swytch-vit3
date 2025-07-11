import { memo } from 'react'; // Added memo for performance optimization
import { motion } from 'framer-motion';

// SwytchCardProps interface (will be moved to lib/types.ts later)
interface SwytchCardProps {
  children: React.ReactNode;
  gradient: string;
  className?: string;
  onClick?: () => void;
}

export const SwytchCard: React.FC<SwytchCardProps> = memo(({ children, gradient, className = '', onClick }) => (
  <motion.div
    className={`relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-500/30 transition-all bg-gradient-to-r ${gradient} ${className}`}
    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined} // Make focusable only if clickable
    aria-label={onClick ? 'Interactive card' : undefined}
  >
    {children}
  </motion.div>
));

export default SwytchCard;