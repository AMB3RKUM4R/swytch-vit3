import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};

const TrustMarketCTA: FC<{ setActiveModal: React.Dispatch<React.SetStateAction<string | null>> }> = memo(({ setActiveModal }) => {
  const { setShowMessage } = useModal();

  return (
    <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
      <div className="relative space-y-6">
        <ShoppingCart className="mx-auto text-rose-400 w-12 h-12 mb-4 animate-bounce" />
        <h3 className="text-2xl font-bold text-white font-poppins">No Artifacts to Trade?</h3>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto font-inter">
          Purchase your first PET Artifact to amplify your Energy in the PETverse.
        </p>
        <motion.button
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold font-poppins"
          onClick={() => {
            setShowMessage('🎉 Start trading by browsing artifacts!');
            setActiveModal('Start Trading');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Start Trading"
        >
          Start Trading
        </motion.button>
      </div>
    </motion.div>
  );
});

export default TrustMarketCTA;