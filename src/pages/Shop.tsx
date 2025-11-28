// src/pages/Shop.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
// FIX 2: Explicitly import Gamepad2 to avoid TS2552 conflict with global Gamepad type
import { Store, Sparkles, DollarSign, Filter, Loader2, Gamepad2 } from 'lucide-react'; 
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import SwytchCard from '@/components/SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// FIX 1: Import Static Data
import { staticShopItems, staticBattleArenas } from '@/lib/staticShopData';

import TrustMarketHero from '@/components/market/TrustMarketHero';
import TrustProgression from '@/components/market/TrustProgression';
import TrustRewardTiers from '@/components/market/TrustRewardTiers';
import TrustMarketCTA from '@/components/market/TrustMarketCTA';
import { TransactionType, TransactionStatus } from '@/lib/types';


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
  const { logTransaction, userId, joulesBalance, authLoading } = usePlayer(); 

  // --- STANDARD ACCESSOR MAPS ---
  // We define a standard, normalized object structure for rendering here.
  const normalizedItems = staticShopItems.map(item => ({
    id: item.id,
    name: item.itemName, // Use itemName as the standard name field
    priceInJoules: item.priceInJoules,
    priceUSD: item.priceUSD,
    description: item.description,
    imageUrl: item.imageUrl,
    rarity: item.rarity,
    category: 'ITEM',
    icon: Sparkles,
  }));
  
  const normalizedArenas = staticBattleArenas.map(arena => ({
    id: arena.id,
    name: arena.name, // Use name as the standard name field
    priceInJoules: arena.priceInJoules,
    priceUSD: arena.priceUSD,
    description: arena.description,
    imageUrl: '', // Arenas might not have an imageUrl field, so we default
    rarity: 'Common', // Default rarity for consistency
    category: 'ARENA',
    icon: Gamepad2,
  }));

  const listings = [...normalizedItems, ...normalizedArenas];
  
  const loading = authLoading; 

  const handlePurchase = (item: typeof listings[0]) => {
    if (!userId) {
      setActiveModal('auth');
      return;
    }
    
    // Check against standard 'name' field
    if (item.priceInJoules > (joulesBalance ?? 0)) { 
        setShowMessage(`❌ Insufficient JOULES to purchase ${item.name}.`);
        return;
    }
    
    setShowMessage(`Purchasing ${item.name}...`);
    
    logTransaction({
      transactionId: `PURCHASE_${userId}_${Date.now()}`,
      userId: userId,
      amount: -item.priceInJoules,
      currency: "JOULES",
      transactionType: "item-purchase" as TransactionType,
      status: "pending" as TransactionStatus,
      itemId: item.id,
    });
    
    setShowMessage(`✅ Purchase request for ${item.name} initiated. Item fulfillment pending verification.`);
  };


  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="max-w-7xl mx-auto py-24 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {loading ? (
            <div className="flex justify-center items-center h-screen -mt-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        ) : (
        <>
            {/* --- 1. NEW HERO SECTION --- */}
            <motion.section variants={sectionVariants} className="mb-12">
              <TrustMarketHero />
            </motion.section>

            {/* --- 2. MAIN MARKET GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* --- SIDEBAR --- */}
              <motion.div className="lg:col-span-1 space-y-8" variants={sectionVariants}>
                <div>
                  <h2 className="text-2xl font-poppins font-semibold text-foreground mb-4">Market Trust</h2>
                  <TrustProgression />
                </div>
                <div>
                  <h2 className="text-2xl font-poppins font-semibold text-foreground mb-4">Trust Tiers</h2>
                  <TrustRewardTiers />
                </div>
              </motion.div>

              {/* --- ITEM LISTINGS --- */}
              <motion.div className="lg:col-span-3" variants={sectionVariants}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-poppins font-semibold text-foreground flex items-center gap-3">
                    <Store className="w-8 h-8" /> Active Listings
                  </h2>
                  <button className="btn-secondary hidden md:flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                  </button>
                </div>

                {(listings.length === 0) ? (
                  <SwytchCard variant="default" className="text-center py-12">
                    <p className="text-muted-foreground">{userId ? "No shop listings found." : "Please sign in to view the shop."}</p>
                  </SwytchCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {listings.map((item) => (
                          <div key={item.id}>
                            <SwytchCard variant="default" className="p-4 flex flex-col h-full">
                              <div className="relative w-full h-48 bg-card rounded-md overflow-hidden mb-4">
                                <img
                                  src={item.imageUrl || `https://placehold.co/300x200/1e293b/FFFFFF?text=${item.category}`}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.currentTarget.src = `https://placehold.co/300x200/1e293b/FFFFFF?text=Item`}
                                />
                                <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full capitalize">
                                  {item.category}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-foreground font-poppins mb-1 truncate" title={item.name}>{item.name}</h3>
                              <p className="text-sm font-semibold text-primary mb-2">{item.rarity}</p>
                              
                              <div className="flex-grow mb-3">
                                <p className="text-sm text-muted-foreground">{item.description}</p>
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
                                  disabled={!userId || (item.priceInJoules > (joulesBalance ?? 0))}
                                >
                                  <DollarSign className="w-4 h-4 mr-1" /> 
                                  {item.priceInJoules > (joulesBalance ?? 0) ? 'Insufficient JOULES' : 'Buy'}
                                </motion.button>
                              </div>
                            </SwytchCard>
                          </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                  <p className="text-muted-foreground">The System is currently in Calibration Mode (Pilot). All listings visible.</p>
                </div>
              </motion.div>
            </div>
            
            {/* --- 3. FINAL CTA --- */}
            <motion.section variants={sectionVariants} className="mt-20">
              <TrustMarketCTA />
            </motion.section>
        </>
        )}
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Shop;