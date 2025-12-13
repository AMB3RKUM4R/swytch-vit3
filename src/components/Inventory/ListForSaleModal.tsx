import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ListForSaleModalProps, SupportedCurrency } from '@/lib/types'; 
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

const ListForSaleModal: FC<ListForSaleModalProps> = ({
  itemDefinition,
  instanceId,
  onClose,
  onSuccess,
}) => {
  const { userId } = usePlayer();
  const { setShowMessage } = useModal();
  const { address } = useAccount();

  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('JOULES');
  const [error, setError] = useState<string | null>(null);
  
  const { data: hash, isPending: isTxPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleList = async () => {
    if (!userId || !address) { setError('WALLET DISCONNECTED'); return; }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) { setError('INVALID PRICE'); return; }

    setError(null);
    const itemRef = doc(db, `Players/${userId}/InventoryItems`, instanceId);
    
    try {
      await updateDoc(itemRef, { isListed: true, listingPrice: `${price} ${currency}` });
      setShowMessage(`✅ ASSET LISTED: ${itemDefinition.itemName}`);
      onSuccess(instanceId);
      onClose(); 
    } catch (err: any) {
      setError(err.message || 'LISTING FAILED');
      await updateDoc(itemRef, { isListed: false });
    }
  };

  const isLoading = isTxPending || isConfirming;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm font-mono">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-black border border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.15)]"
        >
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#39FF14]/5">
                <h2 className="text-sm font-black italic text-[#39FF14] uppercase flex items-center gap-2 tracking-tighter">
                    <ShieldCheck className="w-4 h-4" /> SELL ASSET
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4"/></button>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-4 mb-6 p-3 border border-gray-800 bg-[#050505]">
                    <div className="w-12 h-12 bg-black border border-gray-700 flex items-center justify-center">
                        <img 
                            src={itemDefinition.visuals?.iconName || `https://placehold.co/100x100/000/FFF?text=ITEM`} 
                            className="w-10 h-10 object-contain opacity-80" 
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-white uppercase text-xs tracking-wide">{itemDefinition.itemName}</h3>
                        <p className="text-[10px] text-gray-500 uppercase">{itemDefinition.rarity} CLASS</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase mb-1 block tracking-widest">Asking Price</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-black border border-gray-800 py-3 pl-10 pr-3 text-white text-sm font-bold focus:border-[#39FF14] outline-none transition-colors placeholder:text-gray-800"
                                    placeholder="0.00"
                                    disabled={isLoading}
                                />
                            </div>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                                className="bg-black border border-gray-800 text-[#39FF14] text-xs font-bold uppercase px-4 focus:border-[#39FF14] outline-none appearance-none"
                                disabled={isLoading}
                            >
                                <option value="JOULES">JOULES</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleList} 
                        disabled={isLoading}
                        className="w-full py-3 bg-[#39FF14] text-black font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'CONFIRM LISTING'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/10 border border-red-500 text-red-500 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> {error}
                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
};

export default ListForSaleModal;