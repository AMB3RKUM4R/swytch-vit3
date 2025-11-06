// src/components/Inventory/GameLoginButton.tsx
import { FC, useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useModal } from '@/components/context/ModalContext';

const GameLoginButton: FC = () => {
  const { setShowMessage } = useModal();
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);
  const auth = getAuth();
  const functions = getFunctions();

  const handleLoginToGame = useCallback(async () => {
    if (!auth.currentUser) {
      setShowMessage("Error: You must be logged in to play.");
      return;
    }
    if (isLaunchingGame) return; 

    setIsLaunchingGame(true);

    try {
      // 1. Get the secure one-time token from your Firebase Function
      const generateWebSession = httpsCallable(functions, 'generateWebSession');
      const result = await generateWebSession();
      const data = result.data as { token: string };
      const webToken = data.token;

      if (!webToken) throw new Error("No token returned from function.");

      // 2. Construct the deep link that your Unity app will catch
      const deepLinkUrl = `swytch://play?token=${webToken}`;
      
      // 3. Attempt to launch the game
      window.location.href = deepLinkUrl;

      // 4. Give feedback
      setShowMessage("Attempting to launch game... If nothing happens, make sure the game is installed.");

    } catch (error) {
      console.error("Failed to generate game session:", error);
      setShowMessage("Error: Could not launch game. Please try again.");
    } finally {
      // Reset button after a short delay to allow clicking again
      setTimeout(() => setIsLaunchingGame(false), 2000);
    }
  }, [auth, functions, isLaunchingGame, setShowMessage]);

  return (
    <button 
      onClick={handleLoginToGame} 
      disabled={isLaunchingGame} 
      className="w-full text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center justify-center font-semibold disabled:opacity-50 transition-colors"
    >
      {isLaunchingGame ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Play className="mr-2 h-5 w-5" />
      )}
      {isLaunchingGame ? 'Launching...' : 'Login to Game'}
    </button>
  );
};

export default GameLoginButton;