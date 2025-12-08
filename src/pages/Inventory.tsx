import { FC, useMemo } from 'react';
import { usePlayer } from '@/components/context/PlayerContext'; //
import { staticShopItems } from '@/lib/staticShopData'; //
import CurrencyHUD from '@/components/CurrencyHUD'; //
import { Package, Shield, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils'; //

const InventoryPage: FC = () => {
  const { playerData, userId } = usePlayer();

  // 1. Merge User Inventory with Item Definitions
  const myItems = useMemo(() => {
    if (!playerData?.inventory?.items) return [];

    return Object.entries(playerData.inventory.items).map(([instanceId, itemData]) => {
      // Find the static definition (stats, image, name) for this item ID
      const definition = staticShopItems.find(def => def.id === itemData.itemId);
      return {
        instanceId,
        ...itemData,
        definition, // Attach definition for display
      };
    }).filter(item => item.definition); // Remove glitched items with no definition
  }, [playerData]);

  if (!userId) {
    return <div className="pt-32 text-center text-gray-500 font-mono">PLEASE LOGIN TO ACCESS ARMORY</div>;
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 max-w-7xl mx-auto">
      
      {/* --- HEADER WITH HUD --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
            <h1 className="text-4xl font-russo text-white uppercase flex items-center gap-3">
                <Package className="text-primary w-8 h-8" /> 
                ARMORY
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-1">
                Manage your equipment and assets.
            </p>
        </div>
        
        {/* THE HUD: Placed here so players check balance while gearing up */}
        <CurrencyHUD />
      </div>

      {/* --- FILTERS & STATS (Placeholder) --- */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
         {['ALL', 'WEAPONS', 'ARMOR', 'CONSUMABLES'].map((filter, i) => (
             <button key={filter} className={cn(
                 "px-4 py-2 rounded border text-xs font-bold transition-all",
                 i === 0 ? "bg-primary/20 border-primary text-primary" : "border-white/10 text-gray-500 hover:border-white/30"
             )}>
                 {filter}
             </button>
         ))}
      </div>

      {/* --- INVENTORY GRID --- */}
      {myItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-russo text-lg uppercase">Inventory Empty</p>
            <p className="text-gray-600 text-sm mb-6">Visit the market to gear up.</p>
            <a href="/shop" className="btn-primary inline-flex px-6 py-2">OPEN MARKET</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {myItems.map((item) => (
                <div key={item.instanceId} className="bg-black border border-white/10 p-3 rounded-lg group hover:border-primary/50 transition-all relative">
                    
                    {/* Rarity Badge */}
                    <div className={cn(
                        "absolute top-2 left-2 text-[10px] font-bold px-1.5 rounded bg-gray-800 text-white",
                        item.definition?.rarity === 'S-Rank' && "bg-yellow-500 text-black",
                        item.definition?.rarity === 'A-Rank' && "bg-purple-500 text-white",
                        item.definition?.rarity === 'B-Rank' && "bg-blue-500 text-white",
                    )}>
                        {item.definition?.rarity}
                    </div>

                    {/* Image Area */}
                    <div className="aspect-square bg-white/5 mb-3 rounded flex items-center justify-center overflow-hidden">
                        {/* Placeholder image logic since we don't have real assets loaded in this context */}
                        <img 
                           src={item.definition?.visuals?.iconName || '/placeholder_item.png'} 
                           className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform"
                           alt={item.definition?.itemName}
                        />
                    </div>

                    {/* Info */}
                    <h3 className="text-white font-bold text-sm truncate">{item.definition?.itemName}</h3>
                    <p className="text-gray-500 text-[10px] uppercase mb-3">{item.definition?.itemType}</p>

                    {/* Action */}
                    <button className="w-full py-1.5 bg-white/5 hover:bg-primary hover:text-black text-gray-400 text-xs font-bold transition-colors rounded">
                        EQUIP
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;