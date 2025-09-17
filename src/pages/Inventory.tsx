// src/pages/Inventory.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { PageProps, InventoryItem, ItemDefinition } from '../lib/types';

const Inventory: FC<PageProps> = ({
  userId,
  playerData,
  setActiveModal,
  setShowMessage,
}) => {
  const [selectedItem, setSelectedItem] = useState<{instance: InventoryItem, definition: ItemDefinition, instanceId: string} | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);


  const handleListForSale = (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => {
    setSelectedItem({ instance, definition, instanceId });
    setShowListForSaleModal(true);
  };

  const onListingSuccess = (instanceId: string) => {
    setShowMessage(`✅ Item ${instanceId} listed for sale!`);
    setShowListForSaleModal(false);
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div className="min-h-screen text-foreground max-w-7xl mx-auto py-16 px-4">
        <h1 className="text-5xl font-extrabold text-center mb-4">Cosmic Inventory</h1>
        <p className="text-xl text-muted-foreground text-center mb-8">
          Manage your galactic treasures and equip powerful gear.
        </p>
        <UserInventoryDisplay
          playerData={playerData}
          userId={userId}
          onListForSale={handleListForSale}
          setShowMessage={setShowMessage}
        />
        <AnimatePresence>
          {showListForSaleModal && selectedItem && (
            <ListForSaleModal
              itemInstance={selectedItem.instance}
              itemDefinition={selectedItem.definition}
              instanceId={selectedItem.instanceId}
              userId={userId}
              onClose={() => setShowListForSaleModal(false)}
              onSuccess={onListingSuccess}
              setShowMessage={setShowMessage}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Inventory;