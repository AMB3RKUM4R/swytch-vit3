// src/components/market/WalletSwapForms.tsx
import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Wallet } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { SupportedCurrency, PlayerData, TransactionType, TransactionStatus } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Hardcoded MetaMask wallet address for deposits
const DEPOSIT_WALLET_ADDRESS = '0x03d3c8065a4A936b856A39121a5F9e0A441dF4E8';

interface WalletSwapFormsProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
}

const WalletSwapForms: FC<WalletSwapFormsProps> = ({ userId, setShowMessage }) => {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: connectedAddress, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: connectedAddress, unit: 'ether' });

  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  // Only ETH is supported for deposits/swaps in this decentralized model

  // Simulate exchange rate (for MVP, a fixed rate)
  const getExchangeRate = useCallback((_from: SupportedCurrency, _to: SupportedCurrency) => {
    // For a simple ETH deposit, the exchange rate is not relevant in the UI.
    // However, if swapping to an in-game currency like JEWELS, we can simulate.
    const ethToJewelsRate = 5000; // Example: 1 ETH = 5000 JEWELS
    return ethToJewelsRate;
  }, []);

  useEffect(() => {
    if (fromAmount) {
      const rate = getExchangeRate('ETH', 'JOULES');
      setToAmount((parseFloat(fromAmount) * rate).toFixed(0));
    } else {
      setToAmount('');
    }
  }, [fromAmount, getExchangeRate]);

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

    if (ethBalance && parseFloat(fromAmount) > parseFloat(ethBalance.formatted)) {
      setError('Insufficient ETH balance.');
      setShowMessage('⚠️ Insufficient ETH balance.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionId = `deposit_request_${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: parseFloat(fromAmount),
        currency: 'ETH' as SupportedCurrency,
        transactionType: 'deposit' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        walletAddress: connectedAddress,
        game: 'market-deposit',
      });

      sendTransaction({
        to: DEPOSIT_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(fromAmount),
      });

      setShowMessage(`Deposit initiated. Please confirm in your wallet.`);
    } catch (err: any) {
      console.error('Swap initiation error:', err);
      setError(err.message || 'Failed to initiate deposit. Please try again.');
      setShowMessage('⚠️ Failed to initiate deposit.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage(`✅ Deposit confirmed: ${hash.slice(0, 6)}...${hash.slice(-4)}. Updating JEWELS balance.`);
      const finalizeDepositInFirestore = async () => {
        if (!userId) return;
        try {
          await addDoc(collection(db, 'Transactions'), {
            transactionId: `deposit_${hash}`,
            userId,
            amount: parseFloat(fromAmount),
            currency: 'ETH' as SupportedCurrency,
            transactionType: 'deposit' as TransactionType,
            status: 'success' as TransactionStatus,
            timestamp: serverTimestamp(),
            walletAddress: connectedAddress,
            game: 'market-deposit',
            paypalOrderId: hash,
            paymentMethod: 'crypto',
          });
          setShowMessage(`✅ Crypto deposit completed! Your JEWELS balance will be updated shortly.`);
          setLoading(false);
          setFromAmount('');
          setToAmount('');
        } catch (err: any) {
          console.error('Failed to finalize deposit in Firestore:', err);
          setError(err.message || 'Failed to update balance after deposit. Contact support.');
          setShowMessage('⚠️ Deposit failed to finalize in app. Contact support.');
          setLoading(false);
        }
      };
      finalizeDepositInFirestore();
    } else if (txError) {
      setError(`Transaction failed: ${txError.message}`);
      setShowMessage(`⚠️ Transaction failed: ${txError.message}`);
      setLoading(false);
    }
  }, [isConfirmed, hash, txError, userId, fromAmount, connectedAddress, setShowMessage]);

  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Wallet className="w-7 h-7 text-primary" /> Deposit ETH
      </h2>
      {!isConnected ? (
        <p className="text-center text-gray-400">Connect your wallet to deposit ETH.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="fromAmount" className="text-gray-300 text-sm">Amount to deposit:</label>
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
              value="ETH"
              className="input mt-2 opacity-70 cursor-not-allowed"
              disabled
            >
              <option value="ETH">ETH</option>
            </select>
            {ethBalance && <p className="text-xs text-gray-400">Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH</p>}
          </div>

          <div className="flex justify-center my-2">
            <ArrowRight className="w-8 h-8 text-white" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="toAmount" className="text-gray-300 text-sm">You will receive (estimated JEWELS):</label>
            <input
              id="toAmount"
              type="number"
              value={toAmount}
              readOnly
              className="input opacity-70 cursor-not-allowed"
              disabled
            />
            <select
              value="JEWELS"
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
              isTxPending ? 'Confirming in Wallet...' : isConfirming ? 'Depositing...' : 'Processing...'
            ) : (
              'Initiate Deposit'
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