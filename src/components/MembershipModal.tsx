import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { SetStateAction, useEffect, useRef } from 'react';
import ConnectWalletButton from './ConnectWalletButton';

interface MembershipModalProps {
  title: string;
  content: string;
  onClose: () => void;
  showConnect?: boolean;
}

const MembershipModal: React.FC<MembershipModalProps> = ({ title, content, onClose, showConnect }) => {
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900/80 p-8 rounded-2xl max-w-md w-full border border-neon-green/20 shadow-2xl backdrop-blur-md"
        tabIndex={-1}
      >
        <motion.button
          className="absolute top-4 right-4 text-neon-green hover:text-red-500"
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h3 className="text-2xl font-bold text-purple-500 font-poppins mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-neon-green animate-pulse" /> {title}
        </h3>
        <p className="text-gray-300 font-inter mb-6">{content}</p>
        {showConnect && <ConnectWalletButton userId={null} setActiveModal={function (_value: SetStateAction<string | null>): void {
          throw new Error('Function not implemented.');
        } } setShowMessage={function (_value: SetStateAction<string>): void {
          throw new Error('Function not implemented.');
        } }  />
// ...
        }
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all font-poppins"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MembershipModal;