// src/components/Inventory/AvatarSelector.tsx
import { FC, useState } from 'react';
import { usePlayer } from '@/components/context/PlayerContext';
import { PlayerData } from '@/lib/types'; // Make sure this type is imported
import { Loader2, CheckCircle, User, Zap, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

// --- PROPS DEFINITION ---
// We now accept playerData from the parent page
interface AvatarSelectorProps {
  playerData: PlayerData | null;
}

const AvatarSelector: FC<AvatarSelectorProps> = ({ playerData }) => {
  const { updatePlayerCharacter } = usePlayer();
  const [loadingAvatar, setLoadingAvatar] = useState<string | null>(null);

  const handleSelectAvatar = async (avatarId: string) => {
    if (loadingAvatar || playerData?.character?.selectedID === avatarId) return;

    setLoadingAvatar(avatarId);
    try {
      // This function already exists in your PlayerContext
      // It calls AuthManager.SetStartingCharacterAsync in Unity
      await updatePlayerCharacter(avatarId); 
    } catch (error) {
      console.error("Failed to select avatar:", error);
    } finally {
      setLoadingAvatar(null);
    }
  };

  // Helper function to render avatar buttons
  const renderAvatarButton = (avatarId: string, name: string, imageUrl: string) => {
    const isSelected = playerData?.character?.selectedID === avatarId;
    const isLoading = loadingAvatar === avatarId;

    return (
      <motion.button
        key={avatarId}
        onClick={() => handleSelectAvatar(avatarId)}
        disabled={isLoading || isSelected}
        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-300
          ${isSelected ? 'border-primary shadow-lg' : 'border-border hover:border-primary/70'}
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${!isSelected && !isLoading ? 'hover:scale-105' : ''}
        `}
        whileTap={!isSelected && !isLoading ? { scale: 0.98 } : {}}
      >
        <img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
        <div className="p-4 bg-card/80 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-foreground">{name}</h4>
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h2 className="text-2xl font-semibold font-poppins mb-4 text-primary">Character</h2>
      
      {/* --- AVATAR SELECTION GRID --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* These URLs should be real paths to your avatar images in /public */}
        {renderAvatarButton("Hunter", "Hunter", "/images/avatars/hunter.png")}
        {renderAvatarButton("Mage", "Mage", "/images/avatars/mage.png")}
      </div>

      {/* --- NEW PLAYER STATS DISPLAY --- */}
      {/* We use the playerData prop to show live stats */}
      <h3 className="text-xl font-semibold font-poppins mb-4 text-foreground">Player Stats</h3>
      {playerData ? (
        <ul className="space-y-3 font-inter">
          <li className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><User className="w-4 h-4 mr-2" /> Username</span>
            <span className="font-medium text-foreground">{playerData.username}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Star className="w-4 h-4 mr-2" /> Level</span>
            <span className="font-medium text-foreground">{playerData.level}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Shield className="w-4 h-4 mr-2" /> XP</span>
            <span className="font-medium text-foreground">{playerData.xp} / {playerData.level * 100}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Zap className="w-4 h-4 mr-2" /> Mana</span>
            <span className="font-medium text-foreground">{playerData.mana}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Zap className="w-4 h-4 mr-2" /> Energy</span>
            <span className="font-medium text-foreground">{playerData.energy}</span>
          </li>
        </ul>
      ) : (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      {/* --- END OF STATS DISPLAY --- */}

    </div>
  );
};

export default AvatarSelector;