
import { FC, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

// Define props to include setShowMessage
interface ModalProps {
  title: string;
  onClose: () => void;
  children: JSX.Element;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Modal: FC<ModalProps> = ({ title, onClose, children, setShowMessage }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowMessage('ℹ️ Modal closed');
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose, setShowMessage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6 bg-noise"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900 border border-rose-400/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg bg-gradient-to-r from-rose-400/10 to-cyan-500/10 font-inter"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 text-rose-400 animate-pulse" aria-hidden="true" /> {title}
          </h2>
          <button
            onClick={() => {
              setShowMessage('ℹ️ Modal closed');
              onClose();
            }}
            aria-label="Close modal"
            className="focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <X className="w-6 h-6 text-rose-400 hover:text-cyan-500" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Modal;
