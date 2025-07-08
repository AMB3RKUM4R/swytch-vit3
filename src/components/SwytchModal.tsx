import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SwytchModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SwytchModal: React.FC<SwytchModalProps> = ({ title, onClose, children }) => {
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
      aria-labelledby="modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg font-inter"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 animate-pulse" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="w-6 h-6 text-rose-400 hover:text-red-500" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default SwytchModal;