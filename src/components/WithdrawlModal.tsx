// src/components/WithdrawModal.tsx
import { FC, useState, useCallback, useEffect } from 'react'; // FIX: Ensures all core React hooks are imported
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, AlertTriangle, Send } from 'lucide-react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';

import { cn } from '@/lib/utils';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// ────────────────────────────────────────────────────────────────
// CONFIGURATION
// ────────────────────────────────────────────────────────────────
const REQUEST_WITHDRAWAL_API = '/api/requestWithdrawalApi'; 
const WITHDRAWAL_CURRENCY = 'USD_EQUIVALENT'; 
const MIN_WITHDRAWAL_AMOUNT = 10;
// ────────────────────────────────────────────────────────────────

const WithdrawModal: FC = () => {
  // Accessing idToken is now correct due to PlayerContext fix.
  const { userId, idToken, joulesBalance, logTransaction } = usePlayer();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const { address: connectedWalletAddress } = useAccount();

  const [amount, setAmount] = useState<string>('');
  const [targetAddress, setTargetAddress] = useState<string>(connectedWalletAddress || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= MIN_WITHDRAWAL_AMOUNT;
  const hasEnoughJoules = parsedAmount <= joulesBalance;
  
  // Basic validation for an Ethereum-style address
  const isValidAddress = isAddress(targetAddress);

  // Auto-populate connected wallet address on modal open
  useEffect(() => { 
    if (activeModal === 'withdraw' && connectedWalletAddress) {
        setTargetAddress(connectedWalletAddress);
    }
  }, [activeModal, connectedWalletAddress]);


  const handleWithdrawalRequest = useCallback(async () => {
    setError(null);

    if (!userId || !idToken) {
        setError('Authentication required to process withdrawal.');
        return;
    }
    if (!isValidAmount || !hasEnoughJoules) {
      setError(`Invalid amount. Must be at least ${MIN_WITHDRAWAL_AMOUNT} and not exceed your ${joulesBalance} JOULES balance.`);
      return;
    }
    if (!isValidAddress) {
      setError('Please provide a valid recipient crypto address (0x...).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(REQUEST_WITHDRAWAL_API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, 
        },
        body: JSON.stringify({
          amount: parsedAmount,
          currency: WITHDRAWAL_CURRENCY,
          targetAddress: targetAddress,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'pending') {
        logTransaction({
            userId: userId!,
            amount: -parsedAmount, 
            currency: 'JOULES',
            transactionType: 'withdraw',
            status: 'pending',
            itemId: 'withdrawal-request',
            paymentGatewayId: targetAddress, 
            transactionHash: result.transactionId, 
        });
        
        setShowMessage(`✅ Withdrawal request submitted! A deduction of ${parsedAmount} JOULES is pending approval.`);
        setActiveModal(null);
      } else {
        throw new Error(result.message || 'Withdrawal failed due to server error.');
      }
    } catch (err: any) {
      console.error('Withdrawal request error:', err);
      setError(err.message || 'An unexpected network error occurred.');
      setShowMessage(`❌ Withdrawal failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId, idToken, parsedAmount, targetAddress, joulesBalance, isValidAmount, isValidAddress, logTransaction, setActiveModal, setShowMessage]);


  return (
    <AnimatePresence>
      {activeModal === 'withdraw' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative modal glass-dark p-6 rounded-lg max-w-sm w-full mx-4 border border-red-400/20"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <button
              className="absolute top-4 right-4 text-foreground"
              onClick={() => setActiveModal(null)}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold font-poppins text-red-400 mb-4 flex items-center justify-center gap-2">
              <Landmark className="w-7 h-7" /> Request Withdrawal
            </h2>

            <p className="text-sm text-center text-muted-foreground mb-4">
                Current JOULES Balance: <span className="font-bold text-foreground">{joulesBalance.toFixed(2)}</span>
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="withdrawAmount" className="text-gray-300 text-sm">
                  Amount in JOULES (Min {MIN_WITHDRAWAL_AMOUNT}):
                </label>
                <input
                  id="withdrawAmount"
                  type="number"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter JOULES amount"
                  className={cn("input flex-grow", hasEnoughJoules ? '' : 'border-red-500/50')}
                  disabled={loading}
                />
                {!hasEnoughJoules && parsedAmount > 0 && (
                    <p className="text-xs text-red-400">Insufficient JOULES balance.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="targetAddress" className="text-gray-300 text-sm">
                  Recipient Crypto Address (0x...):
                </label>
                <input
                  id="targetAddress"
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="e.g., 0x..."
                  className={cn("input flex-grow", targetAddress && !isValidAddress ? 'border-red-500/50' : '')}
                  disabled={loading}
                />
              </div>

              <motion.button
                className="btn-danger w-full"
                onClick={handleWithdrawalRequest}
                disabled={loading || !isValidAmount || !hasEnoughJoules || !isValidAddress}
              >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Send className="w-5 h-5" />
                        </motion.div> 
                        Processing Request...
                    </div>
                ) : 'Request Withdrawal'}
              </motion.button>
              
              <p className="text-xs text-muted-foreground text-center pt-2">
                Withdrawals are manually reviewed and processed by the Admin within 1-3 business days.
              </p>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-rose-400 text-sm text-center mt-4 font-inter flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;