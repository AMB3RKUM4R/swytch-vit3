import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

interface HeroSectionProps {
  mousePosition: { x: number; y: number };
}

const HeroSection: React.FC<HeroSectionProps> = ({ mousePosition }) => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={sectionVariants}
      className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/20 shadow-2xl hover:shadow-rose-400/40 transition-all"
      style={{
        backgroundImage: `url(/bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/60 to-rose-400/60 rounded-3xl" />
      <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
        <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
        <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-rose-500 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
      </motion.div>
      <div className="relative space-y-6">
        <motion.h2
          className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4 font-poppins"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Sparkles className="w-12 h-12 text-rose-400 animate-pulse" /> Swytch Petaverse
        </motion.h2>
        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
          Join the Swytch Petaverse to play thrilling games, earn JEWELS and GOLD, and unlock exclusive rewards!
        </p>
        <motion.button
          className="inline-flex items-center px-8 py-4 bg-rose-500 text-white hover:bg-rose-600 rounded-full text-lg font-semibold group font-poppins"
          onClick={() => setActiveModal('auth')}
          whileHover={{ scale: 1.05 }}
          aria-label="Join the Petaverse"
        >
          Join the Petaverse
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HeroSection;