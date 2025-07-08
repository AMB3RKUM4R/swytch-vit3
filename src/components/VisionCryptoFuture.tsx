import { FC, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Lock, User, School, Zap } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

interface VisionCryptoFutureProps {
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } }
};

const VisionCryptoFuture: FC<VisionCryptoFutureProps> = memo(({ expandedSection, toggleSection }) => {
  return (
    <motion.div
      variants={fadeRight}
      className="relative bg-gray-900/30 p-8 rounded-xl"
      onClick={() => toggleSection('crypto-future')}
      role="button"
      aria-expanded={expandedSection === 'crypto-future'}
      aria-label="Toggle Crypto Is the Future section"
    >
      <SwytchCard gradient="from-rose-500/10 to-cyan-500/10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-poppins">
            <Rocket className="text-pink-400 w-6 h-6" /> Crypto Is the Future
          </h2>
          <p className="text-gray-300 font-inter">Crypto is seen as:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300 font-inter">
            <li className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg"><Sparkles className="text-rose-400 w-5 h-5" /> Confusing</li>
            <li className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg"><Lock className="text-pink-400 w-5 h-5" /> Risky</li>
            <li className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg"><User className="text-cyan-400 w-5 h-5" /> Tech-savvy only</li>
          </ul>
          <p className="text-gray-200 font-inter">Swytch turns crypto into rewards earned through play.</p>
          <ul className="list-none space-y-2 text-gray-300 font-inter">
            <li className="flex items-start gap-2"><School className="text-rose-400 w-5 h-5" /> Learn crypto through gaming</li>
            <li className="flex items-start gap-2"><Zap className="text-pink-400 w-5 h-5" /> Earn real digital assets</li>
          </ul>
          <AnimatePresence>
            {expandedSection === 'crypto-future' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-gray-400 font-inter"
              >
                Swytch demystifies crypto through intuitive gameplay, making DeFi accessible to all.
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div variants={scaleUp}>
            <img
              src="/bg (29).jpg"
              alt="Crypto Future"
              className="rounded-xl w-full border-2 border-pink-500/30 hover:scale-105 transition-transform"
              onError={(e) => { e.currentTarget.src = '/fallback-bg.jpg'; }}
            />
          </motion.div>
        </div>
      </SwytchCard>
    </motion.div>
  );
});

export default VisionCryptoFuture;