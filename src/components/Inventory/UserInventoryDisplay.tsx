// src/components/inventory/UserInventoryDisplay.tsx
import { FC, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import InventoryItemCard from './InventoryItemCard';
import { InventoryItem, PlayerData, TransactionType, TransactionStatus } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface UserInventoryDisplayProps {
  inventory: Record<string, InventoryItem>;
  onListForSale: (item: InventoryItem) => void;
  userId: string | null;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
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
  playerData,
}) => {
  const itemsArray = Object.values(inventory);

  const handleEquipToggle = useCallback(async (item: InventoryItem) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to equip items.');
      setActiveModal('auth');
      return;
    }
    if (!playerData || !playerData.inventory) {
      setShowMessage('⚠️ Player data or inventory not loaded.');
      return;
    }

    setShowMessage(`Submitting equip request for ${item.name}...`);
    try {
      // Send a request to a Firestore collection for a Cloud Function to handle
      await addDoc(collection(db, 'inventory_requests'), {
        userId,
        itemId: item.id,
        action: 'equipToggle',
        itemType: item.type,
        requestedAt: serverTimestamp(),
        status: 'pending',
      });
      setShowMessage(`✅ Equip request submitted for "${item.name}".`);
    } catch (error) {
      console.error('Failed to submit equip request:', error);
      setShowMessage('⚠️ Failed to submit equip request. Try again.');
    }
  }, [userId, playerData, setShowMessage, setActiveModal]);

  const handleUseConsumable = useCallback(async (item: InventoryItem) => {
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

    setShowMessage(`Submitting use request for ${item.name}...`);
    try {
      // Send a request to a Firestore collection for a Cloud Function to handle
      await addDoc(collection(db, 'inventory_requests'), {
        userId,
        itemId: item.id,
        action: 'useConsumable',
        itemStats: item.stats,
        requestedAt: serverTimestamp(),
        status: 'pending',
      });
      setShowMessage(`✅ Use request submitted for "${item.name}".`);
    } catch (error) {
      console.error('Failed to submit use request:', error);
      setShowMessage('⚠️ Failed to submit use request. Try again.');
    }
  }, [userId, playerData, setShowMessage, setActiveModal]);


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
                  onEquipToggle={handleEquipToggle}
                  onUseConsumable={handleUseConsumable}
                  isEquipped={
                    (item.type === 'armor' && playerData?.inventory?.equipped?.armor === item.id) ||
                    (item.type === 'weapon' && playerData?.inventory?.equipped?.weapon === item.id)
                  }
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