import { FC } from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap, Shield, Sword, Eye, DollarSign, CheckCircle, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { InventoryItem, ItemDefinition } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
  instance: InventoryItem;
  definition: ItemDefinition;
  onListForSale: (instance: InventoryItem, definition: ItemDefinition) => void;
  onEquipToggle: (instance: InventoryItem, definition: ItemDefinition) => void;
  onUseConsumable: (instance: InventoryItem, definition: ItemDefinition) => void;
  isEquipped: boolean;
  isListed: boolean;
  listingPrice?: string;
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
  const isActionable = !isListed;

  const getRarityClasses = (rarity: ItemDefinition['rarity']) => {
    switch (rarity) {
      case 'E-Rank': return 'text-gray-400 border-gray-600';
      case 'D-Rank': return 'text-green-400 border-green-600';
      case 'C-Rank': return 'text-blue-400 border-blue-600';
      case 'B-Rank': return 'text-purple-400 border-purple-600';
      case 'A-Rank': return 'text-orange-400 border-orange-600';
      case 'S-Rank': return 'text-red-500 border-red-500 shadow-lg shadow-red-500/30';
      default: return 'text-gray-400 border-gray-600';
    }
  };
  
  const rarityClasses = getRarityClasses(definition.rarity);
  const imageUrl = definition.visuals?.iconName; // We'll use iconName as the source for now.

  return (
    <SwytchCard 
      variant="default" 
      className={cn("p-4 flex flex-col h-full border", rarityClasses)}
    >
      {/* Image/Icon */}
      <div className="relative w-full h-40 bg-black/30 rounded-md overflow-hidden mb-4 flex items-center justify-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={definition.itemName}
            className="w-full h-full object-contain"
            onError={(e) => e.currentTarget.src = `https://placehold.co/160x160/1a202c/FFFFFF?text=${definition.itemName}`}
          />
        ) : (
          <Eye className="w-16 h-16 text-muted-foreground" />
        )}
        {isListed && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full font-inter">
            LISTED
          </div>
        )}
        {isEquipped && (
           <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full font-inter">
            EQUIPPED
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-xl font-bold text-foreground font-poppins mb-1 truncate">{definition.itemName}</h3>
      <p className={cn("text-sm font-semibold mb-2", rarityClasses.split(' ')[0])}>
        {definition.rarity.toUpperCase()} {definition.itemType.toUpperCase()}
      </p>
      <p className="text-sm text-muted-foreground flex-grow mb-3">{definition.description}</p>

      {/* Stats */}
      {definition.stats && (
        <div className="grid grid-cols-2 gap-2 text-sm text-foreground mb-4">
          {Object.entries(definition.stats).map(([statName, statValue]) => (
            <div key={statName} className="flex items-center gap-1.5 capitalize font-inter">
              {statName === 'attack' && <Sword className="w-4 h-4 text-red-400" />}
              {statName === 'defense' && <Shield className="w-4 h-4 text-blue-400" />}
              {statName === 'energy' && <Zap className="w-4 h-4 text-yellow-400" />}
              {statName === 'mana' && <Sparkles className="w-4 h-4 text-purple-400" />}
              <span>{statName}:</span>
              <span className="font-bold">{statValue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        {isListed ? (
          <button
            className="btn-secondary opacity-70 cursor-not-allowed"
            disabled
          >
            <DollarSign className="w-4 h-4 mr-2" /> Listed {listingPrice ? `for ${listingPrice}` : ''}
          </button>
        ) : (
          <>
            {(definition.itemType === 'armor' || definition.itemType === 'weapon' || definition.itemType === 'character_skin') && (
              <motion.button
                onClick={() => onEquipToggle(instance, definition)}
                className={cn(
                  "btn-secondary flex items-center justify-center gap-2",
                  isEquipped && 'bg-green-600/20 text-green-400 border-green-600 hover:bg-green-600/30'
                )}
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
