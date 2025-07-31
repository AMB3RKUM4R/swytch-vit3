// src/components/SendCryptoModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, DollarSign } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import Tilt from 'react-parallax-tilt';

interface SendCryptoModalProps {
  onClose: () => void;
  setShowMessage: (message: string) => void;
  userId: string | null;
}

const SendCryptoModal: FC<SendCryptoModalProps> = ({ onClose, setShowMessage, userId }) => {
  useTheme();
  const { isConnected, address: connectedAddress } = useAccount();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });

  // Wagmi hooks for sending transaction
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    // Reset state when hash or txError changes
    if (isConfirmed || txError) {
      setLoading(false);
      if (isConfirmed) {
        setShowMessage(`✅ Transaction successful: ${hash}`);
      } else {
        setError(`Transaction failed: ${txError?.message}`);
        setShowMessage(`⚠️ Transaction failed: ${txError?.message}`);
      }
    }
  }, [isConfirmed, txError, hash, setShowMessage]);

  const handleSendCrypto = async () => {
    setError(null);
    if (!userId) {
      setError('User not authenticated. Please sign in.');
      setShowMessage('⚠️ User not authenticated. Please sign in.');
      return;
    }
    if (!isConnected || !connectedAddress) {
      setError('No crypto wallet connected. Please connect your wallet.');
      setShowMessage('⚠️ No crypto wallet connected. Please connect your wallet.');
      return;
    }
    if (!toAddress || !toAddress.startsWith('0x') || toAddress.length !== 42) {
      setError('Please enter a valid Ethereum wallet address.');
      setShowMessage('⚠️ Please enter a valid Ethereum wallet address.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      setShowMessage('⚠️ Please enter a valid amount.');
      return;
    }
    if (ethBalance && parseFloat(amount) > parseFloat(ethBalance.formatted)) {
      setError('Insufficient ETH balance.');
      setShowMessage('⚠️ Insufficient ETH balance.');
      return;
    }

    setLoading(true);
    try {
      sendTransaction({
        to: toAddress as `0x${string}`,
        value: parseEther(amount),
      });
      setShowMessage(`Transaction initiated. Confirming in wallet...`);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate transaction.');
      setShowMessage(`⚠️ Failed to initiate transaction: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md bg-noise"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.4}>
        <motion.div
          className="relative holographic-card p-8 rounded-lg max-w-sm w-full mx-4"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
        >
          <motion.button
            className="absolute top-4 right-4 text-foreground"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            aria-label="Close Modal"
          >
            <X className="w-6 h-6 text-[hsl(var(--secondary-hsl))] animate-neon-pulse" />
          </motion.button>

          <h2 className="text-3xl font-russo text-primary mb-6 text-center text-glow-primary">
            Send Crypto
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[hsl(var(--primary-hsl))]" />
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Recipient Address (0x...)"
                className="input-system p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring font-inter"
                aria-label="Recipient Address"
              />
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[hsl(var(--primary-hsl))]" />
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to send (ETH)"
                className="input-system p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring font-inter"
                aria-label="Amount to send"
              />
            </div>

            <motion.button
              className="btn-primary w-full"
              onClick={handleSendCrypto}
              disabled={loading || isTxPending || isConfirming || !amount || parseFloat(amount) <= 0 || !toAddress}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isTxPending ? 'Confirming in Wallet...' : isConfirming ? 'Sending...' : 'Send ETH'}
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="text-rose-400 text-sm text-center mt-4 font-inter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
            {hash && (
              <motion.p
                className="text-cyan-400 text-sm text-center mt-4 font-inter break-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Transaction Hash: {hash}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </Tilt>
    </motion.div>
  );
};

export default SendCryptoModal;