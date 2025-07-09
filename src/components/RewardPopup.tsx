import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react'; // Ensure Sparkles is imported

// Define RewardPopupProps to match App.tsx
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
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          variants={rewardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          // Using Tailwind classes that map to your CSS variables
          className={`fixed bottom-20 right-4 max-w-sm w-full bg-card border border-border rounded-xl shadow-2xl p-4 backdrop-blur-lg z-50`}
          role="alert"
          aria-label={type === 'error' ? 'Error Notification' : 'Success Notification'}
        >
          <div className="flex items-center gap-4">
            {/* Using text-primary and text-secondary which map to rose-400 and cyan-400 */}
            <Sparkles className={`w-8 h-8 ${type === 'error' ? 'text-primary' : 'text-secondary'} animate-pulse`} />
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
