// src/components/Inventory/GameLauncherButton.tsx
import { FC, useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useModal } from '@/components/context/ModalContext';

const APK_DOWNLOAD_URL = '/swytch-game.apk';
const DEEP_LINK_TIMEOUT = 3000;

const GameLauncherButton: FC = () => {
  const { setShowMessage } = useModal();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = useCallback(async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setShowMessage("Please sign in to play");
      return;
    }

    setIsLaunching(true);

    try {
      const functions = getFunctions();
      const generateToken = httpsCallable(functions, 'generateWebSession');
      const result = await generateToken();
      const { token } = result.data as { token: string };

      const deepLink = `swytch://play?token=${token}`;

      const timer = setTimeout(() => {
        if (document.hasFocus()) {
          setShowMessage("Game not installed. Downloading APK...");
          window.location.href = APK_DOWNLOAD_URL;
        }
      }, DEEP_LINK_TIMEOUT);

      const onBlur = () => {
        clearTimeout(timer);
        window.removeEventListener('blur', onBlur);
      };
      window.addEventListener('blur', onBlur);

      window.location.href = deepLink;

    } catch (error) {
      console.error(error);
      setShowMessage("Failed to launch game");
      setIsLaunching(false);
    }
  }, [setShowMessage]);

  return (
    <button
      onClick={handleLaunch}
      disabled={isLaunching}
      className="w-full py-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 disabled:opacity-70 transition-all"
    >
      {isLaunching ? (
        <>
          <Loader2 className="w-10 h-10 animate-spin" />
          Launching...
        </>
      ) : (
        <>
          <Play className="w-10 h-10" />
          PLAY NOW
        </>
      )}
    </button>
  );
};

export default GameLauncherButton;