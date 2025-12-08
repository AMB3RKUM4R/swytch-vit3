import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownLeft, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';

import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// CONFIGURATION
const REQUEST_WITHDRAWAL_API = '/api/redeemJoules'; 
const MIN_WITHDRAWAL_AMOUNT = 10;

const WithdrawModal: FC = () => {
  const { userId, idToken, joulesBalance } = usePlayer();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const { address: connectedWalletAddress } = useAccount();

  const [amount, setAmount] = useState<string>('');
  const [targetAddress, setTargetAddress] = useState<string>(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= MIN_WITHDRAWAL_AMOUNT;
  const hasEnoughJoules = parsedAmount <= joulesBalance;
  const isValidAddress = targetAddress.length > 0 && isAddress(targetAddress);

  useEffect(() => { 
    if (activeModal === 'withdraw' && connectedWalletAddress && !targetAddress) {
        setTargetAddress(connectedWalletAddress);
    }
  }, [activeModal, connectedWalletAddress, targetAddress]);

  const handleWithdrawalRequest = useCallback(async () => {
    setError(null);

    if (!userId || !idToken) {
        setError('AUTHENTICATION REQUIRED');
        return;
    }
    if (!isValidAmount || !hasEnoughJoules) {
      setError(`INVALID AMOUNT (MIN ${MIN_WITHDRAWAL_AMOUNT})`);
      return;
    }
    if (!isValidAddress) {
      setError('INVALID CRYPTO ADDRESS');
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
          targetAddress: targetAddress, 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowMessage(`✅ WITHDRAWAL REQUESTED. TX: ${result.txHash?.slice(0,8)}...`);
        setActiveModal(null);
      } else {
        throw new Error(result.error || 'SERVER DENIED REQUEST');
      }
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'NETWORK ERROR');
    } finally {
      setLoading(false);
    }
  }, [userId, idToken, parsedAmount, targetAddress, joulesBalance, isValidAmount, isValidAddress, setActiveModal, setShowMessage]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-black border border-red-600 p-0 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
        >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-900/10">
                <h2 className="text-lg font-bold font-russo text-red-500 uppercase flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5" /> EXTRACT VALUE
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white"><X /></button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Balance Display */}
                <div className="bg-white/5 p-4 border border-white/10 text-center">
                    <span className="text-[10px] text-gray-500 font-mono block mb-1">AVAILABLE BALANCE</span>
                    <span className="text-3xl font-black text-white">{joulesBalance.toFixed(0)} J</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-red-500 font-mono mb-1 block uppercase">Withdraw Amount</label>
                        <input 
                            type="number" 
                            className={`input border-red-900/50 focus:border-red-500 text-lg ${!hasEnoughJoules && parsedAmount > 0 ? 'border-red-500 text-red-500' : ''}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            disabled={loading}
                        />
                        {!hasEnoughJoules && parsedAmount > 0 && (
                            <p className="text-[10px] text-red-500 mt-1 font-mono">INSUFFICIENT FUNDS</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] text-red-500 font-mono mb-1 block uppercase">Recipient Address (Polygon)</label>
                        <input 
                            type="text" 
                            className="input border-red-900/50 focus:border-red-500 text-xs font-mono" 
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            placeholder="0x..."
                            disabled={loading}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleWithdrawalRequest} 
                    disabled={loading || !isValidAmount || !hasEnoughJoules || !isValidAddress}
                    className="btn-destructive w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" /> PROCESSING...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" /> CONFIRM EXTRACTION
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-mono text-center flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
  );
};

export default WithdrawModal;