import { FC, useState, useCallback } from 'react';
import { Loader2, Smartphone } from 'lucide-react';
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
      setShowMessage("⚠️ ERROR: AUTHENTICATION REQUIRED");
      return;
    }
    if (isLaunchingGame) return; 

    setIsLaunchingGame(true);

    try {
      const generateWebSession = httpsCallable(functions, 'generateWebSession');
      const result = await generateWebSession();
      const data = result.data as { token: string };
      
      // Deep link to external app
      window.location.href = `swytch://play?token=${data.token}`;
      setShowMessage("🚀 HANDOFF INITIATED. CHECK DEVICE.");

    } catch (error) {
      console.error(error);
      setShowMessage("❌ HANDOFF FAILED");
    } finally {
      setTimeout(() => setIsLaunchingGame(false), 2000);
    }
  }, [auth, functions, isLaunchingGame, setShowMessage]);

  return (
    <button 
      onClick={handleLoginToGame} 
      disabled={isLaunchingGame} 
      className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
    >
      {isLaunchingGame ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
      {isLaunchingGame ? 'CONNECTING...' : 'OPEN IN APP'}
    </button>
  );
};

export default GameLoginButton;