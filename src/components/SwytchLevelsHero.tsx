import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface SwytchLevelsHeroProps {
  userId: string | null;
  mousePosition: { x: number; y: number };
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

const SwytchLevelsHero: React.FC<SwytchLevelsHeroProps> = ({ userId, mousePosition, setActiveModal, setShowMessage }) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all"
      style={{
        backgroundImage: `url(/bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
      }}
      aria-label="Swytch Levels Hero Section"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
        <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
        <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
      </motion.div>
      <div className="relative space-y-6">
        <motion.h2
          className="text-5xl sm:text-7xl font-extrabold text-rose-400 tracking-tight flex items-center justify-center gap-4 font-poppins"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Levels
        </motion.h2>
        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
          Embark on a daily quest to ascend levels, unlock epic perks, and dominate the PETverse!
        </p>
        <motion.button
          className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
          onClick={() => {
            if (!userId) {
              setShowMessage('⚠️ Please connect your wallet or log in.');
              setActiveModal('auth');
            } else {
              setShowMessage('ℹ️ Starting your quest!');
              setActiveModal('quest');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Start Your Quest"
        >
          Start Your Quest
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SwytchLevelsHero;