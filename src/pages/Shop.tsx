import { FC, useState } from 'react';
import GetGoldButton from '@/components/GetGoldButton';
import { ShoppingBag, Shield } from 'lucide-react';
import { staticShopItems } from '@/lib/staticShopData'; 
import GameTile from '@/components/GameTile'; 
import CurrencyHUD from '@/components/CurrencyHUD'; 
import AdDisplayPanel from '@/components/AdDisplayPanel'; //

const Shop: FC = () => {
  const [filter, setFilter] = useState('ALL');

  const filteredItems = staticShopItems.filter(item => 
    filter === 'ALL' || item.itemType.toUpperCase() === filter
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 flex flex-col items-center">
      
      {/* --- HUD HEADER --- */}
      <div className="w-full max-w-6xl flex justify-end mb-4">
         <CurrencyHUD />
      </div>

      {/* --- SECTION 1: GOLD STORE --- */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl font-russo text-white mb-4 uppercase flex items-center justify-center gap-4">
            <ShoppingBag className="text-yellow-500 w-12 h-12" /> The Exchange
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
            Acquire Gold to purchase specialized gear.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-24">
          {/* STARTER */}
          <div className="bg-black border border-white/10 hover:border-yellow-500/50 p-8 rounded-xl text-center group transition-all relative">
              <GetGoldButton variant="shop-card" />
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-white font-russo text-2xl mb-2">STARTER</h3>
              <p className="text-gray-500 text-sm mb-6">100 GOLD</p>
              <div className="btn-secondary w-full text-sm py-2 pointer-events-none">BUY NOW</div>
          </div>

          {/* PRO PACK */}
          <div className="bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-500 p-8 rounded-xl text-center group transition-all relative scale-105 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <GetGoldButton variant="shop-card" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black px-3 py-1 text-xs font-bold rounded">BEST VALUE</div>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💎</div>
              <h3 className="text-white font-russo text-3xl mb-2">PRO PACK</h3>
              <p className="text-gray-400 text-sm mb-6">600 GOLD</p>
              <div className="bg-yellow-500 text-black font-russo py-2 rounded pointer-events-none">BUY NOW</div>
          </div>

          {/* WHALE */}
          <div className="bg-black border border-white/10 hover:border-yellow-500/50 p-8 rounded-xl text-center group transition-all relative">
              <GetGoldButton variant="shop-card" />
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👑</div>
              <h3 className="text-white font-russo text-2xl mb-2">WHALE</h3>
              <p className="text-gray-500 text-sm mb-6">1500 GOLD</p>
              <div className="btn-secondary w-full text-sm py-2 pointer-events-none">BUY NOW</div>
          </div>
      </div>

      {/* --- SECTION 2: THE BLACK MARKET --- */}
      <div className="max-w-7xl w-full border-t border-white/10 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                  <h2 className="text-3xl font-russo text-white flex items-center gap-3">
                      <Shield className="text-primary" /> BLACK MARKET
                  </h2>
                  <p className="text-gray-500 text-sm">Spend Gold to acquire superior weaponry.</p>
              </div>
              
              <div className="flex gap-2">
                  {['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded text-xs font-bold border transition-all ${
                            filter === f 
                            ? 'bg-primary/20 border-primary text-primary' 
                            : 'border-white/10 text-gray-500 hover:border-white/30'
                        }`}
                      >
                          {f}
                      </button>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {filteredItems.map((item) => (
                  <div key={item.id} className="aspect-[3/4]">
                      <GameTile 
                          game={{
                              type: 'item',
                              id: item.id,
                              title: item.itemName,
                              subtitle: item.rarity,
                              imageUrl: item.visuals?.iconName,
                              price: item.price?.USD ? item.price.USD * 100 : (item.price?.JOULES ? Math.floor(item.price.JOULES/10) : 100),
                              data: item
                          }}
                          onGameLaunch={() => {}} 
                      />
                  </div>
              ))}
          </div>

          {/* --- ADSTERRA BANNER --- */}
          <div className="w-full flex justify-center py-8 border-t border-white/5">
               <div className="w-full max-w-4xl">
                   <AdDisplayPanel zoneType="banner" />
               </div>
          </div>
      </div>

    </div>
  );
};

export default Shop;