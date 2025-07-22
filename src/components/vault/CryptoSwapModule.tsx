// src/components/vault/CryptoSwapModule.tsx
import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { SupportedCurrency, PlayerData, Transaction, TransactionType, TransactionStatus } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

// Placeholder ABI for a generic ERC20 token (like USDT)
// In a real app, you'd import the specific ABI for each token.


interface CryptoSwapModuleProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  isConnected: boolean;
  walletAddress: string | null;
}

const CryptoSwapModule: FC<CryptoSwapModuleProps> = ({
  userId,
  setShowMessage,
  setActiveModal,
  updatePlayerFirestore,
  isConnected,
}) => {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>('ETH');
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>('USDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: connectedAddress } = useAccount();
  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });
  const { data: usdtBalance } = useBalance({ address: connectedAddress, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }); // Example USDT on Mainnet
  // You'd need to add more balance hooks for other tokens/chains as needed

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Wagmi hooks for sending transaction
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const availableCurrencies: SupportedCurrency[] = ['ETH', 'USDT']; // Add more as supported

  // Simulate exchange rate (for MVP, a fixed rate)
  const getExchangeRate = useCallback((from: SupportedCurrency, to: SupportedCurrency) => {
    if (from === 'ETH' && to === 'USDT') return 3000; // 1 ETH = 3000 USDT (example)
    if (from === 'USDT' && to === 'ETH') return 1 / 3000; // 1 USDT = 0.00033 ETH (example)
    return 1; // For same currency or unsupported pairs
  }, []);

  useEffect(() => {
    if (fromAmount) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setToAmount((parseFloat(fromAmount) * rate).toFixed(4));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromCurrency, toCurrency, getExchangeRate]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount); // Swap amounts too for better UX
  };

  const handleInitiateSwap = async () => {
    if (!userId) {
      setError('User not authenticated. Please sign in.');
      setShowMessage('⚠️ User not authenticated. Please sign in.');
      setActiveModal('auth');
      return;
    }
    if (!isConnected || !connectedAddress) {
      setError('No crypto wallet connected. Please connect your wallet.');
      setShowMessage('⚠️ No crypto wallet connected. Please connect your wallet.');
      setActiveModal('auth');
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
      // For MVP, we'll simulate the swap on-chain and rely on Firestore updates.
      // A real swap would involve interacting with a DEX aggregator smart contract (e.g., Uniswap, 1inch).


      if (fromCurrency === 'ETH') {
        // Direct ETH transfer for simplicity (simulating a swap by sending ETH)
        // In a real scenario, this ETH would go to a swap contract, not directly to a user.
        sendTransaction({
          to: '0xYourSwapContractAddress' as `0x${string}`, // Placeholder swap contract address
          value: parseEther(fromAmount),
        });
      } else if (fromCurrency === 'USDT') {
        // ERC-20 token transfer (requires walletClient for contract write)
        if (!walletClient || !publicClient) {
          setError('Wallet client not ready for ERC-20 transfer.');
          setShowMessage('⚠️ Wallet client not ready.');
          setLoading(false);
          return;
        }


        setShowMessage('ℹ️ USDT swap initiated. Please confirm in your wallet.');
      } else {
        setError('Unsupported swap currency.');
        setShowMessage('⚠️ Unsupported swap currency.');
        setLoading(false);
        return;
      }

      // The rest of the logic (Firestore updates) will happen after transaction confirmation
      // or as a pending state.
      setShowMessage(`Swap initiated. Waiting for transaction confirmation...`);

    } catch (err: any) {
      console.error('Swap initiation error:', err);
      setError(err.message || 'Failed to initiate swap. Please try again.');
      setShowMessage('⚠️ Failed to initiate swap.');
      setLoading(false);
    }
  };

  // Handle Wagmi transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage(`✅ Transaction confirmed: ${hash.slice(0, 6)}...${hash.slice(-4)}. Updating balances.`);
      // After crypto transaction is confirmed on chain, update Firestore
      // This part would ideally be handled by a backend webhook listening to chain events
      // For MVP, we'll do it client-side optimistically.
      const finalizeSwapInFirestore = async () => {
        try {
          // Log transaction
          const transaction: Transaction = {
            transactionId: `swap_${hash}`,
            userId: userId!,
            amount: parseFloat(fromAmount),
            currency: fromCurrency,
            transactionType: 'crypto-swap' as TransactionType,
            status: 'success' as TransactionStatus,
            timestamp: serverTimestamp(),
            walletAddress: connectedAddress,
            game: 'vault-swap',
            // Add details about what was received
            itemId: toCurrency, // Use itemId to indicate received currency
            screenshot: toAmount, // Use screenshot field to store received amount for simplicity
          };
          await addDoc(collection(db, 'Transactions'), transaction);

          // Update user's JEWELS balance (if relevant to your in-game economy)
          // For a pure crypto swap, this might not directly affect JEWELS unless it's a bridge.
          // If the swap results in JEWELS, update here. For now, assume it's just crypto.
          // await updatePlayerFirestore({ jewels: newJewelsBalance }); // Example

          setShowMessage(`✅ Crypto swap completed! Balances updated.`);
          setLoading(false);
          setFromAmount('');
          setToAmount('');
        } catch (err: any) {
          console.error('Failed to finalize swap in Firestore:', err);
          setError(err.message || 'Failed to update balance after swap. Contact support.');
          setShowMessage('⚠️ Swap failed to finalize in app. Contact support.');
          setLoading(false);
        }
      };
      finalizeSwapInFirestore();
    } else if (txError) {
      setError(`Transaction failed: ${txError.message}`);
      setShowMessage(`⚠️ Transaction failed: ${txError.message}`);
      setLoading(false);
    }
  }, [isConfirmed, hash, txError, userId, fromAmount, fromCurrency, toAmount, toCurrency, connectedAddress, setShowMessage, updatePlayerFirestore]);


  return (
    <SwytchCard gradient="from-teal-700/20 to-cyan-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center">
        <RefreshCw className="inline-block w-7 h-7 mr-2 text-primary" /> Crypto Swap
      </h2>
      {!isConnected ? (
        <p className="text-center text-gray-400">Connect your wallet to enable crypto swaps.</p>
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

export default CryptoSwapModule;
