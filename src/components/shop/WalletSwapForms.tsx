// src/components/shop/WalletSwapForms.tsx
import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { SupportedCurrency, PlayerData, TransactionType, TransactionStatus } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Hardcoded MetaMask wallet address for deposits, representing a contract
const DEPOSIT_WALLET_ADDRESS = '0x03d3c8065a4A936b856A39121a5F9e0A441dF4E8';

interface WalletSwapFormsProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
}

const WalletSwapForms: FC<WalletSwapFormsProps> = ({ userId, setShowMessage }) => {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>('ETH');
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>('JEWELS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: connectedAddress, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });

  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const availableCurrencies: SupportedCurrency[] = ['ETH'];

  const getExchangeRate = useCallback(() => {
    const ethToJewelsRate = 5000;
    return ethToJewelsRate;
  }, []);

  useEffect(() => {
    if (fromAmount) {
      const rate = getExchangeRate();
      setToAmount((parseFloat(fromAmount) * rate).toFixed(0));
    } else {
      setToAmount('');
    }
  }, [fromAmount, getExchangeRate]);

  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage(`✅ Transaction confirmed: ${hash.slice(0, 6)}...${hash.slice(-4)}. Balances updated.`);
      setLoading(false);
      setFromAmount('');
      setToAmount('');
      const logConfirmedTransaction = async () => {
        if (!userId) return;
        try {
          await addDoc(collection(db, 'Transactions'), {
            transactionId: `swap_confirmed_${hash}`,
            userId,
            amount: parseFloat(fromAmount),
            currency: fromCurrency,
            transactionType: 'crypto-swap' as TransactionType,
            status: 'success' as TransactionStatus,
            timestamp: serverTimestamp(),
            walletAddress: connectedAddress,
            itemId: toCurrency,
            receivedAmount: parseFloat(toAmount),
            game: 'shop-swap',
          });
        } catch (logError) {
          console.error("Failed to log confirmed transaction:", logError);
        }
      };
      logConfirmedTransaction();
    } else if (txError) {
      setError(`Transaction failed: ${txError.message}`);
      setShowMessage(`⚠️ Transaction failed: ${txError.message}`);
      setLoading(false);
    }
  }, [isConfirmed, hash, txError, userId, fromAmount, fromCurrency, toAmount, toCurrency, connectedAddress, setShowMessage]);

  const handleSwapCurrencies = () => {
    // This function is no longer needed since we are only swapping ETH to JEWELS
    setShowMessage('ℹ️ You can only swap ETH for JEWELS in the shop.');
  };

  const handleInitiateSwap = async () => {
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
    if (isNaN(parseFloat(fromAmount)) || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount to swap.');
      setShowMessage('⚠️ Please enter a valid amount to swap.');
      return;
    }

    if (fromCurrency === 'ETH' && ethBalance && parseFloat(fromAmount) > parseFloat(ethBalance.formatted)) {
      setError('Insufficient ETH balance.');
      setShowMessage('⚠️ Insufficient ETH balance.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionId = `swap_request_${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: parseFloat(fromAmount),
        currency: fromCurrency,
        transactionType: 'crypto-swap' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        walletAddress: connectedAddress,
        itemId: toCurrency,
        receivedAmount: parseFloat(toAmount),
        game: 'shop-swap',
      });

      if (fromCurrency === 'ETH') {
        sendTransaction({
          to: DEPOSIT_WALLET_ADDRESS as `0x${string}`,
          value: parseEther(fromAmount),
        });
      }
      setShowMessage(`Swap initiated. Waiting for transaction confirmation...`);
    } catch (err: any) {
      console.error('Swap initiation error:', err);
      setError(err.message || 'Failed to initiate swap. Please try again.');
      setShowMessage('⚠️ Failed to initiate swap.');
      setLoading(false);
    }
  };

  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <ShoppingCart className="w-7 h-7 text-primary" /> Crypto Exchange
      </h2>
      {!isConnected ? (
        <p className="text-center text-gray-400">Connect your wallet to enable crypto exchanges.</p>
      ) : (
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
              className="input"
              disabled={loading || isTxPending || isConfirming}
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as SupportedCurrency)}
              className="input mt-2 opacity-70 cursor-not-allowed"
              disabled
            >
              {availableCurrencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            {fromCurrency === 'ETH' && ethBalance && <p className="text-xs text-gray-400">Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH</p>}
          </div>

          <div className="flex justify-center my-2">
            <motion.button
              onClick={handleSwapCurrencies}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              disabled
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
              className="input opacity-70 cursor-not-allowed"
              disabled
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
              className="input mt-2 opacity-70 cursor-not-allowed"
              disabled
            >
              <option value="JEWELS">JEWELS</option>
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
              'Initiate Exchange'
            )}
          </motion.button>

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
        </div>
      )}
    </SwytchCard>
  );
};

export default WalletSwapForms;