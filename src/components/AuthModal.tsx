import { FC, useState, useEffect, useRef } from 'react'; // Added useEffect and useRef for recaptcha
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, User, Wallet } from 'lucide-react';
import { useAuthUser } from '../hooks/useAuthUser';
import { useModal } from '../context/ModalContext';
import { useTheme } from '../context/ThemeContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';

interface AuthModalProps {
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  // Added setActiveModal to props as it's used in the component
  setActiveModal?: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthModal: FC<AuthModalProps> = ({ setShowMessage, setActiveModal }) => {
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal: setModalActive } = useModal(); // Renamed setActiveModal from useModal to avoid prop conflict
  const { signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithGithub, signInWithMicrosoft, signInWithEmail, signUpWithEmail, signInWithPhone } = useAuthUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null); // Ref for RecaptchaVerifier

  // Initialize RecaptchaVerifier on mount
  useEffect(() => {
    if (activeModal === 'auth' && isPhoneAuth && !recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      recaptchaVerifierRef.current.render().catch(error => console.error("Recaptcha render error:", error));
    }
    // Cleanup RecaptchaVerifier on unmount or when not needed
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [activeModal, isPhoneAuth]);


  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        setShowMessage('🎉 Signed up successfully!');
      } else {
        await signInWithEmail(email, password);
        setShowMessage('🎉 Signed in successfully!');
      }
      setModalActive(null); // Use the renamed setter
    } catch (err) {
      console.error('Email auth error:', err);
      setShowMessage('⚠️ Failed to authenticate. Please check your credentials.');
    }
  };

  const handlePhoneAuth = async () => {
    try {
      if (!recaptchaVerifierRef.current) {
        setShowMessage('⚠️ Recaptcha not initialized. Please try again.');
        return;
      }
      const result = await signInWithPhone(phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setShowMessage('ℹ️ Verification code sent to your phone.');
    } catch (err) {
      console.error('Phone auth error:', err);
      setShowMessage('⚠️ Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      await confirmationResult.confirm(verificationCode);
      setShowMessage('🎉 Phone authentication successful!');
      setModalActive(null); // Use the renamed setter
    } catch (err) {
      console.error('Code verification error:', err);
      setShowMessage('⚠️ Invalid verification code. Please try again.');
    }
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
            className={`relative bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-primary/20 bg-noise`}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <motion.button
              className={`absolute top-4 right-4 text-foreground`}
              onClick={() => setModalActive(null)} // Use the renamed setter
              whileHover={{ scale: 1.1 }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <h2 className={`text-2xl font-bold font-poppins text-primary mb-4`}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            {isPhoneAuth ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className={`w-full p-2 rounded bg-muted text-foreground border border-border focus:outline-none focus:border-secondary`}
                  />
                </div>
                {confirmationResult && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      className={`w-full p-2 rounded bg-muted text-foreground border border-border focus:outline-none focus:border-secondary`}
                    />
                  </div>
                )}
                <motion.button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-poppins w-full hover:bg-secondary"
                  onClick={confirmationResult ? handleVerifyCode : handlePhoneAuth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {confirmationResult ? 'Verify Code' : 'Send Code'}
                </motion.button>
                <div id="recaptcha-container"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className={`w-full p-2 rounded bg-muted text-foreground border border-border focus:outline-none focus:border-secondary`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full p-2 rounded bg-muted text-foreground border border-border focus:outline-none focus:border-secondary`}
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
                      className={`w-full p-2 rounded bg-muted text-foreground border border-border focus:outline-none focus:border-secondary`}
                    />
                  </div>
                )}
                <motion.button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-poppins w-full hover:bg-secondary"
                  onClick={handleEmailAuth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </motion.button>
                <div className="flex justify-between">
                  <motion.button
                    className={`text-foreground hover:text-secondary font-inter`}
                    onClick={() => setIsSignUp(!isSignUp)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                  </motion.button>
                  <motion.button
                    className={`text-foreground hover:text-secondary font-inter`}
                    onClick={() => setIsPhoneAuth(true)}
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in with Phone
                  </motion.button>
                </div>
                <div className="flex flex-col gap-2">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <motion.button
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-secondary"
                        onClick={() => {
                          openConnectModal();
                          setShowMessage('ℹ️ Connecting wallet...');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Wallet className="w-5 h-5" /> Connect Wallet
                      </motion.button>
                    )}
                  </ConnectButton.Custom>
                </div>
                <div className="text-center">
                  <Link
                    to="/dspet-privacy"
                    className={`text-foreground hover:text-secondary font-inter text-sm`}
                    onClick={() => setModalActive(null)} // Use the renamed setter
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
