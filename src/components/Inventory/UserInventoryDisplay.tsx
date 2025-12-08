import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
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
        setShowMessage("FAILED TO LOAD BLUEPRINTS");
      } finally {
        setLoading(false);
      }
    };
    fetchItemDefinitions();
  }, [setShowMessage]);
  
  if (!playerData) {
      return (
        <div className="bg-black border border-white/10 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm font-mono text-white/50 uppercase">Syncing Player Data...</p>
        </div>
      );
  }

  const inventoryItems = playerData?.inventory?.items || {};
  const inventoryEntries = Object.entries(inventoryItems);

  if (loading) {
    return (
      <div className="bg-black border border-white/10 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm font-mono text-white/50 uppercase">Loading Assets...</p>
      </div>
    );
  }

  if (inventoryEntries.length === 0) {
    return (
      <div className="bg-black border border-white/10 p-12 text-center">
        <Package className="w-16 h-16 text-white/10 mx-auto mb-6" />
        <p className="text-lg font-russo text-white uppercase mb-2">Empty Storage</p>
        <p className="text-xs font-mono text-gray-500">ACQUIRE ASSETS FROM THE BLACK MARKET</p>
      </div>
    );
  }
  
  if (Object.keys(itemDefinitions).length === 0) {
      return (
        <div className="bg-black border border-red-500/30 p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm font-mono text-red-400">DATABASE CONNECTION ERROR</p>
            <button onClick={() => window.location.reload()} className="mt-4 btn-secondary text-xs">
                <RefreshCw className="w-3 h-3 mr-2" /> RETRY
            </button>
        </div>
      );
  }

  return (
    <div className="bg-black border border-white/10 p-6">
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <InventoryItemCard
                  instance={instance}
                  definition={definition}
                  isEquipped={isEquipped}
                  onEquipToggle={() => {}} // Hook up actual logic if needed
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
    </div>
  );
};

export default UserInventoryDisplay;