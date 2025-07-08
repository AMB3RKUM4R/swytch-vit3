import { FC, memo, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import SwytchErrorBoundary from './ErrorBoundaryComponent';

interface BenefitsCTAProps {
  userId: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowWalletModal: React.Dispatch<React.SetStateAction<boolean>>;
  logUpiIntent: () => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const BenefitsCTA: FC<BenefitsCTAProps> = memo(({ userId, setActiveModal, setShowMessage, logUpiIntent }) => {
  const handleBecomePET = async () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to become a PET!');
      return;
    }
    await logUpiIntent();
  };

  return (
    <SwytchErrorBoundary setShowMessage={function (_value: SetStateAction<string>): void {
      throw new Error('Function not implemented.');
    } } setActiveModal={function (_value: SetStateAction<string | null>): void {
      throw new Error('Function not implemented.');
    } }>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative bg-noise"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop)' }}
        />
        <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8 relative">
          <motion.div variants={sectionVariants}>
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" /> Ignite Your Sovereignty
            </h3>
            <p className="text-gray-300 max-w-xl mx-auto font-inter mt-4">
              Join the PETverse rebellion against centralized control. Earn JEWELS, govern, and build wealth on your terms.
            </p>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mt-6"
              onClick={handleBecomePET}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Become a PET"
            >
              Become a PET
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </SwytchCard>
      </motion.section>
    </SwytchErrorBoundary>
  );
});

export default BenefitsCTA;
