import { useCallback } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';
import { usePlayer } from '@/components/context/PlayerContext';
import { increment } from 'firebase/firestore';
import { useModal } from '@/components/context/ModalContext';

export const useAdSystem = () => {
  const { isPETMember, updatePlayerFirestore } = usePlayer();
  const { setShowMessage } = useModal();

  const triggerSmartLink = useCallback(async () => {
    // 1. Open the Smartlink (The "Coin Insert" mechanic)
    // This opens the ad in a new tab while the game restarts in the current tab.
    if (AD_CONFIG.SMARTLINK_URL) {
        window.open(AD_CONFIG.SMARTLINK_URL, '_blank');
    }

    // 2. Member Reward Logic (Play-to-Earn)
    // Only members get Joules for watching the ad
    if (isPETMember) {
        try {
            await updatePlayerFirestore({
                joules: increment(10) as any // Cast to any to allow Firestore FieldValue
            });
            setShowMessage("💎 AD BONUS: +10 JOULES ADDED");
        } catch (e) {
            console.error("Failed to grant ad reward", e);
        }
    }
  }, [isPETMember, updatePlayerFirestore, setShowMessage]);

  return { triggerSmartLink };
};