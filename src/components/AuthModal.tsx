import { FC, useState } from 'react';
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
}

const AuthModal: FC<AuthModalProps> = ({ setShowMessage }) => {
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal } = useModal();
  const { signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithGithub, signInWithMicrosoft, signInWithEmail, signUpWithEmail, signInWithPhone } = useAuthUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        setShowMessage('🎉 Signed up successfully!');
      } else {
        await signInWithEmail(email, password);
        setShowMessage('🎉 Signed in successfully!');
      }
      setActiveModal(null);
    } catch (err) {
      console.error('Email auth error:', err);
      setShowMessage('⚠️ Failed to authenticate. Please check your credentials.');
    }
  };

  const handlePhoneAuth = async () => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const result = await signInWithPhone(phoneNumber, recaptchaVerifier);
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
      setActiveModal(null);
    } catch (err) {
      console.error('Code verification error:', err);
      setShowMessage('⚠️ Invalid verification code. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'auth' && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-gray-900/80' : 'bg-gray-100/80'} backdrop-blur-md bg-noise`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg p-6 max-w-md w-full mx-4 border border-rose-400/20 bg-noise`}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <motion.button
              className={`absolute top-4 right-4 text-${isDarkMode ? 'gray-300' : 'gray-700'}`}
              onClick={() => setActiveModal(null)}
              whileHover={{ scale: 1.1 }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <h2 className={`text-2xl font-bold font-poppins text-rose-400 mb-4`}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            {isPhoneAuth ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-rose-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className={`w-full p-2 rounded bg-${isDarkMode ? 'gray-700' : 'gray-300'} text-${isDarkMode ? 'gray-200' : 'gray-700'} border border-rose-400/20 focus:outline-none focus:border-cyan-500`}
                  />
                </div>
                {confirmationResult && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      className={`w-full p-2 rounded bg-${isDarkMode ? 'gray-700' : 'gray-300'} text-${isDarkMode ? 'gray-200' : 'gray-700'} border border-rose-400/20 focus:outline-none focus:border-cyan-500`}
                    />
                  </div>
                )}
                <motion.button
                  className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins w-full hover:bg-cyan-500"
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
                  <Mail className="w-5 h-5 text-rose-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className={`w-full p-2 rounded bg-${isDarkMode ? 'gray-700' : 'gray-300'} text-${isDarkMode ? 'gray-200' : 'gray-700'} border border-rose-400/20 focus:outline-none focus:border-cyan-500`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full p-2 rounded bg-${isDarkMode ? 'gray-700' : 'gray-300'} text-${isDarkMode ? 'gray-200' : 'gray-700'} border border-rose-400/20 focus:outline-none focus:border-cyan-500`}
                  />
                </div>
                {isSignUp && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-rose-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className={`w-full p-2 rounded bg-${isDarkMode ? 'gray-700' : 'gray-300'} text-${isDarkMode ? 'gray-200' : 'gray-700'} border border-rose-400/20 focus:outline-none focus:border-cyan-500`}
                    />
                  </div>
                )}
                <motion.button
                  className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins w-full hover:bg-cyan-500"
                  onClick={handleEmailAuth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </motion.button>
                <div className="flex justify-between">
                  <motion.button
                    className={`text-${isDarkMode ? 'gray-300' : 'gray-700'} hover:text-cyan-500 font-inter`}
                    onClick={() => setIsSignUp(!isSignUp)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                  </motion.button>
                  <motion.button
                    className={`text-${isDarkMode ? 'gray-300' : 'gray-700'} hover:text-cyan-500 font-inter`}
                    onClick={() => setIsPhoneAuth(true)}
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in with Phone
                  </motion.button>
                </div>
                <div className="flex flex-col gap-2">
                  <motion.button
                    className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
                    onClick={signInWithGoogle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Google
                  </motion.button>
                  <motion.button
                    className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
                    onClick={signInWithFacebook}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Facebook
                  </motion.button>
                  <motion.button
                    className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
                    onClick={signInWithTwitter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Twitter
                  </motion.button>
                  <motion.button
                    className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
                    onClick={signInWithGithub}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with GitHub
                  </motion.button>
                  <motion.button
                    className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
                    onClick={signInWithMicrosoft}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Microsoft
                  </motion.button>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <motion.button
                        className="bg-rose-400 text-white px-4 py-2 rounded-full font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
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
                    className={`text-${isDarkMode ? 'gray-300' : 'gray-700'} hover:text-cyan-500 font-inter text-sm`}
                    onClick={() => setActiveModal(null)}
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            )}
            <style>{`
              :root {
                --rose-400: #f472b6;
                --cyan-500: #22d3ee;
              }
              .dark {
                background-color: #111827;
                color: #f3f4f6;
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
