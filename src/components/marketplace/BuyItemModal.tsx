// src/components/marketplace/BuyItemModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react'; // Added Eye
import { useTheme } from '@/components/context/ThemeContext';
import { SupportedCurrency, PlayerData, Transaction, TransactionType, TransactionStatus, MarketItem } from '@/lib/types'; // Import MarketItem
import { doc, setDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem'; // For ETH conversion

// Placeholder ABI for a generic ERC20 token (like USDT)


interface BuyItemModalProps {
  item: MarketItem; // Using MarketItem type
  userId: string | null;
  onClose: () => void;
  onSuccess: (item: MarketItem) => void; // onSuccess now takes MarketItem
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  jewelsBalance: number; // Current user's jewels balance for in-app currency check
}

const BuyItemModal: FC<BuyItemModalProps> = ({
  item,
  userId,
  onClose,
  onSuccess,
  setShowMessage,
  setActiveModal,
  updatePlayerFirestore,
  jewelsBalance,
}) => {
  const { isDarkMode } = useTheme();
  const { address: connectedAddress, isConnected } = useAccount(); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMethod, setPurchaseMethod] = useState<'crypto' | 'jewels'>('crypto'); // Default to crypto purchase

  // Wagmi hooks for sending transaction (for crypto payment)
  const { data: hash, sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash });

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

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
      if (purchaseMethod === 'crypto') {
        if (!isConnected || !connectedAddress) {
          setError('No crypto wallet connected. Please connect your wallet.');
          setShowMessage('⚠️ No crypto wallet connected. Please connect your wallet.');
          setActiveModal('auth');
          setLoading(false);
          return;
        }

        // --- Crypto Purchase Logic ---
        // This part would ideally interact with a deployed marketplace smart contract
        // For MVP, we'll simulate the transfer and rely on Firestore updates after confirmation.
        // If ETH, use sendTransaction. If ERC-20 (like USDT), use contract.write.transfer.

        if (item.listingCurrency === 'ETH') {
          sendTransaction({
            to: item.ownerId as `0x${string}`, // Seller's wallet address (assuming ownerId is wallet address)
            value: parseEther(item.listingPriceCrypto.toString()),
          });
        } else if (item.listingCurrency === 'USDT') {
          if (!walletClient || !publicClient) {
            setError('Wallet client not ready for ERC-20 transfer.');
            setShowMessage('⚠️ Wallet client not ready.');
            setLoading(false);
            return;
          }

          // Replace with actual USDT contract address for the chain you are on (e.g., Avalanche C-Chain)
          // This is a placeholder for Mainnet USDT:

          // Set hash to trigger useWaitForTransactionReceipt
          // For ERC20, use effect hook to listen for `isConfirmed`
          setShowMessage('ℹ️ USDT transfer initiated. Please confirm in your wallet.');
          // Manually trigger confirmation logic if not using useSendTransaction for ERC20
          // For now, let `isConfirmed` from useWaitForTransactionReceipt (which listens to `hash`) handle it.
          // If you need to explicitly set hash here: setHash(txHash);
        } else {
          setError(`Unsupported crypto currency: ${item.listingCurrency}`);
          setShowMessage(`⚠️ Unsupported crypto currency: ${item.listingCurrency}`);
          setLoading(false);
          return;
        }
        setShowMessage(`Crypto purchase initiated. Waiting for transaction confirmation...`);

      } else if (purchaseMethod === 'jewels') {
        // --- JEWELS Purchase Logic ---
        if (jewelsBalance < item.listingPriceCrypto) {
          setError('Insufficient JEWELS balance.');
          setShowMessage('⚠️ Insufficient JEWELS balance.');
          setLoading(false);
          return;
        }

        // 1. Deduct JEWELS from buyer's balance
        await updatePlayerFirestore({ jewels: jewelsBalance - item.listingPriceCrypto });

        // 2. Add item to buyer's inventory and remove listing status
        const buyerRef = doc(db, 'Players', userId);
        const buyerSnap = await getDoc(buyerRef);
        const buyerData = buyerSnap.data() as PlayerData;
        const buyerInventoryItems = buyerData.inventory?.items || {};
        const updatedBuyerInventoryItems = {
          ...buyerInventoryItems,
          [item.id]: {
            ...item,
            isListedForSale: false,
            listingPriceCrypto: null,
            listingCurrency: null,
            ownerId: userId, // New owner is the buyer
          },
        };
        await updatePlayerFirestore({
          inventory: {
            equipped: buyerData.inventory?.equipped || { armor: '', weapon: '' }, // Ensure equipped is always present
            items: updatedBuyerInventoryItems,
          },
        });

        // 3. Remove item from seller's inventory and credit seller with JEWELS
        const sellerRef = doc(db, 'Players', item.ownerId);
        const sellerSnap = await getDoc(sellerRef);
        const sellerData = sellerSnap.data() as PlayerData;
        const sellerInventoryItems = sellerData.inventory?.items || {};
        const updatedSellerInventoryItems = { ...sellerInventoryItems };
        delete updatedSellerInventoryItems[item.id]; // Remove item from seller's inventory

        await setDoc(sellerRef, {
          inventory: {
            equipped: sellerData.inventory?.equipped || { armor: '', weapon: '' }, // Ensure equipped is always present
            items: updatedSellerInventoryItems,
          },
          jewels: (sellerData.jewels || 0) + item.listingPriceCrypto, // Credit seller with JEWELS
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // 4. Remove item from MarketItems collection (or mark as sold)
        await setDoc(doc(db, 'MarketItems', item.id), {
          isListedForSale: false,
          buyerId: userId,
          soldAt: serverTimestamp(),
        }, { merge: true });

        // 5. Log transaction for purchase
        const transaction: Transaction = {
          transactionId: `buy_jewels_${item.id}_${Date.now()}`,
          userId: userId,
          amount: item.listingPriceCrypto,
          currency: 'JEWELS' as SupportedCurrency,
          transactionType: 'item-purchase' as TransactionType,
          status: 'success' as TransactionStatus,
          timestamp: serverTimestamp(),
          itemId: item.id,
          game: 'marketplace',
          paymentMethod: 'jewels',
        };
        await addDoc(collection(db, 'Transactions'), transaction);

        onSuccess(item); // Notify parent of success
        setShowMessage(`✅ You successfully purchased ${item.name} with JEWELS!`);
        setLoading(false); // End loading for JEWELS purchase
        onClose(); // Close modal
      }
    } catch (err: any) {
      console.error('Failed to purchase item:', err);
      setError(err.message || 'Failed to purchase item. Please try again.');
      setShowMessage('⚠️ Purchase failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle Wagmi transaction confirmation for crypto purchases
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowMessage(`✅ Crypto transaction confirmed! Item purchase being finalized.`);
      // After crypto transaction is confirmed on chain, update Firestore
      // This part would ideally be handled by a backend webhook listening to chain events
      // For MVP, we'll do it client-side optimistically.
      const finalizeCryptoPurchaseInFirestore = async () => {
        try {
          // 1. Remove item from seller's inventory (seller already received crypto on-chain)
          const sellerRef = doc(db, 'Players', item.ownerId);
          const sellerSnap = await getDoc(sellerRef);
          if (sellerSnap.exists()) {
            const sellerData = sellerSnap.data() as PlayerData;
            const sellerInventoryItems = sellerData.inventory?.items || {};
            const updatedSellerInventoryItems = { ...sellerInventoryItems };
            delete updatedSellerInventoryItems[item.id]; // Remove item from seller's inventory

            await setDoc(sellerRef, {
              inventory: {
                equipped: sellerData.inventory?.equipped || { armor: '', weapon: '' },
                items: updatedSellerInventoryItems,
              },
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }


          // 2. Add item to buyer's inventory
          const buyerRef = doc(db, 'Players', userId!); // userId is guaranteed here
          const buyerSnap = await getDoc(buyerRef);
          const buyerData = buyerSnap.data() as PlayerData;
          const buyerInventoryItems = buyerData.inventory?.items || {};
          const updatedBuyerInventoryItems = {
            ...buyerInventoryItems,
            [item.id]: {
              ...item,
              isListedForSale: false,
              listingPriceCrypto: null,
              listingCurrency: null,
              ownerId: userId!, // New owner is the buyer
            },
          };
          await updatePlayerFirestore({
            inventory: {
              equipped: buyerData.inventory?.equipped || { armor: '', weapon: '' },
              items: updatedBuyerInventoryItems,
            },
          });

          // 3. Remove item from MarketItems collection (or mark as sold)
          await setDoc(doc(db, 'MarketItems', item.id), {
            isListedForSale: false,
            buyerId: userId,
            soldAt: serverTimestamp(),
          }, { merge: true });

          // 4. Log transaction for purchase
          const transaction: Transaction = {
            transactionId: `buy_crypto_${item.id}_${hash}`,
            userId: userId!,
            amount: item.listingPriceCrypto!,
            currency: item.listingCurrency!,
            transactionType: 'item-purchase' as TransactionType,
            status: 'success' as TransactionStatus,
            timestamp: serverTimestamp(),
            itemId: item.id,
            game: 'marketplace',
            walletAddress: connectedAddress,
            paypalOrderId: hash, // Using hash as order ID for crypto tx
            paymentMethod: 'crypto',
          };
          await addDoc(collection(db, 'Transactions'), transaction);

          onSuccess(item);
          setShowMessage(`✅ ${item.name} purchased with crypto!`);
          setLoading(false); // End loading
          onClose(); // Close modal
        } catch (err: any) {
          console.error('Failed to finalize crypto purchase in Firestore:', err);
          setError(err.message || 'Failed to finalize purchase after crypto transaction. Contact support.');
          setShowMessage('⚠️ Purchase failed after crypto transaction. Contact support.');
          setLoading(false);
        }
      };
      finalizeCryptoPurchaseInFirestore();
    }
  }, [isConfirmed, hash, txError, item, userId, connectedAddress, updatePlayerFirestore, setShowMessage, onSuccess, onClose]);


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
                  <span className="ml-2 text-white">JEWELS (Your Balance: {jewelsBalance.toFixed(0)})</span>
                </label>
              </div>
            </div>

            <motion.button
              className="btn-primary"
              onClick={handlePurchase}
              disabled={loading || isTxPending || isConfirming || (purchaseMethod === 'jewels' && jewelsBalance < (item.listingPriceCrypto || 0)) || !isConnected} // Disable if not connected for crypto
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading || isTxPending || isConfirming ? (
                isTxPending ? 'Confirming in Wallet...' : isConfirming ? 'Processing Transaction...' : 'Purchasing...'
              ) : (
                `Buy Now with ${purchaseMethod === 'crypto' ? item.listingCurrency : 'JEWELS'}`
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
