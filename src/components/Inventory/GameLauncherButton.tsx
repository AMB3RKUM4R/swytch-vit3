// src/components/Inventory/GameLauncherButton.tsx
import { FC, useState, useCallback } from 'react';
// import { Button } from '@/components/ui/button'; // --- DELETED THIS LINE ---
import { Play, Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useModal } from '@/components/context/ModalContext';

// --- IMPORTANT ---
// 1. Place your APK file (e.g., "swytch.apk") in your Next.js /public folder.
// 2. Change this URL to match your APK file name.
const APK_DOWNLOAD_URL = '/swytch-game.apk'; // This must match your file in /public

// How long to wait (in ms) before assuming the deep link failed
const DEEP_LINK_LAUNCH_TIMEOUT = 2500; 

const GameLauncherButton: FC = () => {
  const { setShowMessage } = useModal();
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);
  const auth = getAuth();
  const functions = getFunctions();

  const handlePlayGame = useCallback(async () => {
    if (!auth.currentUser) {
      setShowMessage("Error: You must be logged in to play.");
      return;
    }
    if (isLaunchingGame) return; // Prevent double-clicks

    setIsLaunchingGame(true);

    try {
      // 1. Get the secure one-time token from your Firebase Function
      const generateWebSession = httpsCallable(functions, 'generateWebSession');
      const result = await generateWebSession();
      const data = result.data as { token: string };
      const webToken = data.token;

      if (!webToken) throw new Error("No token returned from function.");

      // 2. Construct the deep link your Unity app will catch
      const deepLinkUrl = `swytch://play?token=${webToken}`;

      // 3. Set a timer. If the user is still on the page after 2.5s,
      //    we assume the app isn't installed and start the download.
      const downloadTimer = setTimeout(() => {
        // Check if the user is still on the page
        if (document.hasFocus()) {
          setShowMessage("Game not installed. Starting download...");
          window.location.href = APK_DOWNLOAD_URL;
        }
        setIsLaunchingGame(false);
      }, DEEP_LINK_LAUNCH_TIMEOUT);

      // 4. Add a one-time listener. If the browser window "blurs" (loses focus),
      //    it means the app is opening, so we cancel the download timer.
      const handleBlur = () => {
        clearTimeout(downloadTimer);
        window.removeEventListener('blur', handleBlur);
        setIsLaunchingGame(false); // Reset button
      };
      window.addEventListener('blur', handleBlur);

      // 5. Attempt to launch the game
      window.location.href = deepLinkUrl;

    } catch (error) {
      console.error("Failed to generate game session:", error);
      setShowMessage("Error: Could not launch game. Please try again.");
      setIsLaunchingGame(false);
    }
  }, [auth, functions, isLaunchingGame, setShowMessage]);

  return (
    // --- THIS IS THE MODIFIED PART ---
    <button 
      onClick={handlePlayGame} 
      disabled={isLaunchingGame} 
      className="w-full text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center justify-center font-semibold disabled:opacity-50 transition-colors"
    >
      {isLaunchingGame ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Play className="mr-2 h-5 w-5" />
      )}
      {isLaunchingGame ? 'Launching...' : 'Play Now'}
    </button>
    // --- END OF MODIFICATION ---
  );
};

export default GameLauncherButton;