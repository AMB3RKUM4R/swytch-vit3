import { FC } from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap, Shield, Sword, Eye, DollarSign, CheckCircle, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { InventoryItem, ItemDefinition } from '@/lib/types'; // Import both types

// UPDATED: The component now receives the full blueprint AND the player's specific instance.
interface InventoryItemCardProps {
  instance: InventoryItem;
  definition: ItemDefinition;
  onListForSale: (instance: InventoryItem, definition: ItemDefinition) => void;
  onEquipToggle: (instance: InventoryItem, definition: ItemDefinition) => void;
  onUseConsumable: (instance: InventoryItem, definition: ItemDefinition) => void;
  isEquipped: boolean;
  isListed: boolean; // A simple boolean to indicate if it's for sale
  listingPrice?: string; // Optional price to display if listed
}

const InventoryItemCard: FC<InventoryItemCardProps> = ({
  instance,
  definition,
  onListForSale,
  onEquipToggle,
  onUseConsumable,
  isEquipped,
  isListed,
  listingPrice,
}) => {
  // Actions are disabled if the item is listed for sale.
  const isActionable = !isListed;

  const getRarityColor = (rarity: ItemDefinition['rarity']) => {
    switch (rarity) {
      case 'E-Rank': return 'text-gray-400';
      case 'D-Rank': return 'text-green-400';
      case 'C-Rank': return 'text-cyan-400';
      case 'B-Rank': return 'text-blue-400';
      case 'A-Rank': return 'text-purple-400';
      case 'S-Rank': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // Extract visual information from the blueprint. Default to an icon if no image URL is present.
  const imageUrl = definition.visuals?.iconName; // We'll use iconName as the source for now.

  return (
    <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-4 flex flex-col h-full">
      <div className="relative w-full h-40 bg-gray-700 rounded-md overflow-hidden mb-4 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl} // TODO: You will need a way to map iconName to an actual URL path
            alt={definition.itemName}
            className="w-full h-full object-contain p-4" // Use 'contain' for icons
            onError={(e) => e.currentTarget.src = `https://placehold.co/160x160/1a202c/FFFFFF?text=${definition.itemName}`}
          />
        ) : (
          <Eye className="w-16 h-16 text-gray-500" />
        )}
        {isListed && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            LISTED
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-white font-poppins mb-1">{definition.itemName}</h3>
      <p className={`text-sm font-semibold ${getRarityColor(definition.rarity)} mb-2`}>
        {definition.rarity.toUpperCase()} {definition.itemType.toUpperCase()}
      </p>
      <p className="text-sm text-gray-300 flex-grow mb-3">{definition.description}</p>

      {/* Stats are now read from the definition blueprint */}
      {definition.stats && (
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-200 mb-4">
          {Object.entries(definition.stats).map(([statName, statValue]) => (
            <div key={statName} className="flex items-center gap-1 capitalize">
              {statName === 'attack' && <Sword className="w-4 h-4 text-red-400" />}
              {statName === 'defense' && <Shield className="w-4 h-4 text-blue-400" />}
              {statName === 'energy' && <Zap className="w-4 h-4 text-yellow-400" />}
              {statName === 'mana' && <Sparkles className="w-4 h-4 text-purple-400" />}
              {statName}: {statValue}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        {isListed ? (
          <button
            className="btn-secondary opacity-70 cursor-not-allowed"
            disabled
          >
            <DollarSign className="w-4 h-4 mr-2" /> Listed for {listingPrice}
          </button>
        ) : (
          <>
            {(definition.itemType === 'armor' || definition.itemType === 'weapon' || definition.itemType === 'character_skin') && (
              <motion.button
                onClick={() => onEquipToggle(instance, definition)}
                className={`btn-secondary flex items-center justify-center gap-2 ${isEquipped ? 'bg-green-600 hover:bg-green-700' : ''}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!isActionable}
              >
                {isEquipped ? <CheckCircle className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                {isEquipped ? 'Equipped' : 'Equip'}
              </motion.button>
            )}
            {definition.itemType === 'consumable' && (
              <motion.button
                onClick={() => onUseConsumable(instance, definition)}
                className="btn-primary flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!isActionable}
              >
                <Zap className="w-4 h-4" /> Use Item
              </motion.button>
            )}
            <motion.button
              onClick={() => onListForSale(instance, definition)}
              className="btn-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!isActionable || isEquipped} // Cannot list if equipped
            >
              <DollarSign className="w-4 h-4" /> List for Sale
            </motion.button>
          </>
        )}
      </div>
    </SwytchCard>
  );
};

export default InventoryItemCard;
