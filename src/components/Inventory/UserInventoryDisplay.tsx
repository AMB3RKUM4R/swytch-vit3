import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import InventoryItemCard from './InventoryItemCard';
// UPDATED: All necessary types are imported
import { InventoryItem, ItemDefinition, PlayerData } from '@/lib/types';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// UPDATED: Props now require the master list of item blueprints
interface UserInventoryDisplayProps {
  playerData: PlayerData | null;
  userId: string | null;
  onListForSale: (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => void;
  setShowMessage: (message: string) => void;
}

const itemGridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const UserInventoryDisplay: FC<UserInventoryDisplayProps> = ({
  playerData,
  userId,
  onListForSale,
  setShowMessage,
}) => {
  // We need to fetch and store the master item blueprints
  const [itemDefinitions, setItemDefinitions] = useState<Record<string, ItemDefinition>>({});
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchItemDefinitions();
  }, []);

  const handleEquipToggle = async (_instance: InventoryItem, definition: ItemDefinition, instanceId: string) => {
    if (!userId || !playerData?.inventory) return;

    const currentEquipped = playerData.inventory.equipped;
    const isEquipped =
      (definition.itemType === 'weapon' && currentEquipped?.weapon === instanceId) ||
      (definition.itemType === 'armor' && currentEquipped?.armor === instanceId);

    const newEquipped = { ...currentEquipped };
    
    if (isEquipped) { // Unequip
      if (definition.itemType === 'weapon') newEquipped.weapon = null;
      if (definition.itemType === 'armor') newEquipped.armor = null;
    } else { // Equip
      if (definition.itemType === 'weapon') newEquipped.weapon = instanceId;
      if (definition.itemType === 'armor') newEquipped.armor = instanceId;
    }

    try {
      const playerDocRef = doc(db, 'Players', userId);
      await updateDoc(playerDocRef, {
        'inventory.equipped': newEquipped
      });
      setShowMessage(`✅ ${definition.itemName} ${isEquipped ? 'unequipped' : 'equipped'}.`);
    } catch (error) {
      console.error("Failed to equip item:", error);
      setShowMessage("⚠️ Failed to update equipment.");
    }
  };


  const inventoryItems = playerData?.inventory?.items ?? {};
  const inventoryEntries = Object.entries(inventoryItems);

  if (loading) return <div>Loading inventory...</div>;

  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      {inventoryEntries.length === 0 ? (
        <div className="text-center py-10">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-inter">Your inventory is empty.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={itemGridVariants} initial="hidden" animate="visible"
        >
          <AnimatePresence>
            {inventoryEntries.map(([instanceId, instance]) => {
              // Find the master blueprint for this item instance
              const definition = itemDefinitions[instance.itemId];
              // If we haven't loaded the blueprint yet, don't render the card
              if (!definition) return null;

              const isEquipped =
                (definition.itemType === 'weapon' && playerData?.inventory?.equipped?.weapon === instanceId) ||
                (definition.itemType === 'armor' && playerData?.inventory?.equipped?.armor === instanceId);

              return (
                <motion.div key={instanceId} variants={itemCardVariants} exit="hidden">
                  <InventoryItemCard
                    instance={instance}
                    definition={definition}
                    isEquipped={isEquipped}
                    onEquipToggle={() => handleEquipToggle(instance, definition, instanceId)}
                    onListForSale={() => onListForSale(instance, definition, instanceId)}
                    onUseConsumable={() => { /* TODO: Implement use consumable logic */ }}
                    isListed={instance.isListed || false} // Pass the listed status
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </SwytchCard>
  );
};

export default UserInventoryDisplay;
