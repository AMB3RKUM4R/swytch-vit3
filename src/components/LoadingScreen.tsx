// src/components/LoadingScreen.tsx
import { FC, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal } from 'lucide-react';
// Conceptual placeholder for a dramatic Three.js scene
// import { Canvas, useFrame } from '@react-three/fiber'; 

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ message }) => {
  const [progress, setProgress] = useState(0);

  // This useEffect simulates the loading and updates the progress bar.
  // In a real app, this would tie into your actual data fetching or asset loading progress.
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-background to-black text-foreground font-poppins"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 cosmic-particles z-0"></div>
      
      <div className="relative z-10 text-center max-w-lg w-full mx-auto p-10 holographic-card animated-aura">
        <Terminal className="w-16 h-16 text-secondary animate-neon-glow mx-auto mb-6" />
        
        <h1 className="text-3xl sm:text-4xl font-russo text-primary animate-text-flicker text-glow-primary mb-4">
          SYSTEM: INITIALIZING PETVERSE
        </h1>
        
        <p className="text-lg text-gray-300 font-inter animate-shadow-pulse">{message}</p>
        
        <div className="w-full h-3 bg-muted/50 rounded-full mt-8 overflow-hidden border border-primary/20">
          <motion.div
            className="h-full animated-aura"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <p className="text-sm font-inter text-gray-400 mt-2">{progress.toFixed(0)}% Initialized</p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;