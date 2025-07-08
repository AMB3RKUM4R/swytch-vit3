import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const EnergyFreedom: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="md:col-span-2"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-6">
          <div className="flex items-center mb-4 text-rose-400">
            <Zap className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
            <h3 className="text-3xl font-bold font-poppins">Energy = Freedom</h3>
          </div>
          <p className="text-lg text-gray-300 font-inter">
            Energy is your right to earn, hold, and use value on your terms. JEWELS empower you to shape your Petaverse journey.
          </p>
          <ul className="text-rose-300 list-disc pl-6 space-y-2 text-lg font-inter">
            <motion.li whileHover={{ x: 5 }}>Convert Energy to Stablecoin (1:1 with USDT)</motion.li>
            <motion.li whileHover={{ x: 5 }}>Access higher tier bonuses with monthly returns</motion.li>
            <motion.li whileHover={{ x: 5 }}>Grow rewards via Raziel Archive learning</motion.li>
            <motion.li whileHover={{ x: 5 }}>Use JEWELS to unlock realms, missions, and items</motion.li>
          </ul>
          <img src="/bg.jpg" alt="Self-Sovereign Energy" className="mt-6 rounded-xl border border-rose-500/20 shadow-md w-full sm:max-w-lg mx-auto" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnergyFreedom;