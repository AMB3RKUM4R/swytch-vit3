// src/components/Inventory/AvatarSelector.tsx
import { FC } from 'react';
import { usePlayer } from '@/components/context/PlayerContext';
import SwytchCard from '@/components/SwytchCard';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner'; // Make sure this path is correct

// Add your avatar details here. The 'id' MUST match
// the prefab name in your Unity AssetLibrary.cs
const AVATAR_LIST = [
  { id: 'Hunter', name: 'Hunter', image: '/avatars/Hunter.png' },
  { id: 'Mage', name: 'Mage', image: '/avatars/Mage.png' },
  // Add more avatars as needed
];

const AvatarSelector: FC = () => {
  const { playerData, updatePlayerFirestore, dataLoading } = usePlayer();
  
  // This now correctly uses the PlayerData type you provided
  const currentAvatarId = playerData?.character?.selectedID;

  const handleSelectAvatar = async (avatarId: string) => {
    if (dataLoading || currentAvatarId === avatarId) return;

    try {
      // This is the web version of your C# AvatarSelector.cs logic
      // It uses the same dot-notation to update the nested field
      await updatePlayerFirestore({ 
        'character.selectedID': avatarId 
      });
    } catch (err) {
      console.error("Failed to update avatar:", err);
    }
  };

  if (dataLoading) {
    return (
      <SwytchCard variant="default" className="p-6 flex items-center justify-center min-h-[200px]">
        <LoadingSpinner message="Loading Avatar..." />
      </SwytchCard>
    );
  }

  return (
    <SwytchCard variant="default" className="p-6">
      <h3 className="text-xl font-bold font-poppins mb-4">Select Avatar</h3>
      <div className="grid grid-cols-2 gap-4">
        {AVATAR_LIST.map((avatar) => {
          const isSelected = currentAvatarId === avatar.id;
          return (
            <motion.div
              key={avatar.id}
              className={`rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-4 border-primary ring-2 ring-primary/50' 
                  : 'border-4 border-transparent hover:border-muted-foreground/50'
              }`}
              onClick={() => handleSelectAvatar(avatar.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <img src={avatar.image} alt={avatar.name} className="w-full h-auto rounded-md mb-2 aspect-square object-cover" />
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <UserCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-center font-semibold text-foreground">{avatar.name}</p>
            </motion.div>
          );
        })}
      </div>
    </SwytchCard>
  );
};

export default AvatarSelector;