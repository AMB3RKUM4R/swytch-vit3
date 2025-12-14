import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, AlertTriangle, CreditCard, Droplet, QrCode, Loader2, Zap, ShieldCheck, CheckCircle } from 'lucide-react'; 
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { increment } from 'firebase/firestore';

import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { MEMBERSHIP_TIERS } from '@/lib/types';

// --- CONFIGURATION ---
const STATIC_UPI_ID = 'iznoatwork@oksbi'; 
const RECEIVER_ETH_ADDRESS = '0x98d20900a28887b72b0f182a8d3159dad09b49a3';
const MEMBERSHIP_BONUS_GOLD = 100; // Fallback if not in types

const GOLD_PACKAGES = [
  { 
    id: 'GP_SMALL', 
    gold: 100, 
    cost: { usd: 1.00, inr: 90, eth: '0.0005' }, 
    label: 'STARTER PACK'
  },
  { 
    id: 'GP_MED',   
    gold: 600, 
    cost: { usd: 5.00, inr: 450, eth: '0.0025' }, 
    label: 'MOST POPULAR', 
    popular: true
  },
  { 
    id: 'GP_WHALE', 
    gold: 1500, 
    cost: { usd: 10.00, inr: 900, eth: '0.005' }, 
    label: 'WHALE STATUS'
  },
];

