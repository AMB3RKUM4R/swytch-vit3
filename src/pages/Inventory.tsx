import { FC, useMemo, useState } from 'react';
import { usePlayer } from '@/components/context/PlayerContext'; 
import { staticShopItems } from '@/lib/staticShopData'; 
import { GAMES_LIST } from '@/lib/gameData'; // Import your Game Data
import CurrencyHUD from '@/components/CurrencyHUD'; 
import { Package, Shield, Gamepad2, Play } from 'lucide-react'; 
import { cn } from '@/lib/utils'; 
import { useNavigate } from 'react-router-dom';

const InventoryPage: FC = () => {
  const { playerData, userId } = usePlayer();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('ALL');

  // 1. Process Standard Items
  const myItems = useMemo(() => {
    if (!playerData?.inventory?.items) return [];

    return Object.entries(playerData.inventory.items).map(([instanceId, itemData]) => {
      const definition = staticShopItems.find(def => def.id === itemData.itemId);
      return {
        instanceId,
        ...itemData,
        definition, 
      };
    }).filter(item => item.definition); 
  }, [playerData]);

  // 2. Process Games (Treating all unlocked games as "Owned Assets")
  // You can add filtering here if you want to hide games based on level
  const myGames = useMemo(() => {
      return GAMES_LIST; 
  }, []);

  if (!userId) {
    return <div className="pt-32 text-center text-gray-500 font-mono">PLEASE LOGIN TO ACCESS ARMORY</div>;
  }

  // Helper to check if we should show a category
  const showItems = activeFilter === 'ALL' || ['WEAPONS', 'ARMOR', 'CONSUMABLES'].includes(activeFilter);
  const showGames = activeFilter === 'ALL' || activeFilter === 'GAMES';

  // Filter the items list based on selection
  const filteredItems = activeFilter === 'ALL' 
    ? myItems 
    : myItems.filter(i => i.definition?.itemType.toUpperCase().includes(activeFilter.slice(0, -1))); // Simple singular conversion

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
            <h1 className="text-4xl font-russo text-white uppercase flex items-center gap-3">
                <Package className="text-primary w-8 h-8" /> 
                ARMORY
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-1">
                Manage your equipment, digital assets, and game cartridges.
            </p>
        </div>
        
        <CurrencyHUD />
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
         {['ALL', 'GAMES', 'WEAPONS', 'ARMOR', 'CONSUMABLES'].map((filter) => (
             <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={cn(
                 "px-6 py-2 rounded border text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap",
                 activeFilter === filter 
                    ? "bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]" 
                    : "bg-black border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
             )}>
                 {filter}
             </button>
         ))}
      </div>

      <div className="space-y-8">
          
        {/* SECTION: GAMES LIBRARY */}
        {showGames && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeFilter !== 'ALL' && <h2 className="text-white font-bold mb-4 uppercase text-sm tracking-widest border-l-2 border-[#39FF14] pl-3">Game Protocols</h2>}
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {myGames.map((game) => (
                        <div key={game.id} className="bg-black border border-gray-800 p-0 flex flex-col group hover:border-[#39FF14] transition-all relative overflow-hidden">
                            {/* GAME VISUAL */}
                            <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
                                <img 
                                    src={game.imageUrl || `https://placehold.co/400x300/000/39FF14?text=${game.name}`}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                />
                                <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-white/10 backdrop-blur-md">
                                    <span className="text-[9px] text-[#39FF14] font-bold uppercase tracking-wider">LVL {game.level}</span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-[#39FF14] flex items-center justify-center shadow-[0_0_20px_#39FF14]">
                                        <Play className="w-5 h-5 text-black fill-black ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* GAME INFO */}
                            <div className="p-3 bg-black/50 backdrop-blur-sm flex flex-col flex-grow border-t border-gray-800">
                                <h3 className="text-white font-bold text-xs truncate uppercase tracking-wide">{game.name}</h3>
                                <div className="flex justify-between items-center mt-1 mb-3">
                                    <p className="text-gray-500 text-[9px] uppercase">{game.type}</p>
                                    <Gamepad2 className="w-3 h-3 text-gray-600" />
                                </div>
                                
                                <button 
                                    onClick={() => navigate('/')}
                                    className="mt-auto w-full py-2 bg-white/5 hover:bg-[#39FF14] hover:text-black border border-white/10 hover:border-[#39FF14] text-white text-[10px] font-bold transition-all uppercase tracking-widest"
                                >
                                    DEPLOY
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* SECTION: ITEMS INVENTORY */}
        {showItems && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {(activeFilter !== 'ALL' && myItems.length > 0) && <h2 className="text-white font-bold mb-4 uppercase text-sm tracking-widest border-l-2 border-blue-500 pl-3">Equipment</h2>}
                
                {filteredItems.length === 0 && activeFilter !== 'GAMES' && activeFilter !== 'ALL' ? (
                     <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <Shield className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <p className="text-gray-600 font-mono text-sm uppercase">No items in this category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredItems.map((item) => (
                            <div key={item.instanceId} className="bg-black border border-white/10 p-3 rounded-none group hover:border-[#39FF14] transition-all relative">
                                
                                {/* Item Rarity Tag */}
                                <div className={cn(
                                    "absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 border backdrop-blur-md uppercase tracking-wide z-10",
                                    item.definition?.rarity === 'S-Rank' ? "bg-red-900/80 border-red-500 text-red-100" :
                                    item.definition?.rarity === 'A-Rank' ? "bg-purple-900/80 border-purple-500 text-purple-100" :
                                    item.definition?.rarity === 'B-Rank' ? "bg-blue-900/80 border-blue-500 text-blue-100" :
                                    "bg-gray-900/80 border-gray-600 text-gray-300"
                                )}>
                                    {item.definition?.rarity}
                                </div>

                                <div className="aspect-square bg-[#050505] mb-3 border-b border-gray-900 flex items-center justify-center overflow-hidden">
                                    <img 
                                    src={item.definition?.visuals?.iconName || '/placeholder_item.png'} 
                                    className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
                                    alt={item.definition?.itemName}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>

                                <h3 className="text-white font-bold text-xs truncate uppercase tracking-wide">{item.definition?.itemName}</h3>
                                <p className="text-gray-500 text-[9px] uppercase mb-3">{item.definition?.itemType}</p>

                                <button className="w-full py-2 bg-white/5 hover:bg-[#39FF14] hover:text-black border border-white/10 hover:border-[#39FF14] text-gray-300 text-[9px] font-bold transition-all uppercase tracking-widest">
                                    MANAGE
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* EMPTY STATE */}
        {!showGames && filteredItems.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-russo text-lg uppercase">Inventory Empty</p>
                <p className="text-gray-600 text-sm mb-6 font-mono">Visit the market to gear up.</p>
                <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-[#39FF14] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    OPEN MARKET
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default InventoryPage;