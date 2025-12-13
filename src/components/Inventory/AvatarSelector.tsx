import { FC, useState } from 'react';
import { Loader2, Check, Lock, User } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { PlayerData } from '@/lib/types';

interface AvatarSelectorProps { playerData: PlayerData | null; }

const avatars = [
  { id: "cyber_samurai", name: "Cyber Samurai", imageUrl: "/avatars/cyber_samurai.jpg", locked: false },
  { id: "neon_assassin", name: "Neon Assassin", imageUrl: "/avatars/neon_assassin.jpg", locked: false },
  { id: "quantum_knight", name: "Quantum Knight", imageUrl: "/avatars/quantum_knight.jpg", locked: true }, 
  { id: "void_walker", name: "Void Walker", imageUrl: "/avatars/void_walker.jpg", locked: true },
  { id: "solar_vanguard", name: "Solar Vanguard", imageUrl: "/avatars/solar_vanguard.jpg", locked: true },
];

const AvatarSelector: FC<AvatarSelectorProps> = ({ playerData }) => {
  const { updatePlayerCharacter } = usePlayer();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    if (loading || playerData?.character?.selectedID === id) return;
    setLoading(id);
    try { await updatePlayerCharacter(id); } 
    catch (error) { console.error(error); } 
    finally { setLoading(null); }
  };

  const selectedAvatarId = playerData?.character?.selectedID;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono">
      {avatars.map((a) => {
        const selected = selectedAvatarId === a.id;
        const currentLoading = loading === a.id;

        return (
          <button
            key={a.id}
            onClick={() => !a.locked && handleSelect(a.id)}
            disabled={currentLoading || selected || a.locked}
            className={`relative group h-[400px] border transition-all duration-300 overflow-hidden text-left flex flex-col justify-end ${
                selected 
                ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.1)]' 
                : a.locked 
                    ? 'border-gray-800 bg-black opacity-60 grayscale cursor-not-allowed' 
                    : 'border-gray-800 bg-black hover:border-[#39FF14]/50'
            }`}
          >
            {/* Image Layer */}
            <div className="absolute inset-0 z-0">
                {/* Placeholder logic if image missing */}
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <img 
                        src={a.imageUrl} 
                        alt={a.name} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <User className="w-20 h-20 text-gray-800 absolute" />
                </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

            {/* Content Layer */}
            <div className="relative z-20 p-6 w-full">
                <h3 className={`text-xl font-black italic uppercase leading-none mb-2 ${selected ? 'text-[#39FF14]' : 'text-white'}`}>
                    {a.name}
                </h3>
                <div className={`h-1 w-12 transition-all duration-300 ${selected ? 'bg-[#39FF14] w-full' : 'bg-gray-700'}`} />
            </div>

            {/* Overlays */}
            {currentLoading && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
                    <Loader2 className="w-12 h-12 animate-spin text-[#39FF14]" />
                </div>
            )}
            
            {selected && (
                <div className="absolute top-4 right-4 bg-[#39FF14] text-black p-1 rounded-sm z-30 shadow-[0_0_10px_#39FF14]">
                    <Check className="w-5 h-5" />
                </div>
            )}
            
            {a.locked && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-30 border border-gray-800">
                    <Lock className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">LOCKED</span>
                </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarSelector;