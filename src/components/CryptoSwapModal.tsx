// src/components/CryptoSwapModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { cn } from '@/lib/utils'; // Assumes you have a cn utility for classnames

interface CryptoSwapModalProps {
  onClose: () => void;
  setShowMessage: (message: string) => void;
  userId: string | null;
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const CryptoSwapModal: FC<CryptoSwapModalProps> = ({ onClose, setShowMessage, userId }) => {
  const { isConnected, address: connectedAddress } = useAccount();

  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });
  
  const { data: hash, sendTransaction, isPending: isTxPending, error: sendError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const ethToJewelsRate = 5000; // Static exchange rate for the example

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      setToAmount((parseFloat(fromAmount) * ethToJewelsRate).toLocaleString('en-US'));
    } else {
      setToAmount('');
    }
  }, [fromAmount, ethToJewelsRate]);

  useEffect(() => {
    if (isConfirmed) {
      setShowMessage(`✅ Swap successful! Your JEWELS balance will update shortly.`);
      onClose();
    }
    const anyError = txError || sendError;
    if (anyError) {
        const errorMessage = anyError.message.includes('User rejected the request') 
            ? 'Transaction was rejected.' 
            : 'Transaction failed.';
        setError(errorMessage);
        setShowMessage(`⚠️ ${errorMessage}`);
    }
  }, [isConfirmed, txError, sendError, hash, setShowMessage, onClose]);

  const handleInitiateSwap = () => {
    setError(null);
    if (!userId || !isConnected || !fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount and ensure your wallet is connected.');
      return;
    }
    
    if (ethBalance && parseFloat(fromAmount) > parseFloat(ethBalance.formatted)) {
      setError('Insufficient ETH balance for this swap.');
      return;
    }

    // Replace with your actual company's deposit address
    const depositAddress = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0' as `0x${string}`;
    
    sendTransaction({
      to: depositAddress,
      value: parseEther(fromAmount),
    });
  };
  
  const isLoading = isTxPending || isConfirming;
  const buttonText = isTxPending ? 'Awaiting Confirmation...' : isConfirming ? 'Processing Swap...' : 'Initiate Swap';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
        <motion.div
          className="relative p-8 bg-black/20 rounded-xl border border-[hsl(var(--primary),0.2)] max-w-sm w-full mx-4"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
            <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                onClick={onClose}
                aria-label="Close"
            >
                <X size={24} />
            </button>
            <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
                Swap ETH for JEWELS
            </h2>

            <div className="space-y-4">
                {/* From Input */}
                <div className="space-y-2">
                    <label htmlFor="fromAmount" className="text-sm font-medium text-muted-foreground">You send</label>
                    <div className="relative">
                        <input
                            id="fromAmount"
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            placeholder="0.0"
                            className="input-system text-2xl pr-24"
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 p-1.5 rounded-lg bg-[hsl(var(--background))]">
                            <img src="/eth-logo.png" alt="ETH" className="w-6 h-6"/>
                            <span className="font-semibold text-foreground">ETH</span>
                        </div>
                    </div>
                     {ethBalance && <p className="text-xs text-muted-foreground text-right">Balance: {parseFloat(ethBalance.formatted).toFixed(5)}</p>}
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center py-2">
                    <div className="p-2 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
                        <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                </div>

                {/* To Input */}
                <div className="space-y-2">
                    <label htmlFor="toAmount" className="text-sm font-medium text-muted-foreground">You receive (est.)</label>
                     <div className="relative">
                        <input
                            id="toAmount"
                            type="text" // Use text to display formatted number
                            value={toAmount}
                            readOnly
                            placeholder="0"
                            className="input-system text-2xl pr-28 opacity-80 cursor-default"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 p-1.5 rounded-lg bg-[hsl(var(--background))]">
                            <Sparkles className="w-6 h-6 text-yellow-400"/>
                            <span className="font-semibold text-foreground">JEWELS</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Rate: 1 ETH ≈ {ethToJewelsRate.toLocaleString()} JEWELS</p>
                </div>

                {/* Action Button */}
                <button
                    className={cn("btn-system-glow w-full text-lg", isLoading && "opacity-50 cursor-not-allowed")}
                    onClick={handleInitiateSwap}
                    disabled={isLoading || !fromAmount || parseFloat(fromAmount) <= 0}
                >
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    {buttonText}
                </button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.p
                        className="flex items-center justify-center gap-2 text-destructive text-sm text-center mt-4 font-inter"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <AlertTriangle size={16} /> {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    </motion.div>
  );
};

export default CryptoSwapModal;