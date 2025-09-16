// src/components/AuthModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Key, Wallet, Sparkles, LogOut } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// FIX: Importing the new, separate authentication hooks
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '../hooks/useAuthUserWagmi';
import { useModal } from './context/ModalContext';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  setShowMessage: (message: string) => void;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  const { activeModal, setActiveModal: setModalActive } = useModal();
  // FIX: Using the new, separate hooks for Firebase and Wagmi
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } = useAuthUserFirebase();
  const { isConnected, disconnect } = useAuthUserWagmi();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (activeModal === null) {
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    }
  }, [activeModal]);

  const handleAuthSuccess = (message: string) => {
    setShowMessage(message);
    setModalActive(null);
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    console.error('Authentication error:', error);
    const friendlyMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : defaultMessage;
    setShowMessage(`⚠️ ${friendlyMessage}`);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
        setShowMessage("⚠️ Please enter both email and password.");
        return;
    }
    try {
      if (isSignUp) {
        if (isConnected) disconnect();
        await signUpWithEmail(email, password);
        handleAuthSuccess('🎉 Welcome! You have successfully signed up.');
      } else {
        if (isConnected) disconnect();
        await signInWithEmail(email, password);
        handleAuthSuccess('🎉 Welcome back! Signed in successfully.');
      }
    } catch (err) {
      handleAuthError(err, 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (isConnected) disconnect();
      await signInWithGoogle();
      handleAuthSuccess('🎉 Signed in with Google successfully!');
    } catch (err) {
      handleAuthError(err, 'Failed to sign in with Google.');
    }
  };

  const handleWalletDisconnect = async () => {
    await disconnect();
    setShowMessage('👋 Wallet disconnected.');
  }

  const isLoggedInWithFirebase = !!user;

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative p-8 bg-black/20 rounded-xl border border-[hsl(var(--primary),0.2)] max-w-sm w-full mx-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setModalActive(null)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
              {isSignUp ? 'Create Your Profile' : 'Access The PETverse'}
            </h2>

            <div className="space-y-4">
              {!isLoggedInWithFirebase && (
                  <ConnectButton.Custom>
                      {({ openConnectModal, mounted }) => (
                          <button
                          disabled={!mounted || isConnected || isLoggedInWithFirebase}
                          onClick={() => {
                              openConnectModal();
                              handleAuthSuccess('ℹ️ Connecting crypto wallet...');
                          }}
                          className={cn("btn-system-glow w-full text-lg", (isConnected || isLoggedInWithFirebase) && "opacity-50 cursor-not-allowed")}
                          >
                          <Wallet className="mr-2" /> Connect Wallet
                          </button>
                      )}
                  </ConnectButton.Custom>
              )}
              {isConnected && (
                <button 
                  onClick={handleWalletDisconnect} 
                  className="btn-primary w-full text-lg"
                >
                  <LogOut className="mr-2" /> Disconnect Wallet
                </button>
              )}
              
              <div className="flex items-center gap-2">
                  <hr className="w-full border-[hsl(var(--border)]" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <hr className="w-full border-[hsl(var(--border)]" />
              </div>

              {!isConnected && (
                <>
                  <button onClick={handleGoogleSignIn} className={cn("btn-secondary w-full", isLoggedInWithFirebase && "opacity-50 cursor-not-allowed")} disabled={isLoggedInWithFirebase}>
                      <Sparkles className="mr-2" /> Sign In with Google
                  </button>
                  
                  <div className={cn("space-y-3 pt-2", isLoggedInWithFirebase && "opacity-50 cursor-not-allowed")}>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                          <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email Address"
                              className="input-system pl-10"
                              autoComplete="email"
                              disabled={isLoggedInWithFirebase}
                          />
                      </div>
                      <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                          <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Password"
                              className="input-system pl-10"
                              autoComplete={isSignUp ? 'new-password' : 'current-password'}
                              disabled={isLoggedInWithFirebase}
                          />
                      </div>
                      <button className="btn-primary w-full" onClick={handleEmailAuth} disabled={isLoggedInWithFirebase}>
                          {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
                      </button>
                  </div>
                  <div className="text-center pt-2">
                      <button
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                          onClick={() => setIsSignUp(!isSignUp)}
                          disabled={isLoggedInWithFirebase}
                      >
                          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                      </button>
                  </div>
                </>
              )}
            </div>
            
            {isLoggedInWithFirebase && !isConnected && (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-2">You are signed in with Firebase.</p>
                <button onClick={signOutUser} className="btn-secondary w-full">
                    <LogOut className="mr-2" /> Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;