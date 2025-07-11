import { FC, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Wallet } from 'lucide-react';
import { useModal } from '@/context/ModalContext'; // Correct useModal import
import { auth } from '@/lib/firebaseConfig'; // Firebase auth import

// IMPORTANT: Import BenefitsModalProps from lib/types.ts
import { BenefitsModalProps as ImportedBenefitsModalProps } from '../lib/types';


const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Use ImportedBenefitsModalProps as the type for the FC
const BenefitsModal: FC<ImportedBenefitsModalProps> = memo(({ title, content, onClose, showConnect, handleWalletConnect }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { setActiveModal, setShowMessage } = useModal(); // Correctly consuming context

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  const handleConnect = () => {
    // Rely on auth.currentUser for authentication check, as no userId prop is passed.
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to connect wallet!');
      return;
    }
    if (handleWalletConnect) { // Only call if handler is provided
      handleWalletConnect();
      setShowMessage('ℹ️ Connecting MetaMask...');
      setActiveModal('payment'); // Prompt deposit post-connection, as intended
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${title.replace(/\s/g, '-')}`}
    >
      <motion.div
        ref={modalRef}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-gray-900/70 border border-rose-500/30 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg relative"
        tabIndex={-1}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 rounded-xl"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2070&auto=format&fit=crop)' }}
        />
        <div className="flex justify-between items-center mb-6 relative">
          <h2 id={`modal-title-${title.replace(/\s/g, '-')}`} className="text-2xl font-bold text-cyan-400 flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 animate-pulse text-rose-400" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="text-rose-400 hover:text-cyan-500 w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4 relative">
          <p className="text-gray-300 font-inter">{content}</p>
          {showConnect && handleWalletConnect && (
            <motion.button
              onClick={handleConnect}
              className="w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins bg-rose-600 hover:bg-cyan-500 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Connect MetaMask"
            >
              <Wallet className="w-5 h-5 text-cyan-400 animate-pulse" />
              Connect MetaMask
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default BenefitsModal;