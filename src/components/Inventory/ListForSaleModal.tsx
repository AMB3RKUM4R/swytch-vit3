// src/components/Inventory/ListForSaleModal.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// ListForSaleModalProps is now correctly imported from the shared types file
import { ListForSaleModalProps, SupportedCurrency } from '@/lib/types'; 
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import SwytchCard from '../SwytchCard';

const ListForSaleModal: FC<ListForSaleModalProps> = ({
  itemDefinition,
  instanceId,
  onClose,
  onSuccess,
}) => {
  const { userId, playerData } = usePlayer();
  const { setShowMessage } = useModal();
  const { address } = useAccount();

  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('JOULES');
  const [error, setError] = useState<string | null>(null);
  
  const { data: hash, isPending: isTxPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleList = async () => {
    if (!userId || !address) {
      setError('User or wallet not connected.');
      setShowMessage('⚠️ User or wallet not connected.');
      return;
    }
    if (!playerData || !playerData.inventory?.items) {
      setError('Player inventory not loaded.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('Please enter a valid price.');
      setShowMessage('⚠️ Please enter a valid price.');
      return;
    }

    setError(null);
    
    const itemRef = doc(db, `Players/${userId}/InventoryItems`, instanceId);
    try {
      // 1. Mark item as listed in Firestore
      await updateDoc(itemRef, {
        isListed: true,
        listingPrice: `${price} ${currency}`,
      });
      
      // 2. Simulate success (or integrate blockchain call here)
      setShowMessage(`ℹ️ Item listing submitted!`);
      onSuccess(instanceId);

    } catch (err: any) {
      console.error('Failed to list item:', err);
      setError(err.message || 'Failed to list item for sale.');
      setShowMessage('⚠️ Failed to list item for sale.');
      
      // 3. Roll back Firestore status on failure
      await updateDoc(itemRef, {
        isListed: false,
        listingPrice: null,
      });
    }
  };

  const isLoading = isTxPending || isConfirming;

  return (
    <AnimatePresence>
      <motion.div
        // Applied glass-dark style to the overlay
        className="fixed inset-0 z-50 flex items-center justify-center glass-dark"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          // Framer Motion animation applied correctly to this motion.div wrapper
          initial={{ scale: 0.8, y: 50 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.8, y: 50 }}
        >
            <SwytchCard
                className="relative max-w-sm w-full mx-4"
                // SwytchCard only receives style/content props
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X /></button>
                <h2 className="text-2xl font-bold font-poppins text-primary mb-4">List {itemDefinition.itemName}</h2>
                
                <div className="text-center mb-4">
                  <img
                    src={itemDefinition.visuals?.iconName || `https://placehold.co/96x96/1a202c/FFFFFF?text=Item`}
                    alt={itemDefinition.itemName}
                    className="w-24 h-24 object-contain p-2 rounded-md mx-auto border border-border"
                  />
                  <p className="text-sm text-muted-foreground mt-2">{itemDefinition.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                      className="input"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                      className="input"
                      disabled={isLoading}
                    >
                      <option value="JOULES">JOULES</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                  <motion.button
                    className="btn-primary w-full"
                    onClick={handleList}
                    disabled={isLoading || !price || parseFloat(price) <= 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? <Loader2 className="animate-spin"/> : 'Confirm Listing'}
                  </motion.button>
                </div>
                
                <AnimatePresence>
                    {error && (
                      <motion.p 
                        className="text-destructive text-sm text-center mt-4 font-inter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertTriangle className="inline-block w-4 h-4 mr-2"/> 
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
            </SwytchCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListForSaleModal;