import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

interface EnergyCTAProps {
  setShowWalletModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const EnergyCTA: React.FC<EnergyCTAProps> = ({ setShowWalletModal }) => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="relative text-center"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-6">
          <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4 font-poppins">
            <Globe className="w-10 h-10 text-rose-400 animate-pulse" /> Shape the Petaverse
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
            Become a PET, unlock your vault, and shape decentralized wealth.
          </p>
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
            onClick={() => setActiveModal('auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Get Started"
          >
            Get Started
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnergyCTA;