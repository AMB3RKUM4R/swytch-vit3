// src/pages/Inventory.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { InventoryItem, ItemDefinition } from '../lib/types';
import { useModal } from '@/components/context/ModalContext';

const Inventory: FC = () => {
  // Get all data from our new contexts
  const { setActiveModal, setShowMessage } = useModal();

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
      <motion.div 
        className="min-h-screen text-foreground max-w-7xl mx-auto py-24 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-2">
            Cosmic Inventory
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            Manage your galactic treasures and equip powerful gear.
          </p>
        </div>
        
        {/* FIX: Removed all props except the one it needs */}
        <UserInventoryDisplay
          onListForSale={handleListForSale} playerData={null} userId={null} setShowMessage={function (_message: string): void {
            throw new Error('Function not implemented.');
          } }        />
        
        <AnimatePresence>
          {showListForSaleModal && selectedItem && (
            // FIX: Removed props that are no longer needed (userId, setShowMessage)
            <ListForSaleModal
              itemInstance={selectedItem.instance}
              itemDefinition={selectedItem.definition}
              instanceId={selectedItem.instanceId}
              onClose={() => setShowListForSaleModal(false)}
              onSuccess={onListingSuccess}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Inventory;

