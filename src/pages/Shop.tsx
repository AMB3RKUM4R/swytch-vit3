// src/pages/Shop.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Store, Sparkles, DollarSign, Loader2, Filter } from 'lucide-react';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import SwytchCard from '@/components/SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, startAfter, limit, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ShopListing } from '@/lib/types'; // Our new type

// Import the new components you provided
import TrustMarketHero from '@/components/market/TrustMarketHero';
import TrustProgression from '@/components/market/TrustProgression';
import TrustRewardTiers from '@/components/market/TrustRewardTiers';
import TrustMarketCTA from '@/components/market/TrustMarketCTA';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

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
          orderBy("priceInJoules", "desc"),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "ShopListings"),
          orderBy("priceInJoules", "desc"),
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
    if(!userId) return; // Don't fetch if logged out
    fetchListings(false);
  }, [userId]); // Only fetch when user logs in

  const handlePurchase = (item: ShopListing) => {
    if (!userId) {
      setActiveModal('auth');
      return;
    }
    
    setShowMessage(`Purchasing ${item.name}...`);
    
    logTransaction({
      userId: userId,
      amount: item.priceInJoules,
      currency: "JOULES",
      transactionType: "item-purchase",
      status: "pending",
      itemId: item.id,
    });
    
    // Here you would open the real payment modal
    // setActiveModal('payment'); 
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="max-w-7xl mx-auto py-24 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- 1. NEW HERO SECTION --- */}
        <motion.section variants={sectionVariants} className="mb-12">
          <TrustMarketHero />
        </motion.section>

        {/* --- 2. MAIN MARKET GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- SIDEBAR --- */}
          <motion.div className="lg:col-span-1 space-y-8" variants={sectionVariants}>
            <div>
              <h2 className="text-2xl font-poppins font-semibold text-muted-foreground mb-4">Market Trust</h2>
              <TrustProgression />
            </div>
            <div>
              <h2 className="text-2xl font-poppins font-semibold text-muted-foreground mb-4">Trust Tiers</h2>
              <TrustRewardTiers />
            </div>
          </motion.div>

          {/* --- ITEM LISTINGS --- */}
          <motion.div className="lg:col-span-3" variants={sectionVariants}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-poppins font-semibold text-foreground flex items-center gap-3">
                <Store className="w-8 h-8" /> Live Listings
              </h2>
              <button className="btn-secondary hidden md:flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>

            {listings.length === 0 && !loading && (
              <SwytchCard variant="default" className="text-center py-12">
                <p className="text-muted-foreground">No shop listings found. Check back soon!</p>
              </SwytchCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {listings.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % ITEMS_PER_PAGE) * 0.05 }}
                  >
                    <SwytchCard variant="default" className="p-4 flex flex-col h-full">
                      <div className="relative w-full h-48 bg-card rounded-md overflow-hidden mb-4">
                        <img
                          src={item.imageUrl || `https://placehold.co/300x200/1e293b/FFFFFF?text=${item.name}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => e.currentTarget.src = `https://placehold.co/300x200/1e293b/FFFFFF?text=Item`}
                        />
                        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full capitalize">
                          {item.type}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-poppins mb-1 truncate" title={item.name}>{item.name}</h3>
                      <p className="text-sm font-semibold text-primary mb-2">{item.rarity}</p>
                      
                      <div className="flex-grow mb-3">
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
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
              {!loading && hasMore && listings.length > 0 && (
                <motion.button
                  onClick={() => fetchListings(true)}
                  className="btn-secondary text-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  Load More
                </motion.button>
              )}
              {!hasMore && listings.length > 0 && (
                <p className="text-muted-foreground">You've reached the end of the market.</p>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* --- 3. FINAL CTA --- */}
        <motion.section variants={sectionVariants} className="mt-20">
          <TrustMarketCTA />
        </motion.section>

      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Shop;