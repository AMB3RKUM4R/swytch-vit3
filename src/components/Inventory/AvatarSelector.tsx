import { FC, useState } from 'react';
import { Loader2, Check, Lock } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {avatars.map((a) => {
        const selected = selectedAvatarId === a.id;
        const currentLoading = loading === a.id;

        return (
          <button
            key={a.id}
            onClick={() => !a.locked && handleSelect(a.id)}
            disabled={currentLoading || selected || a.locked}
            className={`relative group h-[400px] border transition-all duration-300 overflow-hidden ${selected ? 'border-primary bg-primary/5' : a.locked ? 'border-white/5 opacity-50 cursor-not-allowed grayscale' : 'border-white/10 hover:border-white/50 bg-black'}`}
          >
            <div className="w-full h-full absolute inset-0">
                <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end items-start text-left">
                <h3 className={`text-xl font-bold font-russo uppercase leading-none mb-2 drop-shadow-md ${selected ? 'text-primary' : 'text-white'}`}>{a.name}</h3>
                <div className={`h-1 w-12 mt-2 ${selected ? 'bg-primary' : 'bg-white'}`} />
            </div>
            {currentLoading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}
            {selected && <div className="absolute top-3 right-3 bg-primary text-black p-1.5 rounded-sm z-20 shadow-[0_0_15px_rgba(0,255,65,0.5)]"><Check className="w-5 h-5" /></div>}
            {a.locked && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20"><Lock className="w-10 h-10 text-white/50 mb-3" /><span className="text-xs font-mono text-white/50 uppercase tracking-[0.2em]">LOCKED</span></div>}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarSelector;