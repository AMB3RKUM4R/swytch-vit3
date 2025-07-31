// src/components/LoadingScreen.tsx
import { FC, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
// You would use @react-three/fiber here for a full React integration
// import { Canvas, useFrame } from '@react-three/fiber';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ message }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  // This useEffect would contain your Three.js scene setup
  useEffect(() => {
    if (!canvasRef.current) return;

    // Placeholder for Three.js scene
    console.log("Three.js scene initialization goes here...");
    
    // Animate the progress bar
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
      // Cleanup three.js resources
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      
      <div className="relative z-10 text-center max-w-sm w-full mx-auto p-8 holographic-card">
        <Sparkles className="w-16 h-16 text-secondary animate-neon-glow mx-auto mb-6" />
        
        <h1 className="text-3xl sm:text-4xl font-russo text-primary animate-text-flicker text-glow-primary mb-4">
          SWYTCH PETverse
        </h1>
        
        <p className="text-lg text-gray-300 font-inter animate-shadow-pulse">{message}</p>
        
        <div className="w-full h-2 bg-muted/50 rounded-full mt-8 overflow-hidden border border-primary/20">
          <motion.div
            className="h-full animated-aura"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <p className="text-sm font-system text-gray-400 mt-2">{progress.toFixed(0)}% Initialized</p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;