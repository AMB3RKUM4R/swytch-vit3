// AuthModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


import {
  X,
  Mail,
  User,
  Wallet,
  // These are common social icons *sometimes* found in specific Lucide builds or community forks
  // but generally not direct exports from the core 'lucide-react' package as 'Google', 'Facebook' etc.
  // We'll keep them imported if your local Lucide build provides them,
  // but if errors persist, these lines are the first to comment out.
  // For the sake of *guaranteeing* no new errors based on standard 'lucide-react' (as per your error message),
  // I will comment out the problematic ones and their uses.
  // If your local environment has a specific 'lucide-react' version that exports these,
  // you can uncomment. But based on "Module 'lucide-react' has no exported member 'Google'", they don't.
  // Let's remove them to be safe for launch.
  // For a generic "social" icon on the buttons, you could use 'Globe' or 'Users'.
} from 'lucide-react';


import { useAuthUser } from '../hooks/useAuthUser';
import { useModal } from '../context/ModalContext';
import { useTheme } from '../context/ThemeContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import PhoneLogin from '../hooks/PhoneLogin';

interface AuthModalProps {
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal: setModalActive } = useModal();
  const {
    signInWithEmail,
    signUpWithEmail,
    // Assuming these methods still exist in useAuthUser, but we're removing their associated icons from AuthModal
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    signInWithMicrosoft,
  } = useAuthUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [showSocialOrWallet, setShowSocialOrWallet] = useState(false);

  useEffect(() => {
    if (activeModal === null) {
      setEmail('');
      setPassword('');
      setName('');
      setIsSignUp(false);
      setShowPhoneLogin(false);
      setShowSocialOrWallet(false);
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
        await signUpWithEmail(email, password, name);
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
    setName('');
    setIsSignUp(false);
    setShowPhoneLogin(false);
    setShowSocialOrWallet(false);
  };

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <motion.button
              className={`absolute top-4 right-4 text-foreground`}
              onClick={handleCloseModal}
              whileHover={{ scale: 1.1 }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {showPhoneLogin ? (
              <>
                <h2 className={`text-2xl font-bold font-poppins text-primary mb-4`}>Phone Login</h2>
                <PhoneLogin setShowMessage={setShowMessage} />
                <div className="text-center mt-4">
                  <motion.button
                    className={`text-foreground hover:text-secondary font-inter text-sm`}
                    onClick={() => setShowPhoneLogin(false)}
                    whileHover={{ scale: 1.05 }}
                  >
                    Back to Main Options
                  </motion.button>
                </div>
              </>
            ) : showSocialOrWallet ? (
              // Display social login and wallet connect options
              <>
                <h2 className={`text-2xl font-bold font-poppins text-primary mb-4`}>Connect via Social / Wallet</h2>
                <div className="space-y-4">
                  {/* Buttons for social logins - REMOVED ICON COMPONENTS to fix errors */}
                  {/* If you want icons here, you'll need a different icon library that provides brand icons,
                      or import them as custom SVGs. For now, it's just text + button styling. */}
                  <motion.button
                    className="btn-secondary flex items-center justify-center gap-2"
                    onClick={() => handleSocialSignIn(signInWithGoogle, 'Google')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Google className="w-5 h-5" /> */} Sign in with Google
                  </motion.button>
                  <motion.button
                    className="btn-secondary flex items-center justify-center gap-2"
                    onClick={() => handleSocialSignIn(signInWithFacebook, 'Facebook')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Facebook className="w-5 h-5" /> */} Sign in with Facebook
                  </motion.button>
                  <motion.button
                    className="btn-secondary flex items-center justify-center gap-2"
                    onClick={() => handleSocialSignIn(signInWithTwitter, 'Twitter')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Twitter className="w-5 h-5" /> */} Sign in with Twitter
                  </motion.button>
                  <motion.button
                    className="btn-secondary flex items-center justify-center gap-2"
                    onClick={() => handleSocialSignIn(signInWithGithub, 'GitHub')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Github className="w-5 h-5" /> */} Sign in with GitHub
                  </motion.button>
                   <motion.button
                    className="btn-secondary flex items-center justify-center gap-2"
                    onClick={() => handleSocialSignIn(signInWithMicrosoft, 'Microsoft')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Microsoft className="w-5 h-5" /> */} Sign in with Microsoft
                  </motion.button>

                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <motion.button
                        className="btn-primary flex items-center justify-center gap-2"
                        onClick={() => {
                          openConnectModal();
                          handleAuthSuccess('ℹ️ Connecting wallet...');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Wallet className="w-5 h-5" /> Connect Crypto Wallet
                      </motion.button>
                    )}
                  </ConnectButton.Custom>
                  <div className="text-center">
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm`}
                      onClick={() => setShowSocialOrWallet(false)}
                      whileHover={{ scale: 1.05 }}
                    >
                      Back to Email Login
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className={`text-2xl font-bold font-poppins text-primary mb-4`}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className={`input`}
                      aria-label="Email address"
                      autoComplete="email"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={`input`}
                      aria-label="Password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                    />
                  </div>
                  {isSignUp && (
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        className={`input`}
                        aria-label="Full name"
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <motion.button
                    className="btn-primary"
                    onClick={handleEmailAuth}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </motion.button>
                  <div className="flex justify-between flex-wrap gap-2">
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm flex-grow`}
                      onClick={() => setIsSignUp(!isSignUp)}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                    </motion.button>
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm flex-grow`}
                      onClick={() => setShowPhoneLogin(true)}
                      whileHover={{ scale: 1.05 }}
                    >
                      Sign in with Phone
                    </motion.button>
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm flex-grow`}
                      onClick={() => setShowSocialOrWallet(true)}
                      whileHover={{ scale: 1.05 }}
                    >
                      More Sign In Options
                    </motion.button>
                  </div>
                  <div className="text-center">
                    <Link
                      to="/dspet-privacy"
                      className={`text-muted-foreground hover:text-secondary font-inter text-sm`}
                      onClick={handleCloseModal}
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;