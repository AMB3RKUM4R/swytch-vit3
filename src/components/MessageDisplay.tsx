// src/components/MessageDisplay.tsx
import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext'; // Import useModal

// This component is now self-sufficient and requires no props.
const MessageDisplay: FC = () => {
  // Pull state from the global context
  const { showMessage: message, setShowMessage } = useModal();

  const messageVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 300 } },
    exit: { opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.2 } },
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
          // Use our new professional styles
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-lg shadow-xl text-sm font-medium text-center 
                      font-inter border border-primary/50 glass-dark`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <p className="text-foreground font-semibold">{message}</p>
          </div>
          <motion.button
              className="absolute -top-2 -right-2 text-muted-foreground bg-card rounded-full p-0.5 border border-border"
              onClick={() => setShowMessage("")}
              whileHover={{ scale: 1.1, rotate: 90 }}
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
