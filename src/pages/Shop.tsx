// src/pages/Shop.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Store, Sparkles, DollarSign, Loader2 } from 'lucide-react';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import SwytchCard from '@/components/SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, startAfter, limit, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ShopListing } from '@/lib/types'; // Our new type

const Shop: FC = () => {
  const { setShowMessage, setActiveModal } = useModal();
  const { logTransaction, userId } = usePlayer();

  const [listings, setListings] = useState<ShopListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const ITEMS_PER_PAGE = 8;

  const fetchListings = useCallback(async (loadMore = false) => {
    if (loading || (!hasMore && loadMore)) return;

    setLoading(true);

    try {
      let q;
      if (loadMore && lastDoc) {
        q = query(
          collection(db, "ShopListings"),
          orderBy("priceInJewels", "desc"), // Example sort
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "ShopListings"),
          orderBy("priceInJewels", "desc"),
          limit(ITEMS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const newDocs = querySnapshot.docs;

      if (newDocs.length === 0) {
        setHasMore(false);
      } else {
        const newListings = newDocs.map(doc => ({ id: doc.id, ...doc.data() } as ShopListing));
        setListings(prev => loadMore ? [...prev, ...newListings] : newListings);
        setLastDoc(newDocs[newDocs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching shop listings:", error);
      setShowMessage("⚠️ Failed to load shop items.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastDoc, setShowMessage]);

  // Initial fetch
  useEffect(() => {
    fetchListings(false);
  }, []); // Eslint-disable-line react-hooks/exhaustive-deps

  const handlePurchase = (item: ShopListing) => {
    if (!userId) {
      setActiveModal('auth');
      return;
    }
    
    // This is a placeholder for your purchase logic.
    // You would open the PaymentModal and pass the item details.
    // For now, we'll log a "pending" transaction to simulate it.
    setShowMessage(`Purchasing ${item.name}...`);
    
    logTransaction({
      userId: userId,
      amount: item.priceInJoules,
      currency: "JOULES",
      transactionType: "item-purchase",
      status: "pending",
      itemId: item.id,
    });
    
    // In a real app, you'd open the payment modal
    // setActiveModal('payment'); 
    // ...and pass item info to it
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="max-w-7xl mx-auto py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-5xl font-extrabold text-center mb-4 font-russo text-glow-primary flex items-center justify-center gap-3">
          <Store className="w-12 h-12" /> The PETverse Shop
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-12 font-inter">
          Acquire new Dungeons, Avatars, and rare in-game Items.
        </p>

        {/* Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {listings.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % ITEMS_PER_PAGE) * 0.05 }}
              >
                <SwytchCard  className="p-4 flex flex-col h-full">
                  <div className="relative w-full h-48 bg-gray-700 rounded-md overflow-hidden mb-4">
                    <img
                      src={item.imageUrl || `https://placehold.co/300x200/1a202c/FFFFFF?text=${item.name}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.src = `https://placehold.co/300x200/1a202c/FFFFFF?text=Item`}
                    />
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full capitalize">
                      {item.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-poppins mb-1 truncate" title={item.name}>{item.name}</h3>
                  <p className="text-sm font-semibold text-cyan-400 mb-2">{item.rarity}</p>
                  
                  <div className="flex-grow mb-3">
                    {item.description && <p className="text-sm text-gray-300">{item.description}</p>}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-lg font-bold text-primary flex items-center gap-1">
                      <Sparkles className="w-5 h-5 text-yellow-400" /> {item.priceInJoules.toLocaleString()}
                    </p>
                    <motion.button
                      onClick={() => handlePurchase(item)}
                      className="btn-primary py-2 px-4 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <DollarSign className="w-4 h-4 mr-1" /> Buy
                    </motion.button>
                  </div>
                </SwytchCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          {loading && (
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          )}
          {!loading && hasMore && (
            <motion.button
              onClick={() => fetchListings(true)}
              className="btn-secondary text-lg"
              whileHover={{ scale: 1.05 }}
            >
              Load More
            </motion.button>
          )}
          {!hasMore && (
            <p className="text-muted-foreground">You've reached the end of the universe.</p>
          )}
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Shop;