const PaymentModal: FC = () => {
  const { userId, logTransaction, updatePlayerFirestore } = usePlayer();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const { isConnected } = useAccount();

  // 'gold' or 'membership' view
  const [viewMode, setViewMode] = useState<'gold' | 'membership'>('gold');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'upi'>('paypal');
  
  // Selection State
  const [selectedGoldPack, setSelectedGoldPack] = useState(GOLD_PACKAGES[1]); 
  // Defaulting to 'ecosystem' tier
  const selectedMembership = 'ecosystem'; 

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-switch view based on modal trigger
  useEffect(() => {
      if (activeModal === 'membership') setViewMode('membership');
      else setViewMode('gold');
  }, [activeModal]);

  // Determine current cost
  const getCost = () => {
      if (viewMode === 'membership') {
          return MEMBERSHIP_TIERS['ecosystem'].usdAmount;
      }
      if (paymentMethod === 'crypto') return selectedGoldPack.cost.eth;
      if (paymentMethod === 'upi') return selectedGoldPack.cost.inr;
      return selectedGoldPack.cost.usd;
  };

  const costValue = getCost();

  // Crypto Hooks
  const ethValue = paymentMethod === 'crypto' && viewMode === 'gold' ? parseEther(costValue.toString()) : parseEther('0');
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  // --- SUCCESS HANDLER ---
  const handleSuccessLogic = async (txId: string, method: string) => {
      setProcessing(true);
      try {
          if (viewMode === 'membership') {
              // 1. Grant Membership + Bonus
              await updatePlayerFirestore({
                  isPETMember: true,
                  membership: 'ecosystem',
                  gold: increment(MEMBERSHIP_BONUS_GOLD) as any
              });
              
              await logTransaction({
                  transactionId: txId,
                  userId: userId!,
                  amount: Number(costValue),
                  currency: 'USD',
                  transactionType: 'membership',
                  status: 'completed',
                  itemId: 'ecosystem',
                  paymentGatewayId: method
              });
              setShowMessage(`✅ UPGRADE COMPLETE! +${MEMBERSHIP_BONUS_GOLD} GOLD ADDED.`);
          } else {
              // 2. Grant Gold
              await updatePlayerFirestore({
                  gold: increment(selectedGoldPack.gold) as any
              });

              await logTransaction({
                  transactionId: txId,
                  userId: userId!,
                  amount: Number(costValue),
                  currency: method === 'ETH' ? 'ETH' : method === 'UPI' ? 'INR' : 'USD',
                  transactionType: 'deposit',
                  status: 'completed',
                  itemId: selectedGoldPack.id,
                  paymentGatewayId: method
              });
              setShowMessage(`✅ +${selectedGoldPack.gold} GOLD ADDED TO VAULT.`);
          }
          setActiveModal(null);
      } catch (e) {
          console.error(e);
          setError("DATABASE SYNC FAILED. CONTACT SUPPORT.");
      } finally {
          setProcessing(false);
      }
  };

  // --- PAYMENT METHODS ---

  const handleUpiPayment = useCallback(() => {
    setError(null);
    if (!userId) { setError('LOGIN REQUIRED'); return; }

    const intentUrl = `upi://pay?pa=${STATIC_UPI_ID}&pn=SwytchArcade&am=${costValue}&cu=INR&tn=Buy_${viewMode}_${userId}`;
    
    // Simulate Pending
    logTransaction({
        userId: userId,
        amount: Number(costValue),
        currency: 'INR', 
        transactionType: viewMode === 'membership' ? 'membership' : 'deposit', 
        status: 'pending',
        paymentGatewayId: STATIC_UPI_ID,
    });

    setShowMessage(`✅ UPI LAUNCHED. CONFIRM ₹${costValue}`);
    window.location.href = intentUrl; 
  }, [userId, costValue, viewMode, logTransaction, setShowMessage]);

  const handleCryptoPayment = () => {
    setError(null);
    if (!userId || !isConnected) { setError('WALLET DISCONNECTED'); return; }
    if (viewMode === 'membership') { setError("MEMBERSHIP VIA CRYPTO COMING SOON"); return; }
    
    sendTransaction({ to: RECEIVER_ETH_ADDRESS as `0x${string}`, value: ethValue });
  };

  useEffect(() => {
    if (isConfirmed && hash) {
        handleSuccessLogic(hash, 'ETH');
    }
    if (txError) setError('TRANSACTION FAILED');
  }, [isConfirmed, txError, hash]);

  if (activeModal !== 'payment' && activeModal !== 'deposit') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-black border border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.1)] relative rounded-sm overflow-hidden"
        >
            {/* Header Tabs */}
            <div className="flex border-b border-gray-800">
                <button 
                    onClick={() => setViewMode('gold')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'gold' ? 'bg-yellow-500 text-black' : 'bg-black text-gray-500 hover:text-white'}`}
                >
                    BUY GOLD
                </button>
                <button 
                    onClick={() => setViewMode('membership')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'membership' ? 'bg-[#39FF14] text-black' : 'bg-black text-gray-500 hover:text-white'}`}
                >
                    MEMBERSHIP
                </button>
            </div>

            <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-2 right-2 z-10 text-black/50 hover:text-white transition-colors bg-white/20 rounded-full p-1"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="p-6">
                
                {/* --- GOLD VIEW --- */}
                {viewMode === 'gold' && (
                    <>
                        <div className="mb-6 space-y-2">
                            {GOLD_PACKAGES.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => setSelectedGoldPack(pkg)}
                                    className={`w-full flex justify-between items-center p-3 border transition-all duration-200 group ${
                                        selectedGoldPack.id === pkg.id 
                                        ? 'border-yellow-500 bg-yellow-500/10' 
                                        : 'border-gray-800 hover:border-yellow-500/50 bg-black'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Zap className={`w-4 h-4 ${selectedGoldPack.id === pkg.id ? 'text-yellow-500' : 'text-gray-600'}`} />
                                        <div className="text-left">
                                            <div className="text-white font-bold text-sm">{pkg.gold} GOLD</div>
                                            <div className="text-[9px] text-gray-500 uppercase">{pkg.label}</div>
                                        </div>
                                    </div>
                                    <div className="text-yellow-500 font-bold text-xs">
                                        {paymentMethod === 'crypto' ? `${pkg.cost.eth} ETH` : paymentMethod === 'upi' ? `₹${pkg.cost.inr}` : `$${pkg.cost.usd}`}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {['paypal', 'crypto', 'upi'].map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => { setPaymentMethod(m as any); setError(null); }}
                                    className={`p-2 border flex flex-col items-center gap-1 transition-colors ${
                                        paymentMethod === m 
                                        ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' 
                                        : 'border-gray-800 text-gray-600 hover:text-white'
                                    }`}
                                >
                                    <span className="text-[9px] font-bold uppercase">{m}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* --- MEMBERSHIP VIEW --- */}
                {viewMode === 'membership' && (
                    <div className="mb-6 text-center">
                        <ShieldCheck className="w-12 h-12 text-[#39FF14] mx-auto mb-4" />
                        <h3 className="text-xl font-black text-white uppercase italic">Elite Status</h3>
                        <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                            Unlock All Games, Earn Joules, Priority Support.
                        </p>
                        
                        <div className="p-4 border border-[#39FF14] bg-[#39FF14]/10 mb-6">
                            <p className="text-[#39FF14] font-black text-2xl">$9.99 <span className="text-xs text-black font-bold bg-[#39FF14] px-1 rounded">LIFETIME</span></p>
                            <p className="text-white text-xs mt-2 font-bold">+100 GOLD INSTANT BONUS</p>
                        </div>
                    </div>
                )}

                {/* --- PAYPAL BUTTONS --- */}
                {(paymentMethod === 'paypal' || viewMode === 'membership') && (
                    <div className="relative z-10 w-full">
                        <PayPalButtons 
                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                            forceReRender={[costValue, viewMode]}
                            createOrder={(_, actions) => {
                                return actions.order.create({
                                    intent: "CAPTURE",
                                    purchase_units: [{
                                        amount: {
                                            currency_code: "USD",
                                            value: costValue.toString()
                                        },
                                        description: viewMode === 'membership' ? "Swytch Membership" : `Gold Pack: ${selectedGoldPack.gold}`
                                    }]
                                });
                            }}
                            onApprove={async (_, actions) => {
                                if (actions.order) {
                                    const details = await actions.order.capture();
                                    if (details.id) {
                                        handleSuccessLogic(details.id, 'PAYPAL');
                                    }
                                }
                            }}
                            onError={(err) => {
                                console.error(err);
                                setError("PAYPAL ERROR");
                            }}
                        />
                    </div>
                )}

                {/* --- CRYPTO BUTTON --- */}
                {viewMode === 'gold' && paymentMethod === 'crypto' && (
                    <button onClick={handleCryptoPayment} disabled={isTxPending || isConfirming || !isConnected} className="w-full py-3 bg-[#39FF14] hover:bg-white text-black font-black uppercase rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 tracking-widest">
                        {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : <><Droplet className="w-4 h-4" /> PAY {selectedGoldPack.cost.eth} ETH</>}
                    </button>
                )}

                {/* --- UPI BUTTON --- */}
                {viewMode === 'gold' && paymentMethod === 'upi' && (
                    <button onClick={handleUpiPayment} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase rounded-sm flex items-center justify-center gap-2 transition-colors tracking-widest">
                        <QrCode className="w-4 h-4" /> PAY ₹{selectedGoldPack.cost.inr}
                    </button>
                )}

                {/* LOADING OVERLAY */}
                {processing && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
                        <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin mb-4" />
                        <p className="text-[#39FF14] font-mono text-xs uppercase animate-pulse">PROCESSING...</p>
                    </div>
                )}

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-red-500/50 bg-red-900/10 flex items-center gap-3 rounded-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="text-xs text-red-500 uppercase font-bold">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
  );
};

export default PaymentModal;