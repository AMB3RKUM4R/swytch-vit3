// src/components/market/WalletSwapForms.tsx
import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Wallet } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { SupportedCurrency, PlayerData, TransactionType, TransactionStatus } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

// Placeholder ABI for a generic ERC20 token (like USDT)

interface WalletSwapFormsProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
}

const WalletSwapForms: FC<WalletSwapFormsProps> = ({ userId, setShowMessage }) => {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>('ETH');
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>('USDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: connectedAddress, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });
  const { data: usdtBalance } = useBalance({ address: connectedAddress, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }); // Example USDT on Mainnet

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const availableCurrencies: SupportedCurrency[] = ['ETH', 'USDT']; // Add more as supported

  // Simulate exchange rate (for MVP, a fixed rate)
  const getExchangeRate = useCallback((from: SupportedCurrency, to: SupportedCurrency) => {
    if (from === 'ETH' && to === 'USDT') return 3000; // 1 ETH = 3000 USDT (example)
    if (from === 'USDT' && to === 'ETH') return 1 / 3000; // 1 USDT = 0.00033 ETH (example)
    return 1; // For same currency or unsupported pairs
  }, []);

  // Recalculate toAmount when fromAmount or currencies change
  useEffect(() => {
    if (fromAmount) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setToAmount((parseFloat(fromAmount) * rate).toFixed(4));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromCurrency, toCurrency, getExchangeRate]);

  // Handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage(`✅ Transaction confirmed: ${hash.slice(0, 6)}...${hash.slice(-4)}. Balances updated.`);
      setLoading(false);
      setFromAmount('');
      setToAmount('');
      // In a real scenario, you'd trigger a backend process to handle the swap logic
      // and update Firestore balances based on actual on-chain event.
      // For MVP, we can optimistically update or rely on manual admin verification.
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
            itemId: toCurrency, // What was received
            screenshot: toAmount, // How much was received
            game: 'market-swap',
            paypalOrderId: hash, // Using this field to store tx hash
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
  }, [isConfirmed, hash, txError, setShowMessage, userId, fromAmount, fromCurrency, toCurrency, connectedAddress]);


  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount); // Swap amounts too for better UX
  };

  const handleInitiateSwap = async () => {
    if (!userId) {
      setError('User not authenticated. Please sign in.');
      setShowMessage('⚠️ User not authenticated. Please sign in.');
      // setActiveModal('auth'); // Assuming parent handles auth modal
      return;
    }
    if (!isConnected || !connectedAddress) {
      setError('No crypto wallet connected. Please connect your wallet.');
      setShowMessage('⚠️ No crypto wallet connected. Please connect your wallet.');
      // setActiveModal('auth');
      return;
    }
    if (isNaN(parseFloat(fromAmount)) || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount to swap.');
      setShowMessage('⚠️ Please enter a valid amount to swap.');
      return;
    }

    // Basic balance check
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
    // Add checks for other token balances

    setLoading(true);
    setError(null);

    try {
      // Log transaction request to Firestore
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
        itemId: toCurrency, // To indicate what they want to receive
        screenshot: toAmount, // To indicate how much they expect to receive
        game: 'market-swap',
      });

      // --- Initiate On-chain Transaction ---
      if (fromCurrency === 'ETH') {
        sendTransaction({
          to: '0xYourMarketSwapContractAddress' as `0x${string}`, // Placeholder swap contract address for Market
          value: parseEther(fromAmount),
        });
      } else if (fromCurrency === 'USDT') {
        if (!walletClient || !publicClient) {
          setError('Wallet client not ready for ERC-20 transfer.');
          setShowMessage('⚠️ Wallet client not ready.');
          setLoading(false);
          return;
        }

        // This txHash will be caught by useWaitForTransactionReceipt if hash state is updated
        // setHash(txHash); // If you need to manually set hash for useWaitForTransactionReceipt
        setShowMessage('ℹ️ USDT swap initiated. Please confirm in your wallet.');
      } else {
        setError('Unsupported swap currency.');
        setShowMessage('⚠️ Unsupported swap currency.');
        setLoading(false);
        return;
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
        <Wallet className="w-7 h-7 text-primary" /> Wallet & Swap
      </h2>
      {!isConnected ? (
        <p className="text-center text-gray-400">Connect your wallet to enable swaps.</p>
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
              className="input mt-2"
              disabled={loading || isTxPending || isConfirming}
            >
              {availableCurrencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            {fromCurrency === 'ETH' && ethBalance && <p className="text-xs text-gray-400">Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH</p>}
            {fromCurrency === 'USDT' && usdtBalance && <p className="text-xs text-gray-400">Balance: {parseFloat(usdtBalance.formatted).toFixed(2)} USDT</p>}
          </div>

          <div className="flex justify-center my-2">
            <motion.button
              onClick={handleSwapCurrencies}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
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
              className="input opacity-70 cursor-not-allowed"
              disabled
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
              className="input mt-2"
              disabled={loading || isTxPending || isConfirming}
            >
              {availableCurrencies.map(curr => (
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
