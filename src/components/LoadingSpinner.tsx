import { FC } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingSpinnerProps } from '../lib/types';

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ message = "Loading...", fullScreen = false }) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-foreground font-orbitron ${fullScreen ? 'min-h-screen fixed inset-0 bg-noise z-[100]' : 'h-full w-full'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="relative z-10 text-center max-w-sm w-full mx-auto p-6 holographic-card animated-aura"
        style={{ backgroundImage: 'url(https://via.placeholder.com/500x500?text=Cosmic+Spinner)' }}
      >
        <Sparkles className="w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mx-auto mb-4" />
        <p className="text-lg text-muted-foreground font-inter text-glow-primary">{message}</p>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;