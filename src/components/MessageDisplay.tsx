import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

const MessageDisplay: FC = () => {
  const { showMessage: message, setShowMessage } = useModal();

  const messageVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setShowMessage("");
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [message, setShowMessage]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={messageVariants}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 pointer-events-none"
        >
            <div className="bg-black border border-primary p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] flex items-start gap-3 pointer-events-auto">
                <div className="mt-1">
                    <Terminal className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="flex-grow">
                    <p className="text-white text-xs font-mono font-bold uppercase mb-1">SYSTEM NOTIFICATION</p>
                    <p className="text-white/80 text-sm font-inter leading-tight">{message}</p>
                </div>
                <button
                    className="text-white/50 hover:text-white transition-colors"
                    onClick={() => setShowMessage("")}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageDisplay;