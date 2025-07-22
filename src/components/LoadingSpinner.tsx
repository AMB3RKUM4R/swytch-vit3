// src/components/LoadingSpinner.tsx
import { FC } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingSpinnerProps } from '../lib/types'; // Import the type

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ message = "Loading...", fullScreen = false }) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-foreground font-inter ${fullScreen ? 'min-h-screen fixed inset-0 bg-gray-950 z-[100]' : 'h-full w-full'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Sparkles className="w-10 h-10 text-primary animate-pulse mx-auto mb-4" />
      <p className="text-lg text-center">{message}</p>
    </motion.div>
  );
};

export default LoadingSpinner;
