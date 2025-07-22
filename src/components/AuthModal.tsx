// src/components/AuthModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Wallet } from 'lucide-react'; // Only Lucide icons that are directly exported
import { useAuthUser } from '../hooks/useAuthUser';
import { useModal } from './context/ModalContext';
import { useTheme } from './context/ThemeContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import PhoneLogin from '../hooks/PhoneLogin'; // Assuming PhoneLogin is in hooks/

interface AuthModalProps {
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal: setModalActive } = useModal();
  const {
    signInWithEmail,
    signUpWithEmail,
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

  // Reset state when modal closes
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
    setModalActive(null); // Close modal on success
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    console.error('Authentication error:', error);
    // Display a user-friendly message, falling back to default
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
    // Reset all internal states
    setEmail('');
    setPassword('');
    setName('');
    setIsSignUp(false);
    setShowPhoneLogin(false);
    setShowSocialOrWallet(false);
  };

  // Common input styling for consistency
  const inputClassName = `bg-${isDarkMode ? 'gray-700' : 'gray-300'} p-3 rounded-md border border-rose-400/20 w-full text-${isDarkMode ? 'gray-200' : 'gray-700'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter`;
  const buttonBaseClassName = `py-2 px-4 rounded-lg font-semibold font-poppins w-full flex items-center justify-center gap-2`;

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
            className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'} p-6 rounded-lg max-w-sm w-full mx-4 border border-rose-400/20`}
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
              // Phone Login View
              <>
                <h2 className={`text-2xl font-bold font-poppins text-primary mb-4`}>Phone Login</h2>
                <PhoneLogin setShowMessage={setShowMessage} />
                <div className="text-center mt-4">
                  <motion.button
                    className={`text-foreground hover:text-secondary font-inter text-sm`}
                    onClick={() => setModalActive('auth')} // Go back to main auth modal
                    whileHover={{ scale: 1.05 }}
                  >
                    Back to Main Options
                  </motion.button>
                </div>
              </>
            ) : showSocialOrWallet ? (
              // Social/Wallet Connect View
              <>
                <h2 className={`text-2xl font-bold font-poppins text-primary mb-4`}>Connect via Social / Wallet</h2>
                <div className="space-y-4">
                  {/* Social Login Buttons */}
                  <motion.button
                    className={`btn-secondary ${buttonBaseClassName}`}
                    onClick={() => handleSocialSignIn(signInWithGoogle, 'Google')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Google
                  </motion.button>
                  <motion.button
                    className={`btn-secondary ${buttonBaseClassName}`}
                    onClick={() => handleSocialSignIn(signInWithFacebook, 'Facebook')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Facebook
                  </motion.button>
                  <motion.button
                    className={`btn-secondary ${buttonBaseClassName}`}
                    onClick={() => handleSocialSignIn(signInWithTwitter, 'Twitter')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Twitter
                  </motion.button>
                  <motion.button
                    className={`btn-secondary ${buttonBaseClassName}`}
                    onClick={() => handleSocialSignIn(signInWithGithub, 'GitHub')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with GitHub
                  </motion.button>
                   <motion.button
                    className={`btn-secondary ${buttonBaseClassName}`}
                    onClick={() => handleSocialSignIn(signInWithMicrosoft, 'Microsoft')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Microsoft
                  </motion.button>

                  {/* RainbowKit Connect Button for Crypto Wallet */}
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <motion.button
                        className={`btn-primary ${buttonBaseClassName}`}
                        onClick={() => {
                          openConnectModal();
                          handleAuthSuccess('ℹ️ Connecting crypto wallet...');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Wallet className="w-5 h-5" /> Connect Crypto Wallet
                      </motion.button>
                    )}
                  </ConnectButton.Custom>

                  <div className="text-center mt-4">
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
              // Email/Password Login/Sign Up View
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
                      className={inputClassName}
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
                      className={inputClassName}
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
                        className={inputClassName}
                        aria-label="Full name"
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <motion.button
                    className={`btn-primary ${buttonBaseClassName}`}
                    onClick={handleEmailAuth}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </motion.button>
                  <div className="flex justify-between flex-wrap gap-2 mt-4">
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm flex-grow`}
                      onClick={() => setIsSignUp(!isSignUp)}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                    </motion.button>
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm flex-grow`}
                      onClick={() => setModalActive('phone-auth')} // Changed to set activeModal to 'phone-auth'
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
                  <div className="text-center mt-4">
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
