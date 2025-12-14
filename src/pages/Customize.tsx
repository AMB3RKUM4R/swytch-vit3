import { FC } from 'react';
import AvatarSelector from '@/components/Inventory/AvatarSelector';
import { usePlayer } from '@/components/context/PlayerContext';
import { RefreshCw, ScanFace } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

const Customize: FC = () => {
  const { playerData } = usePlayer();
  const { setShowMessage } = useModal();

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-black font-mono text-white">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-end justify-between mb-12 border-b border-gray-800 pb-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <ScanFace className="w-10 h-10 text-[#39FF14]" />
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Identity Protocol</h1>
                </div>
                <p className="text-gray-500 text-sm">// CONFIGURE DIGITAL AVATAR</p>
            </div>
            <button 
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#39FF14] transition-colors border border-gray-800 hover:border-[#39FF14] px-4 py-2"
                onClick={() => setShowMessage("🔄 Re-syncing Avatar Data...")}
            >
                <RefreshCw className="w-3 h-3" /> FORCE SYNC
            </button>
        </div>

        <div className="bg-[#050505] border border-gray-800 p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
             <div className="absolute top-0 right-0 p-2 bg-gray-900 border-l border-b border-gray-800 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                 Editor_Mode
             </div>
             
             {/* The Selector Component */}
             <AvatarSelector playerData={playerData} />
        </div>

        <div className="mt-8 text-center opacity-50">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-600">
                CHANGES PROPAGATE TO GAME CLIENTS IMMEDIATELY
            </p>
        </div>
      </div>
    </div>
  );
};

export default Customize;