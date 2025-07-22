import { FC, useState, useEffect } from 'react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthUser } from './useAuthUser';
import { auth } from '../lib/firebaseConfig';
import { useModal } from '../components/context/ModalContext';
import { useTheme } from '../components/context/ThemeContext';
import { X } from 'lucide-react';

interface PhoneLoginProps {
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const PhoneLogin: FC<PhoneLoginProps> = ({ setShowMessage }) => {
  const { signInWithPhone, loading, error: authError } = useAuthUser();
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal } = useModal();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const inputVariants = {
    focus: { scale: 1.02, borderColor: '#22d3ee', transition: { duration: 0.2 } }, // cyan-500
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('Recaptcha solved');
        setShowMessage('ℹ️ reCAPTCHA verified.');
      },
      'expired-callback': () => {
        setLocalError('reCAPTCHA expired. Please try again.');
        setShowMessage('⚠️ reCAPTCHA expired. Please try again.');
        setRecaptchaVerifier(null);
      },
    });
    setRecaptchaVerifier(verifier);
    return () => {
      verifier.clear();
    };
  }, [setShowMessage]);

  const sendOtp = async () => {
    setLocalError(null);
    if (!phone.match(/^\+\d{10,15}$/)) {
      setLocalError('Please enter a valid phone number (e.g., +1234567890)');
      setShowMessage('⚠️ Please enter a valid phone number (e.g., +1234567890)');
      return;
    }
    if (!recaptchaVerifier) {
      setLocalError('reCAPTCHA not ready. Please refresh and try again.');
      setShowMessage('⚠️ reCAPTCHA not ready. Please refresh and try again.');
      return;
    }
    try {
      const result = await signInWithPhone(phone, recaptchaVerifier);
      setConfirmationResult(result);
      setShowMessage('🎉 Verification code sent to your phone.');
    } catch (err: any) {
      const errorMsg = getFriendlyErrorMessage(err.code);
      setLocalError(errorMsg);
      setShowMessage(`⚠️ ${errorMsg}`);
    }
  };

  const verifyOtp = async () => {
    setLocalError(null);
    if (!otp.match(/^\d{6}$/)) {
      setLocalError('Please enter a valid 6-digit OTP');
      setShowMessage('⚠️ Please enter a valid 6-digit OTP');
      return;
    }
    try {
      await confirmationResult?.confirm(otp);
      setShowMessage('🎉 Phone authentication successful!');
      setPhone('');
      setOtp('');
      setConfirmationResult(null);
      setActiveModal(null);
    } catch (err: any) {
      const errorMsg = getFriendlyErrorMessage(err.code);
      setLocalError(errorMsg);
      setShowMessage(`⚠️ ${errorMsg}`);
    }
  };

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format. Use E.164 format (e.g., +1234567890).';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'phone-auth' && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-gray-900/80' : 'bg-gray-100/80'} backdrop-blur-md bg-noise`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg p-6 max-w-sm w-full mx-4 border border-rose-400/20 bg-noise`}
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
            <h2 className="text-2xl font-bold font-poppins text-rose-400 mb-4">Phone Login</h2>
            <div id="recaptcha-container" className="hidden"></div>
            <motion.input
              type="tel"
              placeholder="Enter phone number (e.g., +91...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`bg-${isDarkMode ? 'gray-700' : 'gray-300'} p-3 rounded-md border border-rose-400/20 w-full text-${isDarkMode ? 'gray-200' : 'gray-700'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter`}
              whileFocus="focus"
              variants={inputVariants}
              aria-label="Phone number"
              disabled={loading}
            />
            <motion.button
              onClick={sendOtp}
              className="bg-rose-400 text-white py-2 rounded-lg font-poppins w-full hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-4"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Send OTP"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </motion.button>
            <AnimatePresence>
              {confirmationResult && (
                <motion.div
                  className="flex flex-col gap-4 mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`bg-${isDarkMode ? 'gray-700' : 'gray-300'} p-3 rounded-md border border-rose-400/20 w-full text-${isDarkMode ? 'gray-200' : 'gray-700'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter`}
                    whileFocus="focus"
                    variants={inputVariants}
                    aria-label="OTP"
                    disabled={loading}
                  />
                  <motion.button
                    onClick={verifyOtp}
                    className="bg-rose-400 text-white py-2 rounded-lg font-poppins w-full hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    aria-label="Verify OTP"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {(authError || localError) && (
                <motion.p
                  className="text-rose-400 text-sm text-center mt-4 font-inter"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {authError || localError}
                </motion.p>
              )}
            </AnimatePresence>
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

export default PhoneLogin;
