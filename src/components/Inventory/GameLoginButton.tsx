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
      const generateWebSession = httpsCallable(functions, 'generateWebSession');
      const result = await generateWebSession();
      const data = result.data as { token: string };
      const webToken = data.token;

      if (!webToken) throw new Error("No token returned from function.");

      // Deep link schema for the Unity client to catch
      const deepLinkUrl = `swytch://play?token=${webToken}`;
      
      window.location.href = deepLinkUrl;

      setShowMessage("Attempting to launch game... If nothing happens, make sure the game is installed.");

    } catch (error) {
      console.error("Failed to generate game session:", error);
      setShowMessage("Error: Could not launch game. Please try again.");
    } finally {
      setTimeout(() => setIsLaunchingGame(false), 2000);
    }
  }, [auth, functions, isLaunchingGame, setShowMessage]);

  return (
    <button 
      onClick={handleLoginToGame} 
      disabled={isLaunchingGame} 
      className="btn-primary w-full text-lg py-6 flex items-center justify-center font-semibold disabled:opacity-50 transition-colors"
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