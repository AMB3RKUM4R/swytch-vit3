import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { MapPinned, Globe, ShieldCheck, Star } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } }
};

const VisionArchitect: FC = memo(() => {
  return (
    <motion.div
      variants={fadeUp}
      className="relative bg-gray-900/50 p-8 rounded-xl text-center"
    >
      <SwytchCard gradient="from-pink-500/10 to-cyan-500/10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <MapPinned className="text-rose-400 w-6 h-6 animate-pulse" /> Your Role: The Architect
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto font-inter">You’re shaping a new world where:</p>
          <ul className="list-none space-y-2 text-gray-300 max-w-xl mx-auto font-inter">
            <li className="flex items-center justify-center gap-2"><Globe className="text-cyan-400 w-5 h-5" /> Games are bridges</li>
            <li className="flex items-center justify-center gap-2"><ShieldCheck className="text-rose-400 w-5 h-5" /> Crypto is freedom</li>
            <li className="flex items-center justify-center gap-2"><Star className="text-pink-400 w-5 h-5" /> Onboarding is a ritual</li>
          </ul>
          <motion.div variants={scaleUp}>
            <img
              src="/bg (10).jpg"
              alt="Architect Vision"
              className="rounded-xl w-full max-w-3xl mx-auto border-2 border-rose-500/30 hover:scale-105 transition-transform"
              onError={(e) => { e.currentTarget.src = '/fallback-bg.jpg'; }}
            />
          </motion.div>
        </div>
      </SwytchCard>
    </motion.div>
  );
});

export default VisionArchitect;