// src/components/Inventory/UserInventoryDisplay.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, AlertTriangle } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import InventoryItemCard from './InventoryItemCard';
import { ItemDefinition, UserInventoryDisplayProps } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useModal } from '@/components/context/ModalContext';

const UserInventoryDisplay: FC<UserInventoryDisplayProps> = ({
  playerData,
  onListForSale,
}) => {
  const { setShowMessage } = useModal();
  const [itemDefinitions, setItemDefinitions] = useState<Record<string, ItemDefinition>>({});
  const [loading, setLoading] = useState(true);

  // Fetch Item Blueprints on component mount
  useEffect(() => {
    const fetchItemDefinitions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ItemDefinitions"));
        const definitions: Record<string, ItemDefinition> = {};
        querySnapshot.forEach((doc) => {
          definitions[doc.id] = { id: doc.id, ...doc.data() } as ItemDefinition;
        });
        setItemDefinitions(definitions);
      } catch (error) {
        console.error("Error fetching item definitions:", error);
        setShowMessage("Failed to load item data");
      } finally {
        setLoading(false);
      }
    };
    fetchItemDefinitions();
  }, [setShowMessage]);
  
  if (!playerData) {
      return (
        <SwytchCard className="p-10 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-6" />
            <p className="text-xl text-muted-foreground">Loading Player Data...</p>
        </SwytchCard>
      );
  }

  const inventoryItems = playerData?.inventory?.items || {};
  const inventoryEntries = Object.entries(inventoryItems);

  if (loading) {
    return (
      <SwytchCard className="p-10 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-6" />
        <p className="text-xl text-muted-foreground">Fetching Item Blueprints...</p>
      </SwytchCard>
    );
  }

  if (inventoryEntries.length === 0) {
    return (
      <SwytchCard className="p-10 text-center">
        <Package className="w-20 h-20 text-gray-500 mx-auto mb-6" />
        <p className="text-2xl text-gray-400">Your inventory is empty</p>
        <p className="text-gray-500 mt-2">Play games to earn items!</p>
      </SwytchCard>
    );
  }
  
  if (Object.keys(itemDefinitions).length === 0) {
      return (
        <SwytchCard className="p-10 text-center text-rose-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-6" />
            <p className="text-xl">Error: Item blueprints failed to load.</p>
        </SwytchCard>
      );
  }


  return (
    <SwytchCard className="p-6">
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        <AnimatePresence>
          {inventoryEntries.map(([instanceId, instance]) => {
            const definition = itemDefinitions[instance.itemId];
            
            if (!definition) return null; 

            const isEquipped =
              (definition.itemType === 'weapon' && playerData.inventory?.equipped?.weapon === instanceId) ||
              (definition.itemType === 'armor' && playerData.inventory?.equipped?.armor === instanceId);

            return (
              <motion.div
                key={instanceId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -8 }}
              >
                <InventoryItemCard
                  instance={instance}
                  definition={definition}
                  isEquipped={isEquipped}
                  onEquipToggle={() => {}}
                  onListForSale={() => onListForSale(instance, definition, instanceId)}
                  onUseConsumable={() => {}}
                  isListed={instance.isListed || false}
                  instanceId={instanceId}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </SwytchCard>
  );
};

export default UserInventoryDisplay;