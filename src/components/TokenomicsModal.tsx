import { FC, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface TokenomicsModalProps {
  title: string;
  content: string;
  onClose: () => void;
  showConnect?: boolean;
  showInvest?: boolean;
  investmentForm?: JSX.Element;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsModal: FC<TokenomicsModalProps> = memo(({ title, content, onClose, showConnect, showInvest, investmentForm }) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
        className="bg-gray-900 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id={`modal-title-${title.replace(/\s/g, '-')}`} className="text-2xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 animate-pulse" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="text-rose-400 hover:text-red-500 w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-300 font-inter">{content}</p>
          {showConnect && (
            <ConnectButton label="Connect Wallet" showBalance={false} accountStatus="address" chainStatus="none" />
          )}
          {showInvest && investmentForm}
          {!showConnect && !showInvest && (
            <motion.button
              className="w-full p-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close modal"
            >
              Close
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default TokenomicsModal;