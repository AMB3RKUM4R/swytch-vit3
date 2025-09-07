import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
// UPDATED: All necessary types are now imported
import { InventoryItem, ItemDefinition, SupportedCurrency } from '@/lib/types';
// FIXED: Added missing Firestore imports
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';

// Props are now aligned with our new types
interface ListForSaleModalProps {
  instance: InventoryItem;
  definition: ItemDefinition;
  instanceId: string; // The unique key for the item in the player's inventory
  userId: string | null;
  onClose: () => void;
  onSuccess: (instanceId: string) => void;
  setShowMessage: (message: string) => void;
}

const ListForSaleModal: FC<ListForSaleModalProps> = ({
  instance,
  definition,
  instanceId,
  userId,
  onClose,
  onSuccess,
  setShowMessage,
}) => {
  const { isDarkMode } = useTheme();
  const { isConnected, address } = useAccount();
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('JOULES');
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const handleList = async () => {
    if (!userId || !address) {
      setShowMessage('⚠️ User or wallet not connected.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setShowMessage('⚠️ Please enter a valid price.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const numericPrice = parseFloat(price);
      const playerDocRef = doc(db, 'Players', userId);
      // We will create a new top-level collection for all public market listings
      const marketItemDocRef = doc(db, 'MarketListings', instanceId);

      // 1. Create the public listing in the 'MarketListings' collection
      await setDoc(marketItemDocRef, {
        instanceId: instanceId,
        itemId: instance.itemId,
        sellerId: userId,
        price: numericPrice,
        currency: currency,
        listedAt: serverTimestamp(),
        itemName: definition.itemName,
        rarity: definition.rarity,
        itemType: definition.itemType,
      });

      // 2. Mark the item as 'listed' in the player's private inventory
      await updateDoc(playerDocRef, {
        [`inventory.items.${instanceId}.isListed`]: true,
        updatedAt: serverTimestamp()
      });

      setShowMessage(`✅ ${definition.itemName} listed for sale!`);
      onSuccess(instanceId);

    } catch (err: any) {
      console.error('Failed to list item for sale:', err);
      setError(err.message || 'An unexpected error occurred.');
      setShowMessage('⚠️ Failed to list item for sale.');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = definition.visuals?.iconName;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'} p-6 rounded-lg max-w-sm w-full mx-4 border border-rose-400/20`}
          initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-foreground"><X /></button>
          <h2 className="text-2xl font-bold font-poppins text-primary mb-4">List {definition.itemName}</h2>
          
          <div className="text-center mb-4">
              <img
                src={imageUrl || `https://placehold.co/96x96/1a202c/FFFFFF?text=Item`}
                alt={definition.itemName}
                className="w-24 h-24 object-contain p-2 rounded-md mx-auto border border-gray-700"
              />
            <p className="text-sm text-gray-300 mt-2">{definition.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="input bg-gray-700 p-3 rounded-md border border-rose-400/20 w-full text-gray-200"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="input bg-gray-700 p-3 rounded-md border border-rose-400/20 w-full text-gray-200"
              >
                <option value="JOULES">JOULES</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <motion.button
              className="btn-primary w-full"
              onClick={handleList}
              disabled={loading || !price || parseFloat(price) <= 0 || !isConnected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Listing...' : 'Confirm Listing'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListForSaleModal;

