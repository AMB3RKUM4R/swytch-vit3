import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownLeft, AlertTriangle, Send, Loader2, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md font-mono">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-black border border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.15)] relative"
        >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#39FF14]/5">
                <h2 className="text-lg font-black italic text-[#39FF14] uppercase flex items-center gap-2 tracking-tighter">
                    <ArrowDownLeft className="w-5 h-5" /> EXTRACT VALUE
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Balance Display */}
                <div className="bg-[#050505] p-6 border border-gray-800 text-center relative group hover:border-[#39FF14] transition-colors">
                    <span className="text-[10px] text-[#39FF14] uppercase tracking-[0.2em] block mb-2">Available Balance</span>
                    <div className="flex items-center justify-center gap-2">
                        <Zap className="w-6 h-6 text-[#39FF14] fill-current" />
                        <span className="text-4xl font-black text-white">{joulesBalance.toFixed(0)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-widest">Withdraw Amount</label>
                        <input 
                            type="number" 
                            className={`w-full bg-black border p-3 text-lg font-bold outline-none focus:border-[#39FF14] transition-colors text-white ${
                                !hasEnoughJoules && parsedAmount > 0 ? 'border-red-500 text-red-500' : 'border-gray-800'
                            }`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                        {!hasEnoughJoules && parsedAmount > 0 && (
                            <p className="text-[10px] text-red-500 mt-1 uppercase">INSUFFICIENT FUNDS</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-widest">Recipient Address (Polygon)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black border border-gray-800 p-3 text-xs font-mono outline-none focus:border-[#39FF14] transition-colors text-white placeholder:text-gray-700" 
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
                    className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-900/10 border border-red-500 text-red-500 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-3 h-3" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
  );
};

export default WithdrawModal;