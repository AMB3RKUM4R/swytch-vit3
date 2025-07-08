import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { Dispatch, SetStateAction } from 'react';

interface EmailSignupProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
}

const EmailSignup: React.FC<EmailSignupProps> = ({ userId, setShowMessage, setActiveModal, setShowWalletModal }) => {
  const [email, setEmail] = useState('');

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to join the PETverse!');
      setActiveModal('auth');
      return;
    }
    if (!email.trim()) {
      setShowMessage('⚠️ Please enter a valid email!');
      setActiveModal('error');
      return;
    }
    try {
      setShowMessage('ℹ️ Opening payment for email signup. Admin will process your request.');
      setActiveModal('payment');
      setShowWalletModal(true);
      setEmail('');
    } catch (err) {
      console.error('Email signup error:', err);
      setShowMessage('⚠️ Failed to initiate signup. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 sm:p-16 border border-rose-500/20 shadow-2xl hover:shadow-rose-400/50 transition-all text-center"
      aria-label="Email Signup Section"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
      <div className="relative space-y-8">
        <h3 className="text-4xl sm:text-5xl font-bold text-white flex items-center justify-center gap-4 font-poppins">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 animate-pulse" /> Stay in the Orbit
        </h3>
        <p className="text-lg sm:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-inter">
          Sign up for cosmic updates, exclusive quests, and early access to the PETverse.
        </p>
        <form onSubmit={handleEmailSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 p-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 outline-none"
            required
            aria-label="Email input"
            disabled={!userId}
          />
          <motion.button
            type="submit"
            className="px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-md font-semibold font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Submit email"
            disabled={!userId}
          >
            Join Now
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default EmailSignup;