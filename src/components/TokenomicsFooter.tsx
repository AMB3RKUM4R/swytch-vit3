import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { SwytchCard } from './SwytchCard';

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsFooter: FC = memo(() => {
  return (
    <motion.div variants={sectionVariants} className="relative text-sm text-rose-300 italic text-center max-w-md mx-auto font-inter">
      <SwytchCard gradient="from-rose-500/10 to-pink-500/10">
        <p>
          Swytch aligns with decentralized trust. Self-custody always.
          <span className="block mt-2 text-cyan-400">Invest to shape the PETverse!</span>
        </p>
      </SwytchCard>
    </motion.div>
  );
});

export default TokenomicsFooter;