// src/components/AuthModal.tsx
import { FC, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogOut } from 'lucide-react';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useModal } from './context/ModalContext';
import { AuthModalProps } from '@/lib/types';

const modalVariants = { /* ... */ };

const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  const { activeModal, setActiveModal: setModalActive } = useModal();
  const { user, signInWithGoogle, signOutUser } = useAuthUserFirebase();

  const handleAuthSuccess = useCallback((message: string) => {
    setShowMessage(message);
    setModalActive(null);
  }, [setShowMessage, setModalActive]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
      handleAuthSuccess('🎉 Signed in with Google successfully!');
    } catch (err) {
      setShowMessage('⚠️ Failed to sign in with Google.');
    }
  }, [signInWithGoogle, handleAuthSuccess, setShowMessage]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    handleAuthSuccess('👋 You have been signed out.');
  }, [signOutUser, handleAuthSuccess]);

  const isLoggedIn = !!user;

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div
            className="relative p-8 bg-black/20 rounded-xl border border-[hsl(var(--primary),0.2)] max-w-sm w-full mx-4"
            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
          >
            <button onClick={() => setModalActive(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
              {isLoggedIn ? `Welcome Back` : 'Access The PETverse'}
            </h2>

            <div className="space-y-4">
              {isLoggedIn ? (
                <button onClick={handleSignOut} className="btn-primary w-full text-lg">
                  <LogOut className="mr-2" /> Sign Out
                </button>
              ) : (
                <button onClick={handleGoogleSignIn} className="btn-secondary w-full text-lg">
                  <Sparkles className="mr-2" /> Continue with Google
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default AuthModal;