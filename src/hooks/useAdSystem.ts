import { useCallback } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';
import { usePlayer } from '@/components/context/PlayerContext';
import { increment } from 'firebase/firestore';
import { useModal } from '@/components/context/ModalContext';

export const useAdSystem = () => {
  const { isPETMember, updatePlayerFirestore } = usePlayer();
  const { setShowMessage } = useModal();

  const triggerSmartLink = useCallback(async () => {
    // 1. Open the Ad (Smartlink)
    if (AD_CONFIG.SMARTLINK_URL) {
        window.open(AD_CONFIG.SMARTLINK_URL, '_blank');
    }

    // 2. Member Reward Logic
    if (isPETMember) {
        try {
            await updatePlayerFirestore({
                joules: increment(10) as any // REWARD: 10 Joules per ad
            });
            setShowMessage("💎 AD BONUS: +10 JOULES ADDED");
        } catch (e) {
            console.error("Failed to grant ad reward", e);
        }
    }
  }, [isPETMember, updatePlayerFirestore, setShowMessage]);

  return { triggerSmartLink };
};