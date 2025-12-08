import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, Lock } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { PlayerData } from '@/lib/types';

interface AvatarSelectorProps {
  playerData: PlayerData | null;
}

const avatars = [
  { id: "rukha_001", name: "Cyber Samurai", image: "/avatars/samurai_full.webp", locked: false },
  { id: "rukha_002", name: "Neon Assassin", image: "/avatars/assassin_full.webp", locked: false },
  { id: "rukha_003", name: "Quantum Knight", image: "/avatars/knight_full.webp", locked: true }, // Example locked item
];

const AvatarSelector: FC<AvatarSelectorProps> = ({ playerData }) => {
  const { updatePlayerCharacter } = usePlayer();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    if (loading || playerData?.character?.selectedID === id) return;
    setLoading(id);
    try {
        await updatePlayerCharacter(id);
    } catch (error) {
        console.error("Failed to update character:", error);
    } finally {
        setLoading(null);
    }
  };

  const selectedAvatarId = playerData?.character?.selectedID;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {avatars.map((a) => {
        const selected = selectedAvatarId === a.id;
        const currentLoading = loading === a.id;

        return (
          <button
            key={a.id}
            onClick={() => !a.locked && handleSelect(a.id)}
            disabled={currentLoading || selected || a.locked}
            className={`relative group h-[300px] border transition-all duration-300 overflow-hidden ${
              selected 
              ? 'border-primary bg-primary/5' 
              : a.locked 
                ? 'border-white/5 opacity-50 cursor-not-allowed grayscale' 
                : 'border-white/10 hover:border-white/50 bg-black'
            }`}
          >
            {/* Image */}
            <div className="w-full h-full">
                <img src={a.image} alt={a.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Overlay UI */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent">
                <h3 className={`text-lg font-bold font-russo uppercase ${selected ? 'text-primary' : 'text-white'}`}>{a.name}</h3>
                <div className="h-1 w-10 bg-current mt-2" />
            </div>

            {/* Status Indicators */}
            {currentLoading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            {selected && (
              <div className="absolute top-2 right-2 bg-primary text-black p-1">
                <Check className="w-4 h-4" />
              </div>
            )}

            {a.locked && (
               <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-[2px]">
                   <Lock className="w-8 h-8 text-white/50 mb-2" />
                   <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">LOCKED</span>
               </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarSelector;