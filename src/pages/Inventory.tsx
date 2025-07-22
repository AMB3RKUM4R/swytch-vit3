// src/pages/Inventory.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles } from 'lucide-react';

// Import PageProps and PlayerData types
import { PageProps, PlayerData, InventoryItem } from '../lib/types';

// Import new modular components for Inventory page
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

const Inventory: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  updatePlayerFirestore,
  initialAuthCheckComplete, // Added initialAuthCheckComplete
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerInventoryItems, setPlayerInventoryItems] = useState<Record<string, InventoryItem>>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);

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
          // Only show auth modal if auth check is complete and no user
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
      // Only show auth modal if auth check is complete and no user
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

  // This function would be passed to ListForSaleModal and called on successful listing
  const onListingSuccess = (updatedItem: InventoryItem) => {
    setShowMessage(`✅ ${updatedItem.name} listed for sale! (Requires backend verification)`);
    handleCloseListForSaleModal();
    // The onSnapshot listener will automatically update playerInventoryItems if Firestore is updated by backend
  };

  if (authLoading || isPending) {
    return null; // LoadingSpinner is handled by App.tsx
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white font-inter bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="fixed inset-0 pointer-events-none z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-cyan-500/40 to-rose-400/30 rounded-full opacity-30 blur-3xl"
            variants={flareVariants}
            animate="animate"
            style={{ top: "33%", left: "33%" }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-cyan-400/20 rounded-full opacity-20 blur-2xl"
            variants={flareVariants}
            animate="animate"
            style={{ top: "50%", right: "25%" }}
          />
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-30"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              variants={particleVariants}
              animate="animate"
            />
          ))}
        </motion.div>

        <motion.div className="relative z-10 max-w-6xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          <h1 className="text-4xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mb-8">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Your Inventory
          </h1>

          <motion.div variants={sectionVariants}>
            <UserInventoryDisplay
              inventory={playerInventoryItems}
              onListForSale={handleListForSale}
              userId={userId}
              updatePlayerFirestore={updatePlayerFirestore}
              setShowMessage={setShowMessage}
              setActiveModal={setActiveModal}
              playerData={playerData}
            />
          </motion.div>
        </motion.div>
      </motion.div>

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
    </SwytchErrorBoundary>
  );
};

export default Inventory;
