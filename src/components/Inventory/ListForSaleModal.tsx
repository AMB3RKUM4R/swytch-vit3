// src/components/Inventory/ListForSaleModal.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ListForSaleModalProps, SupportedCurrency } from '@/lib/types';
import { usePlayer } from '@/components/context/PlayerContext'; // Import the main hook
import { useModal } from '@/components/context/ModalContext'; // Import for messages
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// Placeholder for your deployed marketplace contract information

// Placeholder for currency contract addresses

const ListForSaleModal: FC<ListForSaleModalProps> = ({
  itemDefinition,
  instanceId,
  onClose,
  onSuccess,
}) => {
  // Get data from contexts
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
    
    // We update Firestore *first* to mark the item as "listing in progress"
    // This prevents the user from trying to equip or sell it twice.
    const itemRef = doc(db, `Players/${userId}/InventoryItems`, instanceId);
    try {
      await updateDoc(itemRef, {
        isListed: true,
        listingPrice: `${price} ${currency}`,
      });

      // TODO: Implement your actual on-chain listing logic here.
      // The logic below is a placeholder for calling a smart contract.
      // For a real marketplace, you would first need to approve the marketplace
      // contract to transfer your NFT.

      /*
      // Example of calling a contract. This requires the item to be an NFT
      // and for the instanceId to be the tokenId.
      writeContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_CONTRACT_ABI,
        functionName: 'listItem',
        args: [
          BigInt(instanceId), // This assumes your instanceId is the NFT tokenId
          parseEther(price), // Assumes 18 decimals
          CURRENCY_ADDRESSES[currency]
        ],
      });
      */
      
      // For this demo, we'll just simulate a success
      setShowMessage(`ℹ️ Item listing submitted!`);
      
      // In a real scenario, you'd wait for on-chain confirmation.
      // For now, we call onSuccess immediately.
      onSuccess(instanceId);

    } catch (err: any) {
      console.error('Failed to list item:', err);
      setError(err.message || 'Failed to list item for sale.');
      setShowMessage('⚠️ Failed to list item for sale.');
      
      // If the contract fails, roll back the Firestore change
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative card max-w-sm w-full mx-4"
          initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListForSaleModal;
