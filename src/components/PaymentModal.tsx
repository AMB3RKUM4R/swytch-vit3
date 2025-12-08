import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, AlertTriangle, CreditCard, Droplet, QrCode, Loader2 } from 'lucide-react'; 
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, isAddress } from 'viem';

import { SupportedCurrency } from '@/lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const STATIC_PAYPAL_LINK = 'https://www.paypal.com/ncp/payment/TZ5XEBCG8NFGW';
const RECEIVER_ETH_ADDRESS = '0x98d20900a28887b72b0f182a8d3159dad09b49a3' as `0x${string}`;
const STATIC_UPI_ID = 'iznoatwork@oksbi'; 

const PaymentModal: FC = () => {
  const { userId, logTransaction } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const { isConnected } = useAccount();

  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'upi'>('paypal');
  const [amount, setAmount] = useState<string>('10.00');
  const [error, setError] = useState<string | null>(null);
  
  // CRYPTO LOGIC
  const ethValue = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 ? 0n : parseEther(amount);
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  // UPI HANDLER
  const handleUpiPayment = useCallback(() => {
    setError(null);
    if (!userId) { setError('LOGIN REQUIRED'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('INVALID AMOUNT'); return; }

    const parsedAmount = parseFloat(amount).toFixed(2);
    const intentUrl = `upi://pay?pa=${STATIC_UPI_ID}&pn=SwytchPETverse&am=${parsedAmount}&cu=INR&tn=Deposit%20User%20${userId}`;

    logTransaction({
        transactionId: `UPI_INIT_${Date.now()}_${userId.slice(0, 4)}`,
        userId: userId,
        amount: parseFloat(parsedAmount),
        currency: 'INR' as SupportedCurrency,
        transactionType: 'deposit',
        status: 'pending',
        itemId: 'upi-deposit-direct',
        paymentGatewayId: STATIC_UPI_ID,
    });

    setShowMessage(`✅ UPI INTENT LAUNCHED. COMPLETE IN APP.`);
    window.location.href = intentUrl; 
    setActiveModal(null);
  }, [userId, amount, logTransaction, setActiveModal, setShowMessage]);

  // CRYPTO HANDLER
  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected) { setError('WALLET DISCONNECTED'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('INVALID AMOUNT'); return; }
    if (!isAddress(RECEIVER_ETH_ADDRESS)) { setError('CONFIG ERROR: INVALID RECEIVER'); return; }
    
    sendTransaction({ to: RECEIVER_ETH_ADDRESS, value: ethValue });
  };

  useEffect(() => {
    if (isConfirmed && hash) {
      logTransaction({
        transactionId: `ETH_TX_${hash.slice(0, 10)}`,
        userId: userId!,
        amount: parseFloat(amount),
        currency: 'ETH' as SupportedCurrency,
        transactionType: 'deposit',
        status: 'pending',
        itemId: 'eth-deposit-direct',
        paymentGatewayId: RECEIVER_ETH_ADDRESS, 
        transactionHash: hash,
      });
      setShowMessage('✅ CRYPTO DEPOSIT CONFIRMED. PENDING ADMIN REVIEW.');
      setActiveModal(null);
    }
    if (txError) setError('TRANSACTION FAILED');
  }, [isConfirmed, txError, hash, logTransaction, userId, amount, setShowMessage, setActiveModal]);

  const isLoading = isTxPending || isConfirming;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-black border border-primary p-0 shadow-[0_0_50px_rgba(0,255,65,0.1)] relative"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-lg font-bold font-russo text-white uppercase flex items-center gap-2">
                    <HandCoins className="w-5 h-5 text-primary" /> INJECT ASSETS
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white"><X /></button>
            </div>

            <div className="p-6">
                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {['paypal', 'crypto', 'upi'].map((m) => (
                        <button 
                            key={m}
                            onClick={() => { setPaymentMethod(m as any); setError(null); }}
                            className={`p-3 border flex flex-col items-center gap-1 transition-colors ${paymentMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-gray-600 hover:border-white/30'}`}
                        >
                            {m === 'upi' && <QrCode className="w-5 h-5" />}
                            {m === 'paypal' && <CreditCard className="w-5 h-5" />}
                            {m === 'crypto' && <Droplet className="w-5 h-5" />}
                            <span className="text-[10px] font-bold uppercase">{m}</span>
                        </button>
                    ))}
                </div>

                {/* Amount */}
                <div className="mb-6">
                    <label className="text-[10px] text-gray-500 font-mono mb-2 block uppercase">
                        Amount ({paymentMethod === 'crypto' ? 'ETH' : paymentMethod === 'upi' ? 'INR' : 'USD'})
                    </label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input text-2xl font-russo h-14 pl-4" 
                        disabled={isLoading}
                    />
                </div>

                {/* Actions */}
                {paymentMethod === 'paypal' && (
                    <a href={STATIC_PAYPAL_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary w-full flex items-center justify-center">
                        PROCEED TO PAYPAL
                    </a>
                )}
                
                {paymentMethod === 'crypto' && (
                    <button onClick={handleCryptoPayment} disabled={isLoading || !isConnected} className="btn-primary w-full">
                        {isLoading ? <Loader2 className="animate-spin" /> : `TRANSFER ${amount} ETH`}
                    </button>
                )}

                {paymentMethod === 'upi' && (
                    <button onClick={handleUpiPayment} className="btn-primary w-full">
                        LAUNCH UPI INTENT
                    </button>
                )}

                {/* Errors */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 border border-red-500/50 bg-red-900/10 flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="text-xs text-red-500 font-mono">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
  );
};

export default PaymentModal;