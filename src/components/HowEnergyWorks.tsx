import { motion } from 'framer-motion';
import { Bolt } from 'lucide-react';

const HowEnergyWorks: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-4">
          <div className="flex items-center mb-4 text-rose-400">
            <Bolt className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
            <h3 className="text-3xl font-bold font-poppins">How Energy Works</h3>
          </div>
          <p className="text-lg text-gray-300 font-inter">
            Energy is your proof-of-action in Swytch. Earn it through play, learning, and growth. Stored in your Private Energy Trust, it grows up to 3.3% monthly—no staking, just contribution.
          </p>
          <img src="/bg.jpg" alt="Swytch Energy Cycle" className="rounded-xl border border-rose-500/20 shadow-md w-full" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HowEnergyWorks;