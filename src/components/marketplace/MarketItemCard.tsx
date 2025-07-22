// src/components/marketplace/MarketItemCard.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Sword, Eye, DollarSign, ShoppingCart, Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { InventoryItem } from '@/lib/types'; // Import InventoryItem type

interface MarketItemCardProps {
  item: InventoryItem;
  onBuyItem: (item: InventoryItem) => void;
  isOwner: boolean; // True if the current logged-in user owns this item (cannot buy their own)
}

const MarketItemCard: FC<MarketItemCardProps> = ({ item, onBuyItem, isOwner }) => {
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
        {item.isListedForSale && item.listingPriceCrypto && item.listingCurrency ? (
          <p className="text-lg font-bold text-primary flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" /> {item.listingPriceCrypto} {item.listingCurrency}
          </p>
        ) : (
          <p className="text-md text-gray-400 text-center mb-2">Price not available</p>
        )}

        <motion.button
          onClick={() => onBuyItem(item)}
          disabled={isOwner || !item.isListedForSale} // Disable if owner or not listed
          className={`btn-primary flex items-center justify-center gap-2 ${isOwner || !item.isListedForSale ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={isOwner || !item.isListedForSale ? {} : { scale: 1.03 }}
          whileTap={isOwner || !item.isListedForSale ? {} : { scale: 0.97 }}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOwner ? 'Your Item' : !item.isListedForSale ? 'Not For Sale' : 'Buy Now'}
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default MarketItemCard;
