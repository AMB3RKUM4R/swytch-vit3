// src/pages/Inventory.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { InventoryItem, ItemDefinition } from '../lib/types';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { Package } from 'lucide-react';

// --- NEW COMPONENT IMPORTS ---
import AvatarSelector from '@/components/Inventory/AvatarSelector';
import MembershipStatusOverview from '@/components/home/MembershipStatusOverview'; // Import your component
// ---

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const Inventory: FC = () => {
  const { setActiveModal, setShowMessage } = useModal();
  const { userId, playerData } = usePlayer();

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
            Manage your character, status, and galactic treasures.
          </p>
        </motion.div>
        
        {/* --- NEW 2-COLUMN LAYOUT --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={sectionVariants}
        >
          {/* --- LEFT COLUMN (1/3 width) --- */}
          <div className="md:col-span-1 flex flex-col gap-8">
            <AvatarSelector />
            <MembershipStatusOverview />
          </div>

          {/* --- RIGHT COLUMN (2/3 width) --- */}
          <div className="md:col-span-2">
            <UserInventoryDisplay
              playerData={playerData}
              userId={userId}
              onListForSale={handleListForSale}
              setShowMessage={setShowMessage}
            />
          </div>
        </motion.div>
        {/* --- END OF NEW LAYOUT --- */}
        
        <AnimatePresence>
          {showListForSaleModal && selectedItem && (
            <ListForSaleModal
              itemDefinition={selectedItem.definition}
              instanceId={selectedItem.instanceId}
              onClose={() => setShowListForSaleModal(false)}
              onSuccess={onListingSuccess} 
              itemInstance={selectedItem.instance}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Inventory;