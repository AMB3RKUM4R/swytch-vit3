import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Vault, MessageCircleHeart, BookUser, Zap, Clock } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } }
};

const VisionStandard: FC = memo(() => {
  return (
    <motion.div
      variants={fadeUp}
      className="relative bg-gray-900/50 p-8 rounded-xl"
    >
      <SwytchCard gradient="from-rose-500/10 to-cyan-500/10">
        <div className="space-y-6 text-center">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <Vault className="text-rose-400 w-6 h-6" /> The Swytch Standard
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto font-inter">A new standard for onboarding:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 font-inter">
            <li className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg"><MessageCircleHeart className="text-rose-400 w-5 h-5" /> Immersive First Contact</li>
            <li className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg"><Vault className="text-cyan-400 w-5 h-5" /> Crypto Without Jargon</li>
            <li className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg"><BookUser className="text-pink-400 w-5 h-5" /> Narrative-Led Identity</li>
            <li className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg"><Zap className="text-rose-400 w-5 h-5" /> Purposeful Earning</li>
            <li className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg"><Clock className="text-cyan-400 w-5 h-5" /> Respecting Time</li>
          </ul>
          <motion.div variants={scaleUp}>
            <img
              src="/bg (59).jpg"
              alt="Swytch Standard"
              className="rounded-xl w-full max-w-3xl mx-auto border-2 border-rose-500/30 hover:scale-105 transition-transform"
              onError={(e) => { e.currentTarget.src = '/fallback-bg.jpg'; }}
            />
          </motion.div>
        </div>
      </SwytchCard>
    </motion.div>
  );
});

export default VisionStandard;