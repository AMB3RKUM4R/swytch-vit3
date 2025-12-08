import { FC } from 'react';
import { staticShopItems } from '@/lib/staticShopData';
import GameTile from '@/components/GameTile';
import { ShoppingBag, Search } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';

const Shop: FC = () => {
  const { setActiveModal, setShowMessage } = useModal();
  const { userId } = usePlayer();

  const handlePurchase = (itemId: string) => {
    if(!userId) {
        setShowMessage("⚠️ AUTH REQUIRED");
        setActiveModal('auth');
    } else {
        // Here we simulate opening the Payment/Buy flow
        setShowMessage("🛒 INITIATING PURCHASE PROTOCOL (AD LOADING...)");
        setActiveModal('payment'); 
    }
  };

  return (
    <div className="w-full min-h-screen bg-black pb-24">
      {/* HEADER */}
      <div className="p-6 border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-30 flex justify-between items-center">
        <div>
            <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-russo uppercase text-white">Black Market</h1>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1">// UNREGULATED ASSETS</p>
        </div>
        <button className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5">
            <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* FEED GRID */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {staticShopItems.map((item) => (
            <GameTile 
                key={item.id}
                game={{
                    type: 'item',
                    id: item.id,
                    title: item.itemName,
                    subtitle: `${item.rarity} // ${item.priceInJoules} J`,
                    imageUrl: item.imageUrl,
                    price: item.priceInJoules
                }}
                onGameLaunch={() => handlePurchase(item.id)}
            />
        ))}
      </div>
    </div>
  );
};

export default Shop;