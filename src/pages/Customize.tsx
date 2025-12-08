import { FC } from 'react';
import AvatarSelector from '@/components/Inventory/AvatarSelector';
import { usePlayer } from '@/components/context/PlayerContext';
import { UserCog, RefreshCw } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

const Customize: FC = () => {
  const { playerData } = usePlayer();
  const { setShowMessage } = useModal();

  return (
    <div className="p-4 md:p-8 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 border-b border-white/10 pb-8">
            <UserCog className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-russo uppercase mb-2 text-white">Identity Protocol</h1>
            <p className="text-gray-500 font-mono text-sm">SELECT AVATAR UPLINK</p>
        </div>

        <div className="bg-card border border-white/10 p-6">
             <AvatarSelector playerData={playerData} />
        </div>

        <div className="mt-12 text-center">
            <button 
                className="btn-secondary gap-2"
                onClick={() => setShowMessage("🔄 Re-syncing Avatar Data...")}
            >
                <RefreshCw className="w-4 h-4" /> FORCE SYNC
            </button>
            <p className="text-[10px] text-white/30 font-mono mt-4">
                CHANGES PROPAGATE TO UNITY CLIENT IMMEDIATELY
            </p>
        </div>
      </div>
    </div>
  );
};

export default Customize;