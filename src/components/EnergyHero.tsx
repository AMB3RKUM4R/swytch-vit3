import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface EnergyHeroProps {
  userId: string | null;
  goldBalance: number;
  energyBalance: number;
  mousePosition: { x: number; y: number };
}

const EnergyHero: React.FC<EnergyHeroProps> = ({ userId, goldBalance, energyBalance, mousePosition }) => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/20 shadow-2xl hover:shadow-rose-400/40 transition-all"
      style={{
        backgroundImage: `url(/bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
      }}
      aria-label="Energy Breakdown Hero Section"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/60 to-pink-500/60 rounded-3xl" />
      <div className="relative space-y-6">
        <motion.h2
          className="text-5xl sm:text-7xl font-extrabold text-rose-400 tracking-tight flex items-center justify-center gap-4 font-poppins"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Sparkles className="w-12 h-12 animate-pulse" /> The Petaverse
        </motion.h2>
        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-inter">
          A rebellion powered by Energy, governed by purpose, and built for PETs—People of Energy & Truth.
        </p>
        {userId && (
          <p className="text-gray-300 text-center font-inter">
            Your JEWELS: <span className="font-bold text-rose-400">{goldBalance} JEWELS</span> | 
            Your Energy: <span className="font-bold text-rose-400">{energyBalance} USD</span>
          </p>
        )}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
            onClick={() => setActiveModal('auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Join the Rebellion"
          >
            Join the Rebellion
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
          <ConnectButton />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnergyHero;