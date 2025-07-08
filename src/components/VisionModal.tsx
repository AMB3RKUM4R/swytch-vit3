import { FC, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Star } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';

interface VisionModalProps {
  title: string;
  content: string;
  onClose: () => void;
  showConnect?: boolean;
  handleWalletConnect?: (connectorId: string) => void;
}

const modalVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.8 }
};

const VisionModal: FC<VisionModalProps> = memo(({ title, content, onClose, showConnect, handleWalletConnect }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { connectors } = useConnect();
  const { isConnected, address } = useAccount();

  const metaMaskConnector = connectors.find((c) => c.id === 'metaMask');
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');

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

  const onConnect = (connectorId: string) => {
    if (handleWalletConnect) {
      handleWalletConnect(connectorId);
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
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-gray-900 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id={`modal-title-${title.replace(/\s/g, '-')}`} className="text-2xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 animate-pulse" /> {title}
          </h2>
          <motion.button
            onClick={onClose}
            className="text-rose-400 hover:text-red-500"
            whileHover={{ rotate: 90 }}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-300 font-inter">{content}</p>
          {showConnect && (
            <div className="space-y-4">
              <motion.button
                onClick={() => onConnect('metaMask')}
                className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-600 hover:bg-rose-700'} text-white`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isConnected ? 'Disconnect MetaMask' : 'Connect MetaMask'}
                disabled={!metaMaskConnector}
              >
                <Star className="w-5 h-5 text-cyan-400 animate-pulse" />
                {isConnected ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connect MetaMask'}
              </motion.button>
              <motion.button
                onClick={() => onConnect('walletConnect')}
                className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'} text-white`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isConnected ? 'Disconnect WalletConnect' : 'Connect WalletConnect'}
                disabled={!walletConnectConnector}
              >
                <Star className="w-5 h-5 text-cyan-400 animate-pulse" />
                {isConnected ? 'Disconnect' : 'Connect WalletConnect'}
              </motion.button>
            </div>
          )}
          {!showConnect && (
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

export default VisionModal;