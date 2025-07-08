import { FC, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Lock, Gamepad, Sparkles } from 'lucide-react';

interface VisionEqualizerProps {
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } }
};

const VisionEqualizer: FC<VisionEqualizerProps> = memo(({ expandedSection, toggleSection }) => {
  return (
    <motion.div
      variants={fadeLeft}
      className="flex flex-col lg:flex-row items-center gap-8"
      onClick={() => toggleSection('equalizer')}
      role="button"
      aria-expanded={expandedSection === 'equalizer'}
      aria-label="Toggle Crypto = The Equalizer section"
    >
      <div className="lg:w-1/2 space-y-4">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-poppins">
          <Gem className="text-cyan-400 w-6 h-6" /> Crypto = The Equalizer
        </h2>
        <ul className="list-none space-y-2 text-gray-300 font-inter">
          <li className="flex items-center gap-2"><Lock className="text-rose-400 w-5 h-5" /> Banks gatekeep value</li>
          <li className="flex items-center gap-2"><Gamepad className="text-pink-400 w-5 h-5" /> Games gatekeep fun</li>
          <li className="flex items-center gap-2"><Sparkles className="text-cyan-400 w-5 h-5" /> Crypto rewards effort</li>
        </ul>
        <p className="text-cyan-300 italic font-inter">Swytch translates this truth.</p>
        <AnimatePresence>
          {expandedSection === 'equalizer' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-gray-400 font-inter"
            >
              Swytch levels the playing field with JEWELS and SWYT, making financial empowerment accessible through play.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div variants={scaleUp} className="lg:w-1/2">
        <img
          src="/bg (74).jpg"
          alt="Crypto Empowerment"
          className="rounded-xl w-full border-2 border-cyan-500/30 hover:scale-105 transition-transform"
          onError={(e) => { e.currentTarget.src = '/fallback-bg.jpg'; }}
        />
      </motion.div>
    </motion.div>
  );
});

export default VisionEqualizer;