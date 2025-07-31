// src/components/inventory/InventoryItemCard.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap, Shield, Sword, Eye, DollarSign, CheckCircle, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { InventoryItem } from '@/lib/types'; // Import InventoryItem type

interface InventoryItemCardProps {
  item: InventoryItem;
  onListForSale: (item: InventoryItem) => void;
  onEquipToggle: (item: InventoryItem) => void; // For equip/unequip actions
  onUseConsumable: (item: InventoryItem) => void; // For using consumables
  isEquipped: boolean; // Indicates if the item is currently equipped
}

const InventoryItemCard: FC<InventoryItemCardProps> = ({
  item,
  onListForSale,
  onEquipToggle,
  onUseConsumable,
  isEquipped,
}) => {
  const isActionable = !item.isListedForSale; // Cannot equip/use if listed for sale

  const getRarityColor = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-4 flex flex-col h-full">
      <div className="relative w-full h-40 bg-gray-700 rounded-md overflow-hidden mb-4 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => e.currentTarget.src = `https://placehold.co/160x160/FF0000/FFFFFF?text=Item+Image`} // Fallback
          />
        ) : (
          <Eye className="w-16 h-16 text-gray-500" />
        )}
        {item.isListedForSale && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            LISTED
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-white font-poppins mb-1">{item.name}</h3>
      <p className={`text-sm font-semibold ${getRarityColor(item.rarity)} mb-2`}>
        {item.rarity.toUpperCase()} {item.type.toUpperCase()}
      </p>
      <p className="text-sm text-gray-300 flex-grow mb-3">{item.description}</p>

      {item.stats && (
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-200 mb-4">
          {item.stats.attack && (
            <div className="flex items-center gap-1">
              <Sword className="w-4 h-4 text-red-400" /> Attack: {item.stats.attack}
            </div>
          )}
          {item.stats.defense && (
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-blue-400" /> Defense: {item.stats.defense}
            </div>
          )}
          {item.stats.energyBoost && (
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" /> Energy: {item.stats.energyBoost}
            </div>
          )}
          {item.stats.manaBoost && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" /> Mana: {item.stats.manaBoost}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        {item.isListedForSale ? (
          <button
            className="btn-secondary opacity-70 cursor-not-allowed"
            disabled
          >
            <DollarSign className="w-4 h-4 mr-2" /> Listed for {item.listingPriceCrypto} {item.listingCurrency}
          </button>
        ) : (
          <>
            {(item.type === 'armor' || item.type === 'weapon') && (
              <motion.button
                onClick={() => onEquipToggle(item)}
                className={`btn-secondary flex items-center justify-center gap-2 ${isEquipped ? 'bg-green-600 hover:bg-green-700' : ''}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!isActionable}
              >
                {isEquipped ? <CheckCircle className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                {isEquipped ? 'Equipped' : 'Equip'}
              </motion.button>
            )}
            {item.type === 'consumable' && (
              <motion.button
                onClick={() => onUseConsumable(item)}
                className="btn-primary flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!isActionable}
              >
                <Zap className="w-4 h-4" /> Use Item
              </motion.button>
            )}
            <motion.button
              onClick={() => onListForSale(item)}
              className="btn-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!isActionable}
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