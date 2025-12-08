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
    if (!userId || !address) {
      setError('WALLET NOT CONNECTED');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('INVALID PRICE');
      return;
    }

    setError(null);
    const itemRef = doc(db, `Players/${userId}/InventoryItems`, instanceId);
    
    try {
      await updateDoc(itemRef, {
        isListed: true,
        listingPrice: `${price} ${currency}`,
      });
      setShowMessage(`✅ ASSET LISTED: ${itemDefinition.itemName}`);
      onSuccess(instanceId);
      onClose(); // Auto close on success
    } catch (err: any) {
      setError(err.message || 'LISTING FAILED');
      await updateDoc(itemRef, { isListed: false });
    }
  };

  const isLoading = isTxPending || isConfirming;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-black border border-primary shadow-[0_0_50px_rgba(0,255,65,0.15)]"
        >
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-bold font-russo text-white uppercase flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> SELL ASSET
                </h2>
                <button onClick={onClose} className="text-white/50 hover:text-white"><X /></button>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                        <img 
                            src={itemDefinition.visuals?.iconName || `https://placehold.co/100x100/000/FFF?text=ITEM`} 
                            className="w-12 h-12 object-contain" 
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-white uppercase">{itemDefinition.itemName}</h3>
                        <p className="text-xs text-gray-500 font-mono">{itemDefinition.rarity}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 font-mono uppercase mb-1 block">Asking Price</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="input pl-10"
                                    placeholder="0.00"
                                    disabled={isLoading}
                                />
                            </div>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                                className="bg-black border border-white/20 text-white text-xs font-bold uppercase px-3 focus:border-primary outline-none"
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
                        className="btn-primary w-full mt-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'CONFIRM LISTING'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 flex items-center gap-2 text-red-500 text-xs font-mono">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
};

export default ListForSaleModal;