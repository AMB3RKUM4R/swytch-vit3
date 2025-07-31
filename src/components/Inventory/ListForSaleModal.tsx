// src/components/inventory/ListForSaleModal.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { InventoryItem, SupportedCurrency, PlayerData, Transaction, TransactionType, TransactionStatus } from '@/lib/types';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';

interface ListForSaleModalProps {
  item: InventoryItem;
  userId: string | null;
  onClose: () => void;
  onSuccess: (item: InventoryItem) => void;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  playerInventoryItems: Record<string, InventoryItem>;
  playerEquipped: { armor: string; weapon: string; } | null;
}

const ListForSaleModal: FC<ListForSaleModalProps> = ({
  item,
  userId,
  onClose,
  onSuccess,
  setShowMessage,
  setActiveModal,
  updatePlayerFirestore,
  playerInventoryItems,
  playerEquipped,
}) => {
  const { isDarkMode } = useTheme();
  const { isConnected, address } = useAccount();
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('ETH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleList = async () => {
    if (!userId) {
      setError('User not authenticated. Please sign in.');
      setShowMessage('⚠️ User not authenticated. Please sign in.');
      setActiveModal('auth');
      return;
    }
    if (!isConnected || !address) {
      setError('No crypto wallet connected. Please connect your wallet.');
      setShowMessage('⚠️ No crypto wallet connected. Please connect your wallet.');
      setActiveModal('auth');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('Please enter a valid price greater than zero.');
      setShowMessage('⚠️ Please enter a valid price greater than zero.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update the item in the user's inventory to mark it as listed for sale
      // This is an optimistic update.
      const updatedInventoryItems = { ...playerInventoryItems };
      const updatedItem: InventoryItem = {
        ...item,
        isListedForSale: true,
        listingPriceCrypto: parseFloat(price),
        listingCurrency: currency,
      };
      updatedInventoryItems[item.id] = updatedItem;

      let currentEquipped = playerEquipped ? { ...playerEquipped } : { armor: '', weapon: '' };
      if (currentEquipped.armor === item.id) currentEquipped.armor = '';
      if (currentEquipped.weapon === item.id) currentEquipped.weapon = '';


      // Update the player's inventory in Firestore
      await updatePlayerFirestore({
        inventory: {
          equipped: currentEquipped,
          items: updatedInventoryItems,
        },
      });

      // 2. Add an entry to a 'MarketItems' collection for the marketplace display
      await setDoc(doc(db, 'MarketItems', item.id), {
        ...updatedItem,
        sellerId: userId,
        listedAt: serverTimestamp(),
      });

      // 3. Log a transaction for the item listing
      const transaction: Transaction = {
        transactionId: `list_${item.id}_${Date.now()}`,
        userId: userId,
        amount: parseFloat(price),
        currency: currency,
        transactionType: 'item-sale' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        itemId: item.id,
        game: 'marketplace',
        walletAddress: address,
      };
      await addDoc(collection(db, 'Transactions'), transaction);

      onSuccess(updatedItem);
    } catch (err: any) {
      console.error('Failed to list item for sale:', err);
      setError(err.message || 'Failed to list item for sale. Please try again.');
      setShowMessage('⚠️ Failed to list item for sale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'} p-6 rounded-lg max-w-sm w-full mx-4 border border-rose-400/20`}
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
        >
          <motion.button
            className={`absolute top-4 right-4 text-foreground`}
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            aria-label="Close Modal"
          >
            <X className="w-6 h-6" />
          </motion.button>

          <h2 className="text-2xl font-bold font-poppins text-primary mb-4">List {item.name} for Sale</h2>

          <div className="text-center mb-4">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-md mx-auto border border-gray-700"
                onError={(e) => e.currentTarget.src = `https://placehold.co/96x96/FF0000/FFFFFF?text=Item+Image`}
              />
            ) : (
              <Tag className="w-16 h-16 text-gray-500 mx-auto" />
            )}
            <p className="text-sm text-gray-300 mt-2">{item.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className={`input bg-${isDarkMode ? 'gray-700' : 'gray-300'} p-3 rounded-md border border-rose-400/20 w-full text-${isDarkMode ? 'gray-200' : 'gray-700'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter`}
                aria-label="Listing Price"
                min="0.001"
                step="0.001"
              />
            </div>

            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className={`input bg-${isDarkMode ? 'gray-700' : 'gray-300'} p-3 rounded-md border border-rose-400/20 w-full text-${isDarkMode ? 'gray-200' : 'gray-700'} focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter`}
                aria-label="Currency"
              >
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>
            </div>

            <motion.button
              className="btn-primary"
              onClick={handleList}
              disabled={loading || !price || parseFloat(price) <= 0 || !isConnected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Listing...' : 'List Item'}
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="text-rose-400 text-sm text-center mt-4 font-inter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
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