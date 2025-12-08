import { FC } from 'react';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import UserInventoryDisplay from '@/components/Inventory/UserInventoryDisplay';
import { Package, Shield, Share2 } from 'lucide-react';
import { InventoryItem, ItemDefinition } from '@/lib/types'; // Ensure types are imported

const Inventory: FC = () => {
  const { playerData } = usePlayer();
  const { setShowMessage, setActiveModal } = useModal();

  // Connected List Logic (Mocked in UI, but ready for real function)
  const handleList = (instance: InventoryItem, def: ItemDefinition, id: string) => {
      // In a real scenario, this would open ListForSaleModal
      // For now, adhering to "Updated Scripts" only, we simulate the action or use existing modal if available.
      setShowMessage(`📝 Listing ${def.itemName} for sale...`);
      // You would set active modal to 'list-item' and pass data here.
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-24">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
                <h1 className="text-3xl font-russo text-white uppercase">Armory</h1>
                <p className="text-xs font-mono text-primary">// MANAGE DIGITAL ASSETS</p>
            </div>
            <Package className="w-8 h-8 text-white/20" />
        </div>

        {/* Loadout Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-white/10 p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-black border border-white/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Active Operator</p>
                    <p className="text-white font-bold">{playerData?.character?.selectedID || 'DEFAULT'}</p>
                </div>
            </div>
            <div className="bg-card border border-white/10 p-4 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Inventory Slots</p>
                    <p className="text-white font-bold">{Object.keys(playerData?.inventory?.items || {}).length} / 50</p>
                 </div>
                 <button className="btn-secondary h-8 text-xs" onClick={() => setShowMessage("📡 Syncing blockchain data...")}>
                    FORCE SYNC
                 </button>
            </div>
        </div>

        {/* The Real Inventory Component */}
        <UserInventoryDisplay 
            playerData={playerData} 
            userId={playerData?.userId || null} 
            onListForSale={handleList} 
        />
    </div>
  );
};

export default Inventory;