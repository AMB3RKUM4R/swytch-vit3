import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, AlertTriangle, CreditCard, Droplet, QrCode, Loader2, Zap } from 'lucide-react'; 
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

//
import { SupportedCurrency } from '@/lib/types'; 
//
import { usePlayer } from '@/components/context/PlayerContext';
//
import { useModal } from '@/components/context/ModalContext';

// --- CONFIGURATION ---
const STATIC_UPI_ID = 'iznoatwork@oksbi'; 
const RECEIVER_ETH_ADDRESS = '0x98d20900a28887b72b0f182a8d3159dad09b49a3';

// The 3 Gold Tiers
const GOLD_PACKAGES = [
  { 
    id: 'GP_SMALL', 
    gold: 100, 
    cost: { usd: 1.00, inr: 90, eth: '0.0005' }, 
    label: 'STARTER PACK',
    paypalLink: 'https://www.paypal.com/ncp/payment/LINK_FOR_1_DOLLAR' 
  },
  { 
    id: 'GP_MED',   
    gold: 600, 
    cost: { usd: 5.00, inr: 450, eth: '0.0025' }, 
    label: 'MOST POPULAR', 
    popular: true,
    paypalLink: 'https://www.paypal.com/ncp/payment/LINK_FOR_5_DOLLAR'
  },
  { 
    id: 'GP_WHALE', 
    gold: 1500, 
    cost: { usd: 10.00, inr: 900, eth: '0.005' }, 
    label: 'WHALE STATUS',
    paypalLink: 'https://www.paypal.com/ncp/payment/LINK_FOR_10_DOLLAR'
  },
];

const PaymentModal: FC = () => {
  const { userId, logTransaction } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const { isConnected } = useAccount();

  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'upi'>('paypal');
  const [selectedPack, setSelectedPack] = useState(GOLD_PACKAGES[1]); 
  const [error, setError] = useState<string | null>(null);

  const currentCost = paymentMethod === 'crypto' ? selectedPack.cost.eth 
                    : paymentMethod === 'upi' ? selectedPack.cost.inr.toString() 
                    : selectedPack.cost.usd.toString();

  // --- CRYPTO LOGIC (Wagmi) ---
  const ethValue = parseEther(selectedPack.cost.eth);
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  // --- UPI HANDLER ---
  const handleUpiPayment = useCallback(() => {
    setError(null);
    if (!userId) { setError('LOGIN REQUIRED'); return; }

    const intentUrl = `upi://pay?pa=${STATIC_UPI_ID}&pn=SwytchPETverse&am=${currentCost}&cu=INR&tn=Buy_${selectedPack.id}_${userId}`;

    // - Using strict types
    logTransaction({
        transactionId: `UPI_${selectedPack.id}_${Date.now()}`,
        userId: userId,
        amount: parseFloat(currentCost),
        currency: 'INR', 
        transactionType: 'deposit', 
        status: 'pending',
        itemId: selectedPack.id,
        paymentGatewayId: STATIC_UPI_ID,
    });

    setShowMessage(`✅ UPI LAUNCHED. CONFIRM ₹${currentCost}`);
    window.location.href = intentUrl; 
    setActiveModal(null);
  }, [userId, selectedPack, currentCost, logTransaction, setActiveModal, setShowMessage]);

  // --- CRYPTO HANDLER ---
  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected) { setError('WALLET DISCONNECTED'); return; }
    
    sendTransaction({ to: RECEIVER_ETH_ADDRESS as `0x${string}`, value: ethValue });
  };

  // --- CRYPTO SUCCESS LISTENER ---
  useEffect(() => {
    if (isConfirmed && hash) {
      logTransaction({
        transactionId: `ETH_TX_${hash.slice(0, 10)}`,
        userId: userId!,
        amount: parseFloat(selectedPack.cost.eth),
        currency: 'ETH', 
        transactionType: 'deposit',
        status: 'pending',
        itemId: selectedPack.id,
        transactionHash: hash,
        paymentGatewayId: RECEIVER_ETH_ADDRESS,
      });
      setShowMessage('✅ CRYPTO SENT. GOLD ARRIVING SOON.');
      setActiveModal(null);
    }
    if (txError) setError('TRANSACTION FAILED');
  }, [isConfirmed, txError, hash, logTransaction, userId, selectedPack, setShowMessage, setActiveModal]);

  const isLoading = isTxPending || isConfirming;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative rounded-lg overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold font-russo text-yellow-500 uppercase flex items-center gap-2">
                    <HandCoins className="w-6 h-6" /> GOLD STORE
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white"><X /></button>
            </div>

            <div className="p-6">
                {/* 1. Select Package */}
                <div className="mb-6 space-y-3">
                    <label className="text-[10px] text-gray-500 font-mono block uppercase tracking-widest">Select Package</label>
                    {GOLD_PACKAGES.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPack(pkg)}
                            className={`w-full flex justify-between items-center p-4 border rounded-md transition-all duration-200 group ${
                                selectedPack.id === pkg.id 
                                ? 'border-yellow-500 bg-yellow-500/10' 
                                : 'border-white/10 hover:border-white/30 bg-black'
                            }`}
                        >
                            <div className="text-left flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPack.id === pkg.id ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                    <Zap className="w-4 h-4 fill-current" />
                                </div>
                                <div>
                                    <div className={`font-russo text-lg ${selectedPack.id === pkg.id ? 'text-white' : 'text-gray-400'}`}>{pkg.gold} GOLD</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{pkg.label}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-yellow-500 font-mono font-bold text-lg">
                                    {paymentMethod === 'crypto' ? 'Ξ' : paymentMethod === 'upi' ? '₹' : '$'}
                                    {paymentMethod === 'crypto' ? pkg.cost.eth : paymentMethod === 'upi' ? pkg.cost.inr : pkg.cost.usd}
                                </div>
                                {pkg.popular && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">HOT</span>}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 2. Select Method */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {['paypal', 'crypto', 'upi'].map((m) => (
                        <button 
                            key={m}
                            onClick={() => { setPaymentMethod(m as any); setError(null); }}
                            className={`p-3 border rounded flex flex-col items-center gap-2 transition-colors ${
                                paymentMethod === m 
                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' 
                                : 'border-white/10 text-gray-600 hover:border-white/30 hover:text-gray-400'
                            }`}
                        >
                            {m === 'upi' && <QrCode className="w-5 h-5" />}
                            {m === 'paypal' && <CreditCard className="w-5 h-5" />}
                            {m === 'crypto' && <Droplet className="w-5 h-5" />}
                            <span className="text-[10px] font-bold uppercase">{m}</span>
                        </button>
                    ))}
                </div>

                {/* 3. Action Buttons */}
                {paymentMethod === 'paypal' && (
                    <a href={selectedPack.paypalLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-russo uppercase rounded flex items-center justify-center gap-2 transition-colors">
                        <CreditCard className="w-5 h-5" /> PAY ${selectedPack.cost.usd}
                    </a>
                )}
                
                {paymentMethod === 'crypto' && (
                    <button onClick={handleCryptoPayment} disabled={isLoading || !isConnected} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-russo uppercase rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Droplet className="w-5 h-5" /> SEND {selectedPack.cost.eth} ETH</>}
                    </button>
                )}

                {paymentMethod === 'upi' && (
                    <button onClick={handleUpiPayment} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-russo uppercase rounded flex items-center justify-center gap-2 transition-colors">
                        <QrCode className="w-5 h-5" /> PAY ₹{selectedPack.cost.inr}
                    </button>
                )}

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-red-500/50 bg-red-900/10 flex items-center gap-3 rounded">
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