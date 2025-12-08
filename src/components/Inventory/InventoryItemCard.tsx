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
  isListed,
  instanceId,
}) => {
  const rarityBorder = {
    'E-Rank': 'border-gray-600',
    'D-Rank': 'border-green-600',
    'C-Rank': 'border-blue-500',
    'B-Rank': 'border-purple-500',
    'A-Rank': 'border-orange-500',
    'S-Rank': 'border-red-600',
  }[definition.rarity] || 'border-gray-600';

  const getTypeIcon = () => {
      switch (definition.itemType) {
          case 'weapon': return <Sword className="w-6 h-6 text-white" />;
          case 'armor': return <Shield className="w-6 h-6 text-white" />;
          case 'consumable': return <Zap className="w-6 h-6 text-white" />;
          default: return <Package className="w-6 h-6 text-white" />;
      }
  }

  return (
    <div className={`bg-black border p-3 flex flex-col h-full relative group hover:border-white/50 transition-colors ${rarityBorder} ${isListed ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Icon Area */}
      <div className="bg-white/5 border border-white/10 w-full aspect-square flex items-center justify-center mb-3">
          {definition.visuals?.iconName ? (
              <img src={definition.visuals.iconName} alt={definition.itemName} className="w-3/4 h-3/4 object-contain" />
          ) : (
              getTypeIcon()
          )}
      </div>
      
      {/* Info */}
      <div className="flex-grow">
          <h3 className="font-bold text-sm text-white truncate uppercase" title={definition.itemName}>{definition.itemName}</h3>
          <p className="text-[10px] text-gray-500 font-mono uppercase mb-2">{definition.rarity} // {definition.itemType}</p>
      </div>

      {/* Status Overlay */}
      {isListed ? (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center border-2 border-yellow-500">
          <Tag className="w-6 h-6 text-yellow-500 mb-1" />
          <p className="font-bold text-yellow-500 text-xs uppercase tracking-widest">ON MARKET</p>
          <p className="text-[10px] text-yellow-600 font-mono mt-1">{instanceId.slice(0, 6)}</p>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {/* Equip Button */}
          {['weapon', 'armor'].includes(definition.itemType) && (
            <button
              onClick={onEquipToggle}
              className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                isEquipped 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-transparent text-white border-white/20 hover:bg-white/10'
              }`}
            >
              {isEquipped ? <CheckCircle className="w-3 h-3" /> : null}
              {isEquipped ? 'EQUIPPED' : 'EQUIP'}
            </button>
          )}
          
          {/* Use Button */}
          {definition.itemType === 'consumable' && (
            <button
              onClick={onUseConsumable}
              className="w-full py-2 text-[10px] font-bold uppercase bg-purple-900/50 border border-purple-500 text-purple-400 hover:bg-purple-900 hover:text-white transition-colors"
            >
              CONSUME
            </button>
          )}

          {/* List Button */}
          <button
            onClick={onListForSale}
            disabled={isEquipped}
            className="w-full py-2 text-[10px] font-bold uppercase bg-transparent border border-white/10 text-gray-400 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-1 disabled:opacity-30"
          >
            <DollarSign className="w-3 h-3" /> SELL
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryItemCard;