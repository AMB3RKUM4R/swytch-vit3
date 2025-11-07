// src/components/AuthModal.tsx
import { FC, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogOut, Mail, Lock, Loader2, AlertTriangle, Wallet } from 'lucide-react';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useModal } from './context/ModalContext';
import { AuthModalProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

type AuthMode = 'signIn' | 'register' | 'forgotPassword';

const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  const { activeModal, setActiveModal: setModalActive } = useModal();
  
  const { 
    user, 
    loading, 
    error: authError, 
    signInWithGoogle, 
    signOutUser,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset
  } = useAuthUserFirebase();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = useCallback((message: string) => {
    setShowMessage(message);
    setModalActive(null);
    setEmail('');
    setPassword('');
    setError(null);
    setMode('signIn');
  }, [setShowMessage, setModalActive]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    handleAuthSuccess('窓 You have been signed out.');
  }, [signOutUser, handleAuthSuccess]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
      handleAuthSuccess('脂 Signed in with Google successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  }, [signInWithGoogle, handleAuthSuccess]);
  
  const handleEmailSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      await signInWithEmail(email, password);
      handleAuthSuccess('脂 Signed in successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  }, [signInWithEmail, email, password, handleAuthSuccess]);
  
  const handleEmailRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      await registerWithEmail(email, password);
      handleAuthSuccess('脂 Welcome! Account created successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  }, [registerWithEmail, email, password, handleAuthSuccess]);
  
  const handlePasswordReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      await sendPasswordReset(email);
      setShowMessage('闘 Password reset link sent! Please check your email.');
      setMode('signIn');
    } catch (err: any) {
      setError(err.message);
    }
  }, [sendPasswordReset, email, setShowMessage]);

  const isLoggedIn = !!user;
  const displayError = error || authError;

  const renderForm = () => {
    if (isLoggedIn) {
      return (
        <div className="space-y-4">
          <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
            Welcome Back
          </h2>
          <button onClick={handleSignOut} className="btn-primary w-full text-lg">
            <LogOut className="mr-2" /> Sign Out
          </button>
          <div className="mt-4 flex justify-center">
             <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
      );
    }
    
    switch (mode) {
      case 'signIn':
        return (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
              Access The PETverse
            </h2>
            
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, authenticationStatus, mounted }) => { 
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');
                  
                  if (connected) {
                     setTimeout(() => setModalActive(null), 100);
                     return null;
                  }

                  return (
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="btn-primary w-full text-lg"
                      disabled={!ready}
                    >
                      <Wallet className="mr-2" /> Continue with Wallet
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <span className="relative px-2 bg-[hsl(var(--card))] text-sm text-muted-foreground">OR</span>
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {/* --- FIX 1: Added name attribute --- */}
              <input type="email" id="signInEmail" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10 w-full" disabled={loading} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {/* --- FIX 2: Added name attribute --- */}
              <input type="password" id="signInPassword" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 w-full" disabled={loading} />
            </div>
            <button type="submit" className="btn-secondary w-full text-lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Continue with Email'}
            </button>
            <button type="button" onClick={handleGoogleSignIn} className="btn-secondary w-full text-lg" disabled={loading}>
              <Sparkles className="mr-2" /> Continue with Google
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => { setMode('forgotPassword'); setError(null); }} className="text-muted-foreground hover:text-primary transition">Forgot Password?</button>
              <button type="button" onClick={() => { setMode('register'); setError(null); }} className="text-muted-foreground hover:text-primary transition">Register</button>
            </div>
          </form>
        );
        
      case 'register':
        return (
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
              Create Account
            </h2>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {/* --- FIX 3: Added name attribute --- */}
              <input type="email" id="registerEmail" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10 w-full" disabled={loading} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {/* --- FIX 4: Added name attribute --- */}
              <input type="password" id="registerPassword" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 w-full" disabled={loading} />
            </div>
            <button type="submit" className="btn-primary w-full text-lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
            <div className="text-center text-sm">
              <button type="button" onClick={() => { setMode('signIn'); setError(null); }} className="text-muted-foreground hover:text-primary transition">Already have an account? Sign In</button>
            </div>
          </form>
        );
        
      case 'forgotPassword':
        return (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <h2 className="text-3xl font-russo text-center mb-6 text-glow-primary">
              Reset Password
            </h2>
            <p className="text-sm text-muted-foreground text-center -mt-4 mb-4">Enter your email to receive a reset link.</p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {/* --- FIX 5: Added name attribute --- */}
              <input type="email" id="resetEmail" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10 w-full" disabled={loading} />
            </div>
            <button type="submit" className="btn-primary w-full text-lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
            <div className="text-center text-sm">
              <button type="button" onClick={() => { setMode('signIn'); setError(null); }} className="text-muted-foreground hover:text-primary transition">Back to Sign In</button>
            </div>
          </form>
        );
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div
            className={cn("relative p-8 bg-black/20 rounded-xl border border-[hsl(var(--primary),0.2)] max-w-sm w-full mx-4", 
                         "holographic-card", 
            )}
            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
          >
            <button onClick={() => setModalActive(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
            
            {renderForm()}

            <AnimatePresence>
              {displayError && (
                <motion.p 
                  className="text-destructive text-sm text-center mt-4 font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertTriangle className="inline-block w-4 h-4 mr-2"/> 
                  {displayError.includes("auth/invalid-credential") ? "Invalid email or password." :
                   displayError.includes("auth/invalid-email") ? "Invalid email address." :
                   displayError.includes("auth/email-already-in-use") ? "An account with this email already exists." :
                   displayError.includes("auth/weak-password") ? "Password must be at least 6 characters long." :
                   "An unknown error occurred."}
                </motion.p>
              )}
            </AnimatePresence>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;