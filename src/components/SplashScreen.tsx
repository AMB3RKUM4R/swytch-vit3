import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal } from 'lucide-react';

const SplashScreen: FC<{ onComplete: () => void }> = ({ onComplete }) => {
    return (
        <motion.div 
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer select-none font-mono"
            onClick={onComplete}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative z-10 text-center">
                 <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                 >
                    <Sparkles className="w-16 h-16 text-[#39FF14] mx-auto mb-8 animate-pulse shadow-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
                    <h1 className="text-6xl md:text-9xl font-black italic text-white tracking-tighter mb-4 glitch-text">
                        SWYTCH
                    </h1>
                 </motion.div>
                 
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                 >
                     <p className="text-[#39FF14] text-xs tracking-[0.5em] uppercase border-b border-[#39FF14] pb-2">
                        // SYSTEM READY
                     </p>
                     
                     <div className="mt-16 group">
                        <span className="text-xs text-gray-500 group-hover:text-white transition-colors flex items-center gap-2 blink-cursor">
                            <Terminal className="w-3 h-3 text-[#39FF14]" /> PRESS_ANY_KEY_TO_INIT
                        </span>
                     </div>
                 </motion.div>
            </div>
            
            <div className="absolute bottom-8 text-[10px] text-gray-800 font-mono">
                SECURE CONNECTION V18.0 // ENCRYPTED
            </div>

            <style >{`
                .blink-cursor { animation: blink 1s step-end infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </motion.div>
    );
};

export default SplashScreen;