// RewardPopup.tsx
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Ensure useTheme is imported

interface RewardPopupProps {
  message: string;
  type: 'error' | 'success';
}

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

const RewardPopup: FC<RewardPopupProps> = ({ message, type }) => {
  const { isDarkMode } = useTheme();

  // Choose icon based on message type
  const IconComponent = type === 'success' ? CheckCircle : XCircle;
  // Icon color based on message type. Using direct colors for strong semantic meaning.
  const iconColorClass = type === 'success' ? 'text-green-500' : 'text-red-500';

  // You might want to auto-dismiss the popup after a few seconds
  // useEffect(() => {
  //   if (message) {
  //     const timer = setTimeout(() => {
  //       // How you clear the message depends on how setShowMessage is provided
  //       // If it's a global context or AppContent state, you'll need a mechanism
  //       // to call it from here or pass a `clearMessage` prop.
  //       // For now, this is a placeholder.
  //       console.log("Popup auto-dismissed");
  //     }, 3000); // Dismiss after 3 seconds
  //     return () => clearTimeout(timer);
  //   }
  // }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          variants={rewardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`fixed bottom-20 right-4 max-w-sm w-full p-4 rounded-xl shadow-2xl z-50
            bg-card border border-border /* Using component classes for styling */
            ${isDarkMode ? 'glass-dark' : 'glass-light'} /* Apply glass effect based on theme */
          `}
          role="alert"
          aria-label={type === 'error' ? 'Error Notification' : 'Success Notification'}
        >
          <div className="flex items-center gap-4">
            <IconComponent className={`w-8 h-8 ${iconColorClass}`} />
            <div>
              <p className="text-foreground font-bold font-poppins">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardPopup;