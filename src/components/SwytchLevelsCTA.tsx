import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const SwytchLevelsCTA: React.FC = () => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative text-center border-t border-rose-500/20 pt-10"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl" />
      <div className="relative space-y-6">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Zap className="w-8 h-8 text-pink-400 animate-pulse" /> New to Swytch?
        </h3>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
          Start with $50 to claim your PET identity and begin your quest!
        </p>
        <motion.button
          className="inline-flex items-center px-8 py-4 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group font-poppins"
          onClick={() => setActiveModal('auth')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Begin Earning"
        >
          Begin Earning
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SwytchLevelsCTA;