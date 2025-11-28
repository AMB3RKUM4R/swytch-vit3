// src/components/LoadingScreen.tsx
import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const LoadingScreen: FC<{ message: string }> = ({ message }) => {
  const [dots, setDots] = useState('');

  // Simple dot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground font-poppins"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10 text-center max-w-lg w-full mx-auto p-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Terminal className="w-16 h-16 text-primary text-glow-primary mx-auto mb-6" />
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-foreground mb-4">
          Initializing PETverse
        </h1>
        
        <p className="text-lg text-muted-foreground font-inter">
          {message}{dots}
        </p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;