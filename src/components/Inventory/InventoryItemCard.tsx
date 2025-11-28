// src/components/Inventory/InventoryItemCard.tsx
import { FC } from 'react';
import { Sword, Shield, Zap, DollarSign, CheckCircle, Package } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { InventoryItem, ItemDefinition } from '@/lib/types';

interface InventoryItemCardProps {
  instance: InventoryItem;
  definition: ItemDefinition;
  isEquipped: boolean;
  onEquipToggle: () => void;
  onListForSale: () => void;
  onUseConsumable: () => void;
  isListed: boolean;
  instanceId: string; 
}

const InventoryItemCard: FC<InventoryItemCardProps> = ({
  definition,
  isEquipped,
  onEquipToggle,
  onListForSale,
  onUseConsumable,
  isListed,
  instanceId,
}) => {
  const rarityColor = {
    'E-Rank': 'border-gray-500',
    'D-Rank': 'border-green-500',
    'C-Rank': 'border-blue-500',
    'B-Rank': 'border-purple-500',
    'A-Rank': 'border-orange-500',
    'S-Rank': 'border-red-500',
  }[definition.rarity] || 'border-gray-500';

  const getTypeIcon = () => {
      switch (definition.itemType) {
          case 'weapon': return <Sword className="w-8 h-8 text-white/50" />;
          case 'armor': return <Shield className="w-8 h-8 text-white/50" />;
          case 'consumable': return <Zap className="w-8 h-8 text-white/50" />;
          default: return <Package className="w-8 h-8 text-white/50" />;
      }
  }

  return (
    // Applied border styling
    <SwytchCard className={`p-4 border-4 ${rarityColor} ${isListed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl w-full h-32 mb-4">
          {getTypeIcon()}
      </div>
      
      {/* Used itemName */}
      <h3 className="font-bold text-lg truncate" title={definition.itemName}>{definition.itemName}</h3>
      <p className="text-sm text-gray-400 mb-4">{definition.rarity}</p>

      {isListed ? (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-center">
          <p className="font-bold text-yellow-400">LISTED FOR SALE</p>
          <p className="text-xs text-yellow-500">{instanceId.slice(0, 6)}...</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {['weapon', 'armor'].includes(definition.itemType) && (
            <button
              onClick={onEquipToggle}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${
                isEquipped 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {isEquipped ? <CheckCircle className="w-5 h-5" /> : getTypeIcon()}
              {isEquipped ? 'Equipped' : 'Equip'}
            </button>
          )}
          
          {definition.itemType === 'consumable' && (
            <button
              onClick={onUseConsumable}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
            >
              <Zap className="w-5 h-5 inline mr-2" /> Use
            </button>
          )}

          <button
            onClick={onListForSale}
            disabled={isEquipped}
            // Used gradient style for List button
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-bold disabled:opacity-50"
          >
            <DollarSign className="w-5 h-5 inline mr-2" /> List for Sale
          </button>
        </div>
      )}
    </SwytchCard>
  );
};

export default InventoryItemCard;