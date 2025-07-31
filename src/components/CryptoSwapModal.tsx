// src/components/CryptoSwapModal.tsx
import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ArrowRight } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { useAccount, useBalance, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { SupportedCurrency } from '@/lib/types';
// This is a conceptual ABI for a DEX router, like Uniswap V2/V3
// In a real project, you would import this from a library or your own ABI files
const DEX_ROUTER_ABI = [{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}];

interface CryptoSwapModalProps {
  onClose: () => void;
  setShowMessage: (message: string) => void;
  userId: string | null;
}

const CryptoSwapModal: FC<CryptoSwapModalProps> = ({ onClose, setShowMessage, userId }) => {
  const { isConnected, address: connectedAddress } = useAccount();

  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>('ETH');
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>('USDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });
  const { data: usdtBalance } = useBalance({ address: connectedAddress, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' });

  // Wagmi hooks for sending transaction
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const { data: swapConfig } = useSimulateContract({
    address: '0xYourDEXRouterAddress' as `0x${string}`, // Replace with a real DEX router address
    abi: DEX_ROUTER_ABI,
    functionName: 'swapExactTokensForTokens',
    args: [
      connectedAddress,
      fromCurrency === 'ETH' ? parseEther(fromAmount) : BigInt(0),
      BigInt(0), // amountOutMin
      ['0xFromTokenAddress', '0xToTokenAddress'],
      BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // deadline 20 minutes from now
    ],
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (fromAmount) {
      const rate = fromCurrency === 'ETH' && toCurrency === 'USDT' ? 3000 : 1 / 3000;
      setToAmount((parseFloat(fromAmount) * rate).toFixed(4));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromCurrency, toCurrency]);

  useEffect(() => {
    if (isConfirmed) {
      setShowMessage(`✅ Swap successful: ${hash}`);
      onClose();
    } else if (txError) {
      setError(`Swap failed: ${txError?.message}`);
      setShowMessage(`⚠️ Swap failed: ${txError?.message}`);
    }
  }, [isConfirmed, txError, hash, setShowMessage, onClose]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const handleInitiateSwap = async () => {
    setError(null);
    if (!userId || !isConnected || !fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please check all fields and connect your wallet.');
      setShowMessage('⚠️ Please check all fields and connect your wallet.');
      return;
    }
    
    // Check balance
    if (fromCurrency === 'ETH' && ethBalance && parseFloat(fromAmount) > parseFloat(ethBalance.formatted)) {
      setError('Insufficient ETH balance.');
      setShowMessage('⚠️ Insufficient ETH balance.');
      return;
    }
    if (fromCurrency === 'USDT' && usdtBalance && parseFloat(fromAmount) > parseFloat(usdtBalance.formatted)) {
      setError('Insufficient USDT balance.');
      setShowMessage('⚠️ Insufficient USDT balance.');
      return;
    }
    
    setLoading(true);
    try {
      if (swapConfig) {
        writeContract(swapConfig.request);
        setShowMessage(`Swap transaction initiated. Confirming in wallet...`);
      } else {
        setError('Failed to simulate transaction. Check inputs and network.');
        setShowMessage('⚠️ Failed to simulate transaction.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate swap.');
      setShowMessage(`⚠️ Failed to initiate swap: ${err.message}`);
    } finally {
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
            Crypto Swap
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="fromAmount" className="text-gray-300 text-sm">Amount to swap:</label>
              <input
                id="fromAmount"
                type="number"
                step="any"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="input-system p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring font-inter"
                disabled={loading || isTxPending || isConfirming}
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as SupportedCurrency)}
                className="input-system mt-2 p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full"
                disabled={loading || isTxPending || isConfirming}
              >
                {['ETH', 'USDT'].map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              {fromCurrency === 'ETH' && ethBalance && <p className="text-xs text-gray-400">Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH</p>}
              {fromCurrency === 'USDT' && usdtBalance && <p className="text-xs text-gray-400">Balance: {parseFloat(usdtBalance.formatted).toFixed(2)} USDT</p>}
            </div>

            <div className="flex justify-center my-2">
              <motion.button
                onClick={handleSwapCurrencies}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                disabled={loading || isTxPending || isConfirming}
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="toAmount" className="text-gray-300 text-sm">You will receive (estimated):</label>
              <input
                id="toAmount"
                type="number"
                value={toAmount}
                readOnly
                className="input-system p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring font-inter opacity-70 cursor-not-allowed"
                disabled
              />
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
                className="input-system mt-2 p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full"
                disabled={loading || isTxPending || isConfirming}
              >
                {['ETH', 'USDT'].map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            <motion.button
              className="btn-primary w-full"
              onClick={handleInitiateSwap}
              disabled={loading || isTxPending || isConfirming || !fromAmount || parseFloat(fromAmount) <= 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading || isTxPending || isConfirming ? (
                isTxPending ? 'Confirming in Wallet...' : isConfirming ? 'Swapping...' : 'Processing...'
              ) : (
                'Initiate Swap'
              )}
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

export default CryptoSwapModal;