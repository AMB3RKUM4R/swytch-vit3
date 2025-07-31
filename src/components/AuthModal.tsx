// src/components/AuthModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Wallet, Phone, Sparkles, Globe } from 'lucide-react';
import { useAuthUser } from '../hooks/useAuthUser';
import { useModal } from './context/ModalContext';
import { useTheme } from './context/ThemeContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import StarfieldBackground from './StarfieldBackground';

interface AuthModalProps {
  setShowMessage: (message: string) => void;
}

// Animation variants for modal and orbiting buttons
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};



const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  useTheme();
  const { activeModal, setActiveModal: setModalActive } = useModal();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
  } = useAuthUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [view, setView] = useState<'main' | 'phone' | 'more'>('main');

  useEffect(() => {
    if (activeModal === null) {
      setEmail('');
      setPassword('');
      setIsSignUp(false);
      setView('main');
    }
  }, [activeModal]);

  const handleAuthSuccess = (message: string) => {
    setShowMessage(message);
    setModalActive(null);
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    console.error('Authentication error:', error);
    setShowMessage(error.message || defaultMessage);
  };

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        handleAuthSuccess('🎉 Signed up successfully!');
      } else {
        await signInWithEmail(email, password);
        handleAuthSuccess('🎉 Signed in successfully!');
      }
    } catch (err) {
      handleAuthError(err, '⚠️ Authentication failed. Please try again.');
    }
  };

  const handleSocialSignIn = async (providerFn: () => Promise<void>, providerName: string) => {
    try {
      await providerFn();
      handleAuthSuccess(`🎉 Signed in with ${providerName} successfully!`);
    } catch (err) {
      handleAuthError(err, `⚠️ Failed to sign in with ${providerName}.`);
    }
  };

  const handleCloseModal = () => {
    setModalActive(null);
    setEmail('');
    setPassword('');
    setIsSignUp(false);
    setView('main');
  };

  const inputClassName = `input-system bg-input/50 text-foreground p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full font-inter`;

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md bg-noise"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalVariants}
        >
          <StarfieldBackground />
          <motion.div
            className="relative holographic-card p-8 rounded-lg max-w-md w-full mx-4"
            style={{ backgroundImage: 'url(https://via.placeholder.com/500x500?text=Cosmic+Auth)' }}
          >
            <motion.button
              className="absolute top-4 right-4 text-foreground"
              onClick={handleCloseModal}
              whileHover={{ scale: 1.1 }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6 text-[hsl(var(--secondary-hsl))] animate-neon-pulse" />
            </motion.button>
            <h2 className="text-3xl font-russo text-primary mb-6 text-center text-glow-primary">
              {isSignUp ? 'Initiate Profile' : 'Access Protocol'}
            </h2>

            {view === 'main' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[hsl(var(--primary-hsl))]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Operative ID (Email)"
                    className={inputClassName}
                    autoComplete="email"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[hsl(var(--primary-hsl))]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Access Key (Password)"
                    className={inputClassName}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                </div>
                <motion.button
                  className="btn-primary w-full"
                  onClick={handleEmailAuth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSignUp ? 'Initiate' : 'Access'}
                </motion.button>
                <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                  <h3 className="text-sm text-muted-foreground text-center">Or connect with:</h3>
                  <SocialButton
                    onClick={() => handleSocialSignIn(signInWithGoogle, 'Google Nexus')}
                    icon={<Sparkles className="w-5 h-5" />}
                    label="Google Nexus"
                  />
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <motion.button
                        className="btn-secondary w-full"
                        onClick={() => {
                          openConnectModal();
                          handleAuthSuccess('ℹ️ Connecting crypto wallet...');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Wallet className="w-5 h-5" /> Connect Neural Link
                      </motion.button>
                    )}
                  </ConnectButton.Custom>
                </div>
                <div className="flex justify-between mt-4">
                  <motion.button
                    className="text-foreground hover:text-secondary font-inter text-sm"
                    onClick={() => setIsSignUp(!isSignUp)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isSignUp ? 'Existing Operative?' : 'New Operative?'}
                  </motion.button>
                  <motion.button
                    className="text-foreground hover:text-secondary font-inter text-sm"
                    onClick={() => setView('more')}
                    whileHover={{ scale: 1.05 }}
                  >
                    More Options
                  </motion.button>
                </div>
              </div>
            )}

            {view === 'more' && (
              <div className="relative flex flex-col items-center">
                <h3 className="text-xl font-russo text-primary text-center mb-4 text-glow-primary">Orbital Access Network</h3>
                <div className="space-y-4">
                  <SocialButton
                    onClick={() => handleSocialSignIn(signInWithGoogle, 'Google Nexus')}
                    icon={<Sparkles className="w-5 h-5" />}
                    label="Google Nexus"
                  />
                  <SocialButton
                    onClick={() => handleSocialSignIn(signInWithFacebook, 'Meta-Network')}
                    icon={<Globe className="w-5 h-5" />}
                    label="Meta-Network"
                  />
                  <motion.button
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                    onClick={() => setView('phone')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone className="w-5 h-5" /> Secure Comms (Phone)
                  </motion.button>
                </div>
                <motion.button
                  className="text-muted-foreground hover:text-secondary font-inter text-sm mt-6"
                  onClick={() => setView('main')}
                  whileHover={{ scale: 1.05 }}
                >
                  Back to Email Access
                </motion.button>
              </div>
            )}

            {view === 'phone' && (
              <div className="relative flex flex-col items-center">
                <h3 className="text-xl font-russo text-primary text-center mb-4 text-glow-primary">Secure Comms Access</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  For secure access via phone, please enter your number and we will send a verification code.
                </p>
                <motion.button
                  className="text-muted-foreground hover:text-secondary font-inter text-sm mt-4"
                  onClick={() => setView('more')}
                  whileHover={{ scale: 1.05 }}
                >
                  Back to More Options
                </motion.button>
              </div>
            )}

            <div className="text-center mt-6">
              <Link
                to="/dspet-privacy"
                className="text-muted-foreground hover:text-secondary font-inter text-sm"
                onClick={handleCloseModal}
              >
                Privacy Protocol
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// SocialButton component for social login options
interface SocialButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const SocialButton: FC<SocialButtonProps> = ({ onClick, icon, label }) => (
  <motion.button
    className="btn-secondary w-full flex items-center justify-center gap-2"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    type="button"
  >
    {icon}
    {label}
  </motion.button>
);

export default AuthModal;