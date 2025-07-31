// src/components/MessageDisplay.tsx
import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { useModal } from '@/components/context/ModalContext';

interface MessageDisplayProps {
  message: string;
}

const MessageDisplay: FC<MessageDisplayProps> = ({ message }) => {
  const { isDarkMode } = useTheme();
  const { setShowMessage } = useModal();

  const messageVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
  };

  // Automatically clear the message after a few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setShowMessage("");
      }, 5000); // Message disappears after 5 seconds
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
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] p-4 rounded-lg shadow-lg text-sm font-inter text-center
                      border-2 border-primary/50 backdrop-blur-md bg-card/80`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <p className="text-white font-bold font-poppins">{message}</p>
          </div>
          <motion.button
              className="absolute top-2 right-2 text-foreground"
              onClick={() => setShowMessage("")}
              whileHover={{ scale: 1.1 }}
              aria-label="Close message"
            >
              <X className="w-4 h-4" />
            </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageDisplay;