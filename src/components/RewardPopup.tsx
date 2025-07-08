import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
          className="fixed bottom-20 right-4 max-w-sm w-full bg-gray-900 border border-rose-500/20 rounded-xl shadow-2xl p-4 backdrop-blur-lg z-50 bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
          role="alert"
          aria-label={type === 'error' ? 'Error Notification' : 'Success Notification'}
        >
          <div className="flex items-center gap-4">
            <Sparkles className={`w-8 h-8 ${type === 'error' ? 'text-rose-400' : 'text-cyan-400'} animate-pulse`} />
            <div>
              <p className="text-white font-bold font-poppins">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardPopup;