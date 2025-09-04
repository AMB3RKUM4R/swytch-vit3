import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Link } from 'react-router-dom';
import { Sparkles, Package, Store } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { PageProps, PlayerData, InventoryItem } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const Inventory: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  updatePlayerFirestore,
  initialAuthCheckComplete,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerInventoryItems, setPlayerInventoryItems] = useState<Record<string, InventoryItem>>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);

  // All logic (useEffect, handlers) remains unchanged
  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setPlayerInventoryItems(data.inventory?.items || {});
        } else {
          setPlayerData(null);
          setPlayerInventoryItems({});
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch inventory data:', err);
        setShowMessage('⚠️ Failed to load inventory. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setPlayerInventoryItems({});
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to view your inventory!');
        setActiveModal('auth');
      }
    }
  }, [userId, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  const handleListForSale = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowListForSaleModal(true);
  };

  const handleCloseListForSaleModal = () => {
    setShowListForSaleModal(false);
    setSelectedItem(null);
  };

  const onListingSuccess = (updatedItem: InventoryItem) => {
    setShowMessage(`✅ ${updatedItem.name} listed for sale! (Requires backend verification)`);
    handleCloseListForSaleModal();
  };

  if (authLoading || isPending) {
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StarfieldBackground />
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* ## Simplified Header Section ## */}
          <motion.section variants={sectionVariants} className="text-center">
            <Package className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Cosmic Inventory
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter mb-8">
              Manage your galactic treasures, equip powerful gear, and list your NFTs on the marketplace.
            </p>
            <Link to="/marketplace" className="btn-system-glow text-lg font-semibold group">
                Go to Marketplace <Store className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </motion.section>

          {/* ## User Inventory Display ## */}
          <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Your Galactic Treasures
            </h2>
            <div className="p-4 sm:p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                <UserInventoryDisplay
                  inventory={playerInventoryItems}
                  onListForSale={handleListForSale}
                  userId={userId}
                  updatePlayerFirestore={updatePlayerFirestore}
                  setShowMessage={setShowMessage}
                  setActiveModal={setActiveModal}
                  playerData={playerData}
                />
            </div>
          </motion.section>
        </div>

        {/* ## List For Sale Modal (Logic Only) ## */}
        <AnimatePresence>
          {showListForSaleModal && selectedItem && (
            <ListForSaleModal
                item={selectedItem}
                userId={userId}
                onClose={handleCloseListForSaleModal}
                onSuccess={onListingSuccess}
                setShowMessage={setShowMessage}
                setActiveModal={setActiveModal}
                updatePlayerFirestore={updatePlayerFirestore}
                playerInventoryItems={playerInventoryItems}
                playerEquipped={playerData?.inventory?.equipped || null}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Inventory;