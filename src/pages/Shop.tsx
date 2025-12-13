import { FC, useState } from 'react';
import GetGoldButton from '@/components/GetGoldButton';
import { ShoppingBag, Shield } from 'lucide-react';
import { staticShopItems } from '@/lib/staticShopData'; 
import GameTile from '@/components/GameTile'; 
import CurrencyHUD from '@/components/CurrencyHUD'; 
import AdDisplayPanel from '@/components/AdDisplayPanel';

const Shop: FC = () => {
  const [filter, setFilter] = useState('ALL');

  const filteredItems = staticShopItems.filter(item => 
    filter === 'ALL' || item.itemType.toUpperCase() === filter
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 flex flex-col items-center bg-black font-mono selection:bg-[#39FF14] selection:text-black">
      
      {/* HUD */}
      <div className="w-full max-w-6xl flex justify-end mb-6">
         <CurrencyHUD />
      </div>

      {/* --- SECTION 1: CREDIT STORE --- */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl font-black italic text-white mb-4 uppercase flex items-center justify-center gap-4 tracking-tighter">
            <ShoppingBag className="text-[#39FF14] w-12 h-12" /> The Exchange
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
            ACQUIRE ASSETS TO ENHANCE PROTOCOL EFFICIENCY.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-24">
          {/* TIER 1 */}
          <div className="bg-[#050505] border border-gray-800 hover:border-[#39FF14] p-8 rounded-xl text-center group transition-all relative">
              <GetGoldButton variant="shop-card" />
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0">💰</div>
              <h3 className="text-white font-bold text-2xl mb-2">STARTER CACHE</h3>
              <p className="text-[#39FF14] text-sm mb-6 font-bold">100 CREDITS</p>
              <div className="w-full py-2 border border-[#39FF14] text-[#39FF14] text-xs font-bold uppercase hover:bg-[#39FF14] hover:text-black transition-colors pointer-events-none">ACQUIRE</div>
          </div>

          {/* TIER 2 (Highlight) */}
          <div className="bg-[#0a0a0a] border-2 border-[#39FF14] p-8 rounded-xl text-center group transition-all relative scale-105 shadow-[0_0_30px_rgba(57,255,20,0.15)]">
              <GetGoldButton variant="shop-card" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#39FF14] text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest">Recommended</div>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💎</div>
              <h3 className="text-white font-black italic text-3xl mb-2">PRO BUNDLE</h3>
              <p className="text-white text-sm mb-6">600 CREDITS</p>
              <div className="w-full py-3 bg-[#39FF14] text-black text-sm font-bold uppercase hover:bg-white transition-colors pointer-events-none">ACQUIRE</div>
          </div>

          {/* TIER 3 */}
          <div className="bg-[#050505] border border-gray-800 hover:border-[#39FF14] p-8 rounded-xl text-center group transition-all relative">
              <GetGoldButton variant="shop-card" />
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0">👑</div>
              <h3 className="text-white font-bold text-2xl mb-2">WHALE VAULT</h3>
              <p className="text-[#39FF14] text-sm mb-6 font-bold">1500 CREDITS</p>
              <div className="w-full py-2 border border-[#39FF14] text-[#39FF14] text-xs font-bold uppercase hover:bg-[#39FF14] hover:text-black transition-colors pointer-events-none">ACQUIRE</div>
          </div>
      </div>

      {/* --- SECTION 2: BLACK MARKET --- */}
      <div className="max-w-7xl w-full border-t border-gray-900 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                  <h2 className="text-3xl font-black italic text-white flex items-center gap-3">
                      <Shield className="text-[#39FF14]" /> BLACK MARKET
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">LIMITED EDITION DIGITAL ASSETS.</p>
              </div>
              
              <div className="flex gap-2">
                  {['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all uppercase tracking-widest ${
                            filter === f 
                            ? 'bg-[#39FF14] border-[#39FF14] text-black' 
                            : 'border-gray-800 text-gray-500 hover:border-gray-600 bg-black'
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
                              // FIX: Lowercase properties matching new types.ts
                              price: item.price?.usd ? item.price.usd * 100 : (item.price?.joules ? Math.floor(item.price.joules/10) : 100),
                              data: item
                          }}
                          onGameLaunch={() => {}} 
                      />
                  </div>
              ))}
          </div>

          {/* --- AD BANNER --- */}
          <div className="w-full flex justify-center py-8 border-t border-gray-900">
               <div className="w-full max-w-4xl bg-[#050505] border border-dashed border-gray-800 p-4 text-center text-gray-600 text-xs">
                   <AdDisplayPanel zoneType="banner" />
                   <span className="block mt-2 opacity-50">SPONSORED_CONTENT</span>
               </div>
          </div>
      </div>

    </div>
  );
};

export default Shop;