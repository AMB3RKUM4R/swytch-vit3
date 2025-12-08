import { FC } from 'react';
import GetGoldButton from '@/components/GetGoldButton';
import { ShoppingBag } from 'lucide-react';

const ShopPage: FC = () => {
  return (
    <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
      
      <div className="text-center mb-12">
        <h1 className="text-5xl font-russo text-white mb-4 uppercase flex items-center justify-center gap-4">
            <ShoppingBag className="text-yellow-500 w-12 h-12" /> The Exchange
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
            Acquire Gold to purchase in-game assets. Secure payments via PayPal, UPI, or Crypto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          
          {/* STARTER PACK */}
          <div className="bg-black border border-white/10 hover:border-yellow-500/50 p-8 rounded-xl text-center group transition-all relative">
              <GetGoldButton variant="shop-card" />
              
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-white font-russo text-2xl mb-2">STARTER</h3>
              <p className="text-gray-500 text-sm mb-6">100 GOLD</p>
              <div className="bg-white/10 text-white font-russo py-2 rounded pointer-events-none group-hover:bg-yellow-600 transition-colors">
                  BUY NOW
              </div>
          </div>

          {/* PRO PACK (Highlighted) */}
          <div className="bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-500 p-8 rounded-xl text-center group transition-all relative scale-105 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <GetGoldButton variant="shop-card" />
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black px-3 py-1 text-xs font-bold rounded">BEST VALUE</div>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💎</div>
              <h3 className="text-white font-russo text-3xl mb-2">PRO PACK</h3>
              <p className="text-gray-400 text-sm mb-6">600 GOLD</p>
              <div className="bg-yellow-500 text-black font-russo py-2 rounded pointer-events-none">
                  BUY NOW
              </div>
          </div>

          {/* WHALE PACK */}
          <div className="bg-black border border-white/10 hover:border-yellow-500/50 p-8 rounded-xl text-center group transition-all relative">
              <GetGoldButton variant="shop-card" />
              
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👑</div>
              <h3 className="text-white font-russo text-2xl mb-2">WHALE</h3>
              <p className="text-gray-500 text-sm mb-6">1500 GOLD</p>
              <div className="bg-white/10 text-white font-russo py-2 rounded pointer-events-none group-hover:bg-yellow-600 transition-colors">
                  BUY NOW
              </div>
          </div>

      </div>
    </div>
  );
};

export default ShopPage;