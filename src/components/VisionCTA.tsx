import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface VisionCTAProps {
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VisionCTA: FC<VisionCTAProps> = memo(({ setActiveModal }) => {
  return (
    <motion.div variants={fadeUp} className="text-center space-y-6">
      <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Rocket className="text-cyan-400 w-6 h-6 animate-pulse" /> Join the PETverse
      </h2>
      <p className="text-gray-300 max-w-xl mx-auto font-inter">
        Become an Architect of the Swytch PETverse. Connect, complete quests, shape the future.
      </p>
      <motion.button
        className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-full font-semibold font-poppins"
        onClick={() => setActiveModal('Connect Wallet')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Become an Architect"
      >
        Become an Architect
        <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
});

export default VisionCTA;