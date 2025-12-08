import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal } from 'lucide-react';

const SplashScreen: FC<{ onComplete: () => void }> = ({ onComplete }) => {
    return (
        <motion.div 
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={onComplete}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black" />
            
            <div className="relative z-10 text-center">
                 <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                 >
                    <Sparkles className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
                    <h1 className="text-6xl md:text-8xl font-black font-russo text-white tracking-tighter mb-2">
                        SWYTCH
                    </h1>
                 </motion.div>
                 
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex flex-col items-center gap-2"
                 >
                     <p className="text-primary font-mono text-sm tracking-[0.5em] uppercase">
                        // PROTOCOL ONLINE
                     </p>
                     <div className="mt-12 px-8 py-3 border border-white/20 hover:bg-white/5 transition-colors group">
                        <span className="text-xs text-white/50 group-hover:text-primary transition-colors flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> CLICK TO INITIALIZE
                        </span>
                     </div>
                 </motion.div>
            </div>
            
            <div className="absolute bottom-8 text-[10px] text-white/20 font-mono">
                SECURE CONNECTION V2.1.0
            </div>
        </motion.div>
    );
};

export default SplashScreen;