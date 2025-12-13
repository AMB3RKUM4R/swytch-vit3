import { FC } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingSpinnerProps } from '../lib/types';
import { cn } from '@/lib/utils';

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ message = "LOADING...", fullScreen = false }) => {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-white font-mono bg-black",
        fullScreen ? 'min-h-screen fixed inset-0 z-[100]' : 'h-full w-full'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10 text-center max-w-sm w-full mx-auto p-6">
        <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 uppercase tracking-widest">{message}</p>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;