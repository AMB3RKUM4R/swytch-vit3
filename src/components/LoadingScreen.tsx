import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const LoadingScreen: FC<{ message: string }> = ({ message }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        <div className="text-center">
            <Terminal className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
            <h1 className="text-xl font-mono text-white font-bold tracking-widest uppercase mb-2">
                SYSTEM_BOOT
            </h1>
            <p className="text-xs text-white/50 font-mono uppercase">
                {message}{dots}
            </p>
        </div>
        
        {/* Loading Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
            <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
        </div>
    </div>
  );
};

export default LoadingScreen;