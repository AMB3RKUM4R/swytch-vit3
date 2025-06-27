import { useState, useEffect } from 'react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthUser } from './useAuthUser';
import { auth } from '../lib/firebaseConfig';

const PhoneLogin = () => {
  const { signInWithPhone, loading, error: authError } = useAuthUser();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const inputVariants = {
    focus: { scale: 1.02, borderColor: '#E91E63', transition: { duration: 0.2 } },
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
      },
      'expired-callback': () => {
        setLocalError('reCAPTCHA expired. Please try again.');
        setRecaptchaVerifier(null);
      },
    });
    setRecaptchaVerifier(verifier);
    return () => {
      verifier.clear();
    };
  }, []);

  const sendOtp = async () => {
    setLocalError(null);
    if (!phone.match(/^\+\d{10,15}$/)) {
      setLocalError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }
    if (!recaptchaVerifier) {
      setLocalError('reCAPTCHA not ready. Please refresh and try again.');
      return;
    }
    try {
      const result = await signInWithPhone(phone, recaptchaVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setLocalError(getFriendlyErrorMessage(err.code));
    }
  };

  const verifyOtp = async () => {
    setLocalError(null);
    if (!otp.match(/^\d{6}$/)) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      await confirmationResult?.confirm(otp);
      setLocalError(null);
      setPhone('');
      setOtp('');
      setConfirmationResult(null);
    } catch (err: any) {
      setLocalError(getFriendlyErrorMessage(err.code));
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
    <motion.div
      className="flex flex-col gap-4 text-white bg-gray-900/60 backdrop-blur-lg p-6 rounded-xl border border-rose-500/20 shadow-xl w-full max-w-sm mx-auto font-sans"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div id="recaptcha-container" className="hidden"></div>
      <motion.input
        type="tel"
        placeholder="Enter phone number (e.g., +91...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        whileFocus="focus"
        variants={inputVariants}
        aria-label="Phone number"
        disabled={loading}
      />
      <motion.button
        onClick={sendOtp}
        className="bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            className="flex flex-col gap-4"
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
              className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              whileFocus="focus"
              variants={inputVariants}
              aria-label="OTP"
              disabled={loading}
            />
            <motion.button
              onClick={verifyOtp}
              className="bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            className="text-rose-400 text-sm text-center"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {authError || localError}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhoneLogin;