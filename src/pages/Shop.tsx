import { FC, useState, useMemo } from 'react';
import { ShoppingBag, Search, ShieldAlert } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import GameTile from '@/components/GameTile';

const shopInventory = [
  // WEAPONS
  { id: "d-rank-pickaxe", name: "D-Rank Pickaxe", rarity: "D-Rank", type: "WEAPON", price: 500, imageUrl: "/items/weapons/pickaxe_d.jpg" },
  { id: "plasma-rifle", name: "Plasma Rifle", rarity: "B-Rank", type: "WEAPON", price: 2500, imageUrl: "/items/weapons/plasma_rifle.jpg" },
  { id: "gravity-hammer", name: "Gravity Hammer", rarity: "C-Rank", type: "WEAPON", price: 1200, imageUrl: "/items/weapons/gravity_hammer.jpg" },
  { id: "void-blade", name: "Void Blade", rarity: "A-Rank", type: "WEAPON", price: 8000, imageUrl: "/items/weapons/void_blade.jpg" },
  { id: "neural-whip", name: "Neural Whip", rarity: "B-Rank", type: "WEAPON", price: 3000, imageUrl: "/items/weapons/neural_whip.jpg" },
  { id: "quantum-bow", name: "Quantum Bow", rarity: "S-Rank", type: "WEAPON", price: 15000, imageUrl: "/items/weapons/quantum_bow.jpg" },

  // ARMOR
  { id: "s-rank-shield", name: "S-Rank Kinetic Shield", rarity: "S-Rank", type: "ARMOR", price: 10000, imageUrl: "/items/armor/shield_s.jpg" },
  { id: "stealth-cloak", name: "Stealth Cloak", rarity: "A-Rank", type: "ARMOR", price: 4000, imageUrl: "/items/armor/stealth_cloak.jpg" },
  { id: "nano-suit", name: "Nano-Weave Suit", rarity: "B-Rank", type: "ARMOR", price: 3000, imageUrl: "/items/armor/nano_suit.jpg" },
  { id: "heavy-plate", name: "Titanium Plate", rarity: "C-Rank", type: "ARMOR", price: 1500, imageUrl: "/items/armor/heavy_plate.jpg" },

  // CONSUMABLES
  { id: "core-booster", name: "Core Energy Booster", rarity: "B-Rank", type: "CONSUMABLE", price: 800, imageUrl: "/items/consumables/core_booster.jpg" },
  { id: "health-injector", name: "Health Injector", rarity: "D-Rank", type: "CONSUMABLE", price: 100, imageUrl: "/items/consumables/health_injector.jpg" },
  { id: "xp-tome", name: "Tome of Knowledge", rarity: "A-Rank", type: "CONSUMABLE", price: 5000, imageUrl: "/items/consumables/xp_tome.jpg" },
  
  // ARTIFACTS
  { id: "void-badge", name: "Badge of the Void", rarity: "A-Rank", type: "ARTIFACT", price: 5000, imageUrl: "/items/artifacts/void_badge.jpg" },
  { id: "data-key", name: "Encrypted Data Key", rarity: "S-Rank", type: "ARTIFACT", price: 12000, imageUrl: "/items/artifacts/data_key.jpg" },
];

const Shop: FC = () => {
  const { setActiveModal, setShowMessage } = useModal();
  const { userId, joulesBalance } = usePlayer();
  const [filter, setFilter] = useState<'ALL' | 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'ARTIFACT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return shopInventory.filter(item => {
      const matchesType = filter === 'ALL' || item.type === filter;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filter, searchQuery]);

  const handlePurchase = (itemId: string) => {
    const item = shopInventory.find(i => i.id === itemId);
    if(!userId) { setShowMessage("⚠️ ACCESS DENIED: LOGIN REQUIRED"); setActiveModal('auth'); return; }
    if (item && item.price > joulesBalance) { setShowMessage("❌ INSUFFICIENT FUNDS"); return; }
    setShowMessage(`🛒 INITIATING TRANSACTION: ${item?.name || 'ASSET'}...`);
    setActiveModal('payment'); 
  };

  return (
    <div className="w-full min-h-screen bg-black pb-24 text-white font-inter">
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/10 p-6 pb-4">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-russo uppercase tracking-tighter">Black Market</h1>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">// LIVE ASSET FEED</p>
                </div>
                {userId && (
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-mono uppercase">AVAILABLE FUNDS</p>
                        <p className="text-xl font-bold font-russo text-primary">{joulesBalance.toLocaleString()} J</p>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="SEARCH MANIFEST..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 py-3 pl-10 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors font-mono uppercase" />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE', 'ARTIFACT'].map((cat) => (
                        <button key={cat} onClick={() => setFilter(cat as any)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${filter === cat ? 'bg-primary text-black border-primary' : 'bg-black text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}`}>{cat}</button>
                    ))}
                </div>
            </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
                <GameTile 
                    key={item.id}
                    game={{ type: 'item', id: item.id, title: item.name, subtitle: `${item.rarity} // ${item.type}`, imageUrl: item.imageUrl, price: item.price, data: item }}
                    onGameLaunch={handlePurchase}
                />
            ))
        ) : (
            <div className="col-span-full py-20 text-center text-gray-600">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-mono text-sm uppercase">NO MATCHING ASSETS FOUND</p>
            </div>
        )}
      </div>
      <div className="text-center py-12 text-white/20 text-xs font-mono">// END OF MANIFEST //</div>
    </div>
  );
};

export default Shop;