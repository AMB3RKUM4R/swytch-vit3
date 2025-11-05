// src/pages/Inventory.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { InventoryItem, ItemDefinition } from '../lib/types';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext'; // <-- 1. IMPORT
import { Package, FileText } from 'lucide-react';
import SwytchCard from '@/components/SwytchCard';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const Inventory: FC = () => {
  // Get all data from our new contexts
  const { setActiveModal, setShowMessage } = useModal();
  const { userId, playerData } = usePlayer(); // <-- 2. GET PLAYER DATA

  const [selectedItem, setSelectedItem] = useState<{instance: InventoryItem, definition: ItemDefinition, instanceId: string} | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);

  const handleListForSale = (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => {
    setSelectedItem({ instance, definition, instanceId });
    setShowListForSaleModal(true);
  };

  const onListingSuccess = (instanceId: string) => {
    setShowMessage(`✅ Item ${instanceId} listed for sale!`);
    setShowListForSaleModal(false);
    setSelectedItem(null);
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="min-h-screen text-foreground max-w-7xl mx-auto py-24 px-4"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div className="text-center mb-12" variants={sectionVariants}>
          <Package className="mx-auto w-16 h-16 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-2">
            Cosmic Inventory
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            Manage your galactic treasures and equip powerful gear.
          </p>
        </motion.div>
        
        {/* --- NEW PHILOSOPHY CALLOUT --- */}
        <motion.div variants={sectionVariants} className="mb-12">
          <SwytchCard variant="holographic" className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <FileText className="w-12 h-12 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
                  It’s *not just powerful* — it’s **timeless**.
                </h2>
                <p className="text-muted-foreground font-inter">
                  Your items are more than pixels. They are your **Proof of Participation**. As a Beneficiary, you own what you earn. Your inventory is your digital vault, your armory, and your legacy.
                </p>
              </div>
            </div>
          </SwytchCard>
        </motion.div>

        {/* --- 3. FIX: Pass real data from context --- */}
        <motion.div variants={sectionVariants}>
          <UserInventoryDisplay
            playerData={playerData}
            userId={userId}
            onListForSale={handleListForSale}
            setShowMessage={setShowMessage}
          />
        </motion.div>
        
        <AnimatePresence>
          {showListForSaleModal && selectedItem && (
            <ListForSaleModal
              itemDefinition={selectedItem.definition}
              instanceId={selectedItem.instanceId}
              onClose={() => setShowListForSaleModal(false)}
              onSuccess={onListingSuccess} 
              itemInstance={selectedItem.instance}            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Inventory;