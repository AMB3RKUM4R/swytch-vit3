import { useState } from 'react';
import { auth } from '../lib/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

const PhoneLogin = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation Variants
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

  const sendOtp = async () => {
    setError(null);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            console.log('Recaptcha solved:', response);
          },
          'expired-callback': () => {
            console.warn('Recaptcha expired. Try again.');
          },
        });
        await window.recaptchaVerifier.render();
      }

      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error('OTP send failed:', err);
      setError(err.message || 'Failed to send OTP.');
    }
  };

  const verifyOtp = async () => {
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      alert('Login successful!');
    } catch (err: any) {
      console.error('OTP verify failed:', err);
      setError('Invalid OTP. Please try again.');
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
      />
      <motion.button
        onClick={sendOtp}
        className="bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Send OTP"
      >
        Send OTP
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
            />
            <motion.button
              onClick={verifyOtp}
              className="bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Verify OTP"
            >
              Verify
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-rose-400 text-sm text-center"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhoneLogin;