// src/components/Inventory/AvatarSelector.tsx
import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { PlayerData } from '@/lib/types';

interface AvatarSelectorProps {
  playerData: PlayerData | null;
}

// UPDATE: Using dedicated image paths for the Avatar Selector
const avatars = [
  { id: "rukha_001", name: "Cyber Samurai", image: "/avatars/samurai_full.webp" },
  { id: "rukha_002", name: "Neon Assassin", image: "/avatars/assassin_full.webp" },
  { id: "rukha_003", name: "Quantum Knight", image: "/avatars/knight_full.webp" },
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
        // In a real app, you'd use setShowMessage() here.
    } finally {
        setLoading(null);
    }
  };

  const selectedAvatarId = playerData?.character?.selectedID;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {avatars.map((a) => {
        const selected = selectedAvatarId === a.id;
        const currentLoading = loading === a.id;

        return (
          <motion.button
            key={a.id}
            onClick={() => handleSelect(a.id)}
            disabled={currentLoading || selected}
            whileHover={!selected && !currentLoading ? { scale: 1.05 } : {}}
            className={`relative rounded-xl overflow-hidden border-4 transition-all ${
              selected ? 'border-primary shadow-2xl shadow-primary/50' : 'border-white/20 hover:border-primary/50'
            } bg-black/50`}
          >
            <div className="w-full aspect-square object-cover flex items-center justify-center bg-gray-900">
                <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
            </div>
            
            {currentLoading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
              </div>
            )}
            
            {selected && (
              <div className="absolute top-3 right-3 bg-primary rounded-full p-2">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
            )}
            
            <div className="p-4 bg-black/80">
              <h3 className="text-xl font-bold font-poppins text-foreground">{a.name}</h3>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AvatarSelector;