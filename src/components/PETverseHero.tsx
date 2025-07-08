import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface PETverseHeroProps {
  mousePosition: { x: number; y: number };
}

const PETverseHero: React.FC<PETverseHeroProps> = ({ mousePosition }) => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 sm:p-16 border border-rose-500/30 shadow-2xl hover:shadow-rose-400/50 transition-all"
      style={{
        backgroundImage: `url(/bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`,
      }}
      aria-label="Join PETverse Hero Section"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-800/50 to-pink-900/70 rounded-3xl" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <motion.div
          className="absolute top-8 left-8 w-4 h-4 bg-rose-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-6 h-6 bg-pink-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
        />
      </motion.div>
      <div className="relative space-y-8">
        <motion.h2
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4 font-poppins"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Star className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" /> Join the PETverse
        </motion.h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-inter">
          Embark on a cosmic odyssey with Swytch. Become a PET and forge a decentralized destiny.
        </p>
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
            onClick={() => setActiveModal('auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Connect Wallet to Join"
          >
            Connect Wallet
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
          <ConnectButton />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PETverseHero;