import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const TrustJourney: React.FC = () => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-4 font-poppins">
            <Globe className="w-8 h-8 text-rose-400 animate-pulse" /> Begin Your Journey
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
            Take the first step into Swytch. Learn how to join in three simple steps.
          </p>
          <motion.button
            className="px-8 py-4 bg-rose-600 text-white rounded-full hover:bg-rose-700 font-semibold font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('steps')}
            aria-label="Discover the Steps"
          >
            Discover the Steps
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrustJourney;