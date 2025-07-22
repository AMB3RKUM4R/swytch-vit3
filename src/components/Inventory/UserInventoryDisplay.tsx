// src/components/inventory/UserInventoryDisplay.tsx
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react'; // Added missing icons
import SwytchCard from '../SwytchCard';
import InventoryItemCard from './InventoryItemCard'; // Import the individual item card
import { InventoryItem, PlayerData } from '@/lib/types'; // Import InventoryItem and PlayerData types

interface UserInventoryDisplayProps {
  inventory: Record<string, InventoryItem>;
  onListForSale: (item: InventoryItem) => void;
  userId: string | null;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  // Pass current playerData to access energy/mana for consumable updates
  playerData: PlayerData | null;
}

const itemGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const UserInventoryDisplay: FC<UserInventoryDisplayProps> = ({
  inventory,
  onListForSale,
  userId,
  updatePlayerFirestore,
  setShowMessage,
  setActiveModal,
  playerData, // Destructure playerData
}) => {
  const itemsArray = Object.values(inventory);

  const handleEquipToggle = async (item: InventoryItem) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to equip items.');
      setActiveModal('auth');
      return;
    }
    if (!playerData || !playerData.inventory) {
        setShowMessage('⚠️ Player data or inventory not loaded.');
        return;
    }

    setShowMessage(`Attempting to toggle equip status for ${item.name}...`);
    try {
      // Access current equipped items from playerData.inventory
      const currentEquipped = playerData.inventory.equipped || { armor: '', weapon: '' };

      let updatedEquipped = { ...currentEquipped };
      if (item.type === 'armor') {
        updatedEquipped.armor = currentEquipped.armor === item.id ? '' : item.id; // Toggle equipped armor
      } else if (item.type === 'weapon') {
        updatedEquipped.weapon = currentEquipped.weapon === item.id ? '' : item.id; // Toggle equipped weapon
      } else {
        setShowMessage(`ℹ️ Only armor and weapon types can be equipped.`);
        return;
      }

      // Construct the update object for Firestore
      const updates: Partial<PlayerData> = {
        inventory: {
          ...playerData.inventory, // Preserve other inventory properties
          equipped: updatedEquipped,
        },
      };

      await updatePlayerFirestore(updates);
      setShowMessage(`✅ ${item.name} ${updatedEquipped.armor === item.id || updatedEquipped.weapon === item.id ? 'unequipped' : 'equipped'}!`);
    } catch (error) {
      console.error('Failed to toggle equip status:', error);
      setShowMessage('⚠️ Failed to update equip status. Try again.');
    }
  };

  const handleUseConsumable = async (item: InventoryItem) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to use items.');
      setActiveModal('auth');
      return;
    }
    if (item.type !== 'consumable') {
      setShowMessage('⚠️ This item is not a consumable.');
      return;
    }
    if (!playerData || !playerData.inventory) {
        setShowMessage('⚠️ Player data or inventory not loaded.');
        return;
    }

    setShowMessage(`Using ${item.name}...`);
    try {
      // Logic to remove the consumable from inventory and apply its effect
      const updatedItems = { ...playerData.inventory.items }; // Use playerData's items
      delete updatedItems[item.id]; // Remove the item

      let updates: Partial<PlayerData> = {
        inventory: {
          ...playerData.inventory, // Preserve equipped and other inventory properties
          items: updatedItems,
        },
      };

      // Apply effects, e.g., increase energy/mana/XP based on item.stats
      if (item.stats?.energyBoost) {
        updates.energy = (playerData.energy || 0) + item.stats.energyBoost;
        setShowMessage(`⚡️ Energy increased by ${item.stats.energyBoost}!`);
      }
      if (item.stats?.manaBoost) {
        updates.mana = (playerData.mana || 0) + item.stats.manaBoost;
        setShowMessage(`✨ Mana increased by ${item.stats.manaBoost}!`);
      }
      // Add other stat updates as needed

      await updatePlayerFirestore(updates);
      setShowMessage(`✅ ${item.name} used successfully!`);
    } catch (error) {
      console.error('Failed to use consumable:', error);
      setShowMessage('⚠️ Failed to use item. Try again.');
    }
  };


  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      {itemsArray.length === 0 ? (
        <div className="text-center py-10">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-inter">Your inventory is empty.</p>
          <p className="text-gray-500 text-sm mt-2">Play games or visit the shop to get new items!</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={itemGridVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {itemsArray.map((item) => (
              <motion.div key={item.id} variants={itemCardVariants} exit="hidden">
                <InventoryItemCard
                  item={item}
                  onListForSale={onListForSale}
                  onEquipToggle={handleEquipToggle} // Pass the handler
                  onUseConsumable={handleUseConsumable} // Pass the handler
                  isEquipped={
                    (item.type === 'armor' && playerData?.inventory?.equipped?.armor === item.id) ||
                    (item.type === 'weapon' && playerData?.inventory?.equipped?.weapon === item.id)
                  } // Determine equipped status
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </SwytchCard>
  );
};

export default UserInventoryDisplay;
