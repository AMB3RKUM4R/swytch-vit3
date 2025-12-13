import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

const MessageDisplay: FC = () => {
  const { showMessage: message, setShowMessage } = useModal();

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'linear' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
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
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 pointer-events-none font-mono"
        >
            <div className="bg-black border border-[#39FF14] p-4 shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-start gap-4 pointer-events-auto">
                <div className="mt-1">
                    <Terminal className="w-4 h-4 text-[#39FF14] animate-pulse" />
                </div>
                <div className="flex-grow">
                    <p className="text-[#39FF14] text-[10px] font-bold uppercase mb-1 tracking-widest">SYSTEM_MSG_</p>
                    <p className="text-white text-sm font-bold uppercase">{message}</p>
                </div>
                <button
                    className="text-gray-500 hover:text-white transition-colors"
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