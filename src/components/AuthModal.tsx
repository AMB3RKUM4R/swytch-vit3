import { FC, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogOut, Mail, Lock, Loader2, AlertTriangle, Play } from 'lucide-react';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useModal } from './context/ModalContext';
import { AuthModalProps } from '@/lib/types';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
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
    handleAuthSuccess('✅ SYSTEM DISCONNECTED'); 
  }, [signOutUser, handleAuthSuccess]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
      handleAuthSuccess('✅ BIOMETRIC LINK ESTABLISHED (GOOGLE)');
    } catch (err: any) {
      setError(err.message);
    }
  }, [signInWithGoogle, handleAuthSuccess]);
  
  const handleEmailSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("CREDENTIALS MISSING");
      return;
    }
    try {
      await signInWithEmail(email, password);
      handleAuthSuccess('✅ SYSTEM ACCESS GRANTED');
    } catch (err: any) {
      setError(err.message);
    }
  }, [signInWithEmail, email, password, handleAuthSuccess]);
  
  const handleEmailRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("CREDENTIALS MISSING");
      return;
    }
    try {
      await registerWithEmail(email, password);
      handleAuthSuccess('✅ NEW UPLINK CREATED');
    } catch (err: any) {
      setError(err.message);
    }
  }, [registerWithEmail, email, password, handleAuthSuccess]);
  
  const handlePasswordReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("EMAIL REQUIRED FOR RESET");
      return;
    }
    try {
      await sendPasswordReset(email);
      setShowMessage('📨 RESET LINK TRANSMITTED'); 
      setModalActive(null); 
      setMode('signIn');
    } catch (err: any) {
      setError(err.message);
    }
  }, [sendPasswordReset, email, setShowMessage, setModalActive]);

  const isLoggedIn = !!user;
  const displayError = error || authError;

  const renderForm = () => {
    if (isLoggedIn) {
      return (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-russo text-white uppercase tracking-wide">
            Welcome, Operator
          </h2>
          <div className="p-4 bg-white/5 border border-white/10">
             <p className="text-xs font-mono text-primary break-all">{user?.email}</p>
             <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {user?.uid.slice(0, 8)}</p>
          </div>
          <button onClick={handleSignOut} className="btn-destructive w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> TERMINATE SESSION
          </button>
        </div>
      );
    }
    
    switch (mode) {
      case 'signIn':
        return (
          <form onSubmit={handleEmailSignIn} className="space-y-5">
            <h2 className="text-2xl font-russo text-white mb-2 uppercase text-center tracking-wider">
              System Login
            </h2>
            
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase">Identity (Email)</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="email" 
                        placeholder="operator@swytch.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="input pl-10" 
                        disabled={loading} 
                        autoComplete="email" 
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase">Access Code</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="input pl-10" 
                        disabled={loading} 
                        autoComplete="current-password" 
                    />
                </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'INITIALIZE LINK'} 
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] text-gray-500 font-mono">OR</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button type="button" onClick={handleGoogleSignIn} className="btn-secondary w-full flex items-center justify-center gap-2" disabled={loading}>
              <Sparkles className="w-4 h-4 text-yellow-400" /> GOOGLE AUTH
            </button>

            <div className="flex justify-between text-[10px] font-mono pt-2">
              <button type="button" onClick={() => { setMode('forgotPassword'); setError(null); }} className="text-gray-500 hover:text-white transition-colors uppercase">LOST CODE?</button>
              <button type="button" onClick={() => { setMode('register'); setError(null); }} className="text-primary hover:text-green-400 transition-colors uppercase">NEW UPLINK</button>
            </div>
          </form>
        );
        
      case 'register':
        return (
          <form onSubmit={handleEmailRegister} className="space-y-5">
            <h2 className="text-2xl font-russo text-white mb-2 uppercase text-center tracking-wider">
              New Uplink
            </h2>
            
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase">Identity (Email)</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" disabled={loading} autoComplete="email" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase">Set Access Code</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" disabled={loading} autoComplete="new-password" />
                </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'ESTABLISH ID'}
            </button>

            <div className="text-center text-[10px] font-mono pt-2">
              <button type="button" onClick={() => { setMode('signIn'); setError(null); }} className="text-gray-500 hover:text-white transition-colors uppercase">
                  [ EXISTING USER? LOGIN ]
              </button>
            </div>
          </form>
        );
        
      case 'forgotPassword':
        return (
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <h2 className="text-2xl font-russo text-white mb-2 uppercase text-center tracking-wider">
              Code Reset
            </h2>
            <p className="text-xs text-gray-500 font-mono text-center mb-4">ENTER EMAIL TO RECEIVE RECOVERY PACKET</p>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" disabled={loading} autoComplete="email" />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'TRANSMIT LINK'}
            </button>

            <div className="text-center text-[10px] font-mono pt-2">
              <button type="button" onClick={() => { setMode('signIn'); setError(null); }} className="text-gray-500 hover:text-white transition-colors uppercase">
                  &lt;&lt; RETURN TO LOGIN
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm bg-black border border-primary p-8 shadow-[0_0_50px_rgba(0,255,65,0.1)]"
            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
          >
            <button 
                onClick={() => setModalActive(null)} 
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            {renderForm()}

            <AnimatePresence>
              {displayError && (
                <motion.div 
                  className="mt-6 p-3 bg-red-900/20 border border-red-500/50 flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"/> 
                  <p className="text-xs text-red-400 font-mono leading-tight">
                    {displayError.includes("auth/invalid-credential") ? "INVALID CREDENTIALS." :
                     displayError.includes("auth/invalid-email") ? "INVALID EMAIL FORMAT." :
                     displayError.includes("auth/email-already-in-use") ? "ID ALREADY REGISTERED." :
                     displayError.includes("auth/weak-password") ? "PASSWORD TOO WEAK (MIN 6 CHARS)." :
                     "AUTHENTICATION FAILURE. RETRY."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;