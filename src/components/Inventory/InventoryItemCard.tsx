import { FC } from 'react';
import { Sword, Shield, Zap, DollarSign, CheckCircle, Package, Tag } from 'lucide-react';
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
  isListed, // Kept to satisfy interface, even if unused in render
}) => {
  // FIX: Use a record with string keys to avoid specific key errors
  const rarityBorder: Record<string, string> = {
    'E-Rank': 'border-gray-800',
    'D-Rank': 'border-green-800',
    'C-Rank': 'border-blue-800',
    'B-Rank': 'border-purple-800',
    'A-Rank': 'border-orange-800',
    'S-Rank': 'border-red-800',
    'Common': 'border-gray-800',
    'Rare': 'border-blue-800',
    'Legendary': 'border-red-800',
    'System_Admin': 'border-red-500'
  };

  const borderClass = rarityBorder[definition.rarity as string] || 'border-gray-800';

  // FIX: Cast itemType to string for switch case safety
  const getTypeIcon = () => {
      const type = definition.itemType as string;
      switch (type) {
          case 'weapon': return <Sword className="w-8 h-8 text-gray-700" />;
          case 'armor': return <Shield className="w-8 h-8 text-gray-700" />;
          case 'consumable': return <Zap className="w-8 h-8 text-gray-700" />;
          default: return <Package className="w-8 h-8 text-gray-700" />;
      }
  }

  const getImagePath = () => {
      if(definition.visuals?.iconName) return definition.visuals.iconName; 
      // Safe fallback logic
      const type = definition.itemType as string;
      const typeFolder = type === 'weapon' ? 'weapons' : type === 'armor' ? 'armor' : 'items';
      return `/items/${typeFolder}/${definition.id}.jpg`; 
  };

  // Helper to check type safely
  const isType = (types: string[]) => types.includes(definition.itemType as string);

  return (
    <div className={`bg-black border p-0 flex flex-col h-full relative group hover:border-[#39FF14] transition-colors font-mono ${borderClass} ${isListed ? 'opacity-60' : ''}`}>
      
      {/* 1. VISUAL MEDIA */}
      <div className="relative w-full aspect-square bg-[#050505] border-b border-gray-900 flex items-center justify-center overflow-hidden">
          <img 
            src={getImagePath()}
            alt={definition.itemName}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity z-10 relative"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 flex items-center justify-center z-0">
             {getTypeIcon()}
          </div>
          
          {/* Rarity Tag */}
          <div className="absolute top-2 left-2 z-20 bg-black/80 px-2 py-0.5 border border-white/10">
              <span className="text-[9px] text-white font-bold uppercase">{definition.rarity}</span>
          </div>
      </div>
      
      {/* 2. INFO & ACTIONS */}
      <div className="p-3 flex flex-col flex-grow">
          <div className="flex-grow mb-4">
              <h3 className="font-bold text-xs text-white truncate uppercase tracking-wide" title={definition.itemName}>
                  {definition.itemName}
              </h3>
              <p className="text-[9px] text-gray-500 uppercase">
                  {definition.itemType}
              </p>
          </div>

          {isListed ? (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 border border-yellow-500">
              <Tag className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="font-bold text-yellow-500 text-xs uppercase tracking-widest">LISTED</p>
              <p className="text-[9px] text-yellow-600 mt-1">ON MARKET</p>
            </div>
          ) : (
            <div className="space-y-2 mt-auto">
              {isType(['weapon', 'armor']) && (
                <button
                  onClick={onEquipToggle}
                  className={`w-full py-2 text-[9px] font-bold uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${
                    isEquipped 
                      ? 'bg-[#39FF14] text-black border-[#39FF14]' 
                      : 'bg-black text-gray-400 border-gray-800 hover:border-[#39FF14] hover:text-[#39FF14]'
                  }`}
                >
                  {isEquipped ? <CheckCircle className="w-3 h-3" /> : null}
                  {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                </button>
              )}
              
              {isType(['consumable']) && (
                <button
                  onClick={onUseConsumable}
                  className="w-full py-2 text-[9px] font-bold uppercase tracking-widest bg-purple-900/20 border border-purple-900 text-purple-400 hover:bg-purple-900 hover:text-white transition-colors"
                >
                  CONSUME
                </button>
              )}

              <button
                onClick={onListForSale}
                disabled={isEquipped}
                className="w-full py-2 text-[9px] font-bold uppercase tracking-widest bg-black border border-gray-800 text-gray-500 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-3 h-3" /> SELL
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default InventoryItemCard;