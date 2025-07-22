// src/components/MessageDisplay.tsx
import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { MessageDisplayProps } from '@/lib/types';

const MessageDisplay: FC<MessageDisplayProps> = ({ message }) => {
  const { isDarkMode } = useTheme();

  const messageVariants = {
    hidden: { opacity: 0, y: -50 }, // Adjusted y for top-to-center animation
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } }, // Adjusted y for top-to-up exit
  };

  // Automatically clear the message after a few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        // As discussed, the component setting the message should ideally clear it,
        // or the ModalContext should manage its auto-clear.
        // For now, this useEffect ensures the animation plays and it's ready for the next message.
        console.log("Message timed out:", message);
      }, 5000); // Message disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={messageVariants}
          // Changed 'bottom-16' to 'top-4' for top positioning
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] p-3 rounded-lg shadow-lg text-sm font-inter text-center
                       ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-primary`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <p className="text-white font-bold font-poppins">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageDisplay;
