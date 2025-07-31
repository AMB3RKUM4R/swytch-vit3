// src/components/marketplace/BuyItemModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { MarketItem } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

// Hardcoded MetaMask wallet address for deposits

interface BuyItemModalProps {
  item: MarketItem;
  userId: string | null;
  onClose: () => void;
  onSuccess: (item: MarketItem) => void;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
}

const BuyItemModal: FC<BuyItemModalProps> = ({
  item,
  userId,
  onClose,
  onSuccess,
  setShowMessage,
  setActiveModal,
}) => {
  const { isDarkMode } = useTheme();
  const { address: connectedAddress, isConnected } = useAccount(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMethod, setPurchaseMethod] = useState<'crypto' | 'jewels'>('crypto');

  // Wagmi hooks for sending transaction (for crypto payment)
  const { data: hash, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const handlePurchase = async () => {
    if (!userId) {
      setError('User not authenticated. Please sign in.');
      setShowMessage('⚠️ User not authenticated. Please sign in.');
      setActiveModal('auth');
      return;
    }
    if (userId === item.ownerId) {
      setError('You cannot buy your own item.');
      setShowMessage('⚠️ You cannot buy your own item.');
      return;
    }
    if (!item.isListedForSale || !item.listingPriceCrypto || !item.listingCurrency) {
      setError('Item is not correctly listed for sale.');
      setShowMessage('⚠️ Item is not correctly listed for sale.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // --- SUBMIT PURCHASE REQUEST TO BACKEND (Firestore) ---
      // This is the secure approach. The client sends a request, and a server-side
      // Cloud Function will handle the actual state changes (deducting currency,
      // updating inventories, etc.) in a secure transaction.
      // This prevents a malicious user from manipulating their balance or inventory.

      await addDoc(collection(db, 'purchase_requests'), {
        userId,
        itemId: item.id,
        purchaseMethod,
        price: item.listingPriceCrypto,
        currency: item.listingCurrency,
        sellerId: item.ownerId,
        requestedAt: serverTimestamp(),
      });
      
      setShowMessage(`Purchase request submitted for "${item.name}". Pending verification.`);
      setLoading(false);
      onClose(); // Close the modal as the request has been submitted
    } catch (err: any) {
      console.error('Failed to submit purchase request:', err);
      setError(err.message || 'Failed to submit purchase request. Please try again.');
      setShowMessage('⚠️ Purchase request failed. Please try again.');
      setLoading(false);
    }
  };


  // Handle Wagmi transaction confirmation for crypto payments (from a previous action)
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage(`✅ Crypto transaction confirmed! Purchase is being finalized by the backend.`);
      // The backend (Cloud Function) would detect this confirmed transaction and
      // update the player's state and item ownership in a secure manner.
      onSuccess(item); // Optimistically update the UI to reflect a successful purchase
      setLoading(false);
      onClose();
    } else if (txError) {
      setError(`Transaction failed: ${txError.message}`);
      setShowMessage(`⚠️ Transaction failed: ${txError.message}`);
      setLoading(false);
    }
  }, [isConfirmed, hash, txError, item, connectedAddress, setShowMessage, onSuccess, onClose]);


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

          <h2 className="text-2xl font-bold font-poppins text-primary mb-4">Buy {item.name}</h2>

          <div className="text-center mb-4">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-md mx-auto border border-gray-700"
                onError={(e) => e.currentTarget.src = `https://placehold.co/128x128/FF0000/FFFFFF?text=Item+Image`}
              />
            ) : (
              <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto" />
            )}
            <h3 className="text-xl font-bold text-white mt-2">{item.name}</h3>
            <p className="text-sm text-gray-300">{item.description}</p>
            <p className="text-lg font-bold text-primary mt-2">
              Price: {item.listingPriceCrypto} {item.listingCurrency}
            </p>
            {item.ownerId && (
              <p className="text-xs text-gray-400">Seller: {item.ownerId.slice(0, 6)}...{item.ownerId.slice(-4)}</p>
            )}
          </div>

          <div className="space-y-4">
            {/* Purchase method selection (for UI/UX, backend will validate) */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold">Choose Payment Method:</label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="crypto"
                    checked={purchaseMethod === 'crypto'}
                    onChange={() => setPurchaseMethod('crypto')}
                    className="form-radio text-primary"
                  />
                  <span className="ml-2 text-white">Crypto ({item.listingCurrency})</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="jewels"
                    checked={purchaseMethod === 'jewels'}
                    onChange={() => setPurchaseMethod('jewels')}
                    className="form-radio text-primary"
                  />
                  <span className="ml-2 text-white">JEWELS</span>
                </label>
              </div>
            </div>

            <motion.button
              className="btn-primary"
              onClick={handlePurchase}
              disabled={loading || isTxPending || isConfirming || !isConnected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading || isTxPending || isConfirming ? (
                isTxPending ? 'Confirming in Wallet...' : isConfirming ? 'Processing Transaction...' : 'Purchasing...'
              ) : (
                `Buy Now`
              )}
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
            {hash && (
              <motion.p
                className="text-cyan-400 text-sm text-center mt-4 font-inter break-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Transaction Hash: {hash}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BuyItemModal;