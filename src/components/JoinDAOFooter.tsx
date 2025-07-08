import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Dispatch, SetStateAction } from 'react';

interface JoinDAOFooterProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
}

const JoinDAOFooter: React.FC<JoinDAOFooterProps> = ({ userId, setActiveModal, setShowMessage, setShowWalletModal }) => {
  const [email, setEmail] = useState('');

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to join the DAO!');
      setActiveModal('auth');
      return;
    }
    if (!email.trim()) {
      setShowMessage('⚠️ Please enter a valid email!');
      setActiveModal('error');
      return;
    }
    try {
      setShowMessage('ℹ️ Opening payment for DAO signup. Admin will process your request.');
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
    <motion.div variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }}} className="relative space-y-6 text-center">
      <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4 font-poppins">
        <Send className="w-10 h-10 text-rose-400 animate-pulse" /> Join the PETverse DAO
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
        Become a PET and shape the future of Swytch.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <form onSubmit={handleEmailSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 p-3 bg-gray-800 text-white rounded-md border border-rose-500/20 focus:border-rose-500"
            required
            aria-label="Email for DAO signup"
            disabled={!userId}
          />
          <motion.button
            type="submit"
            className="px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-md font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            disabled={!userId}
            aria-label="Join DAO"
          >
            Join Now <Send className="w-5 h-5" />
          </motion.button>
        </form>
        <motion.div className="mt-4">
          <ConnectButton />
        </motion.div>
      </motion.div>
      <p className="text-sm text-rose-300 italic text-center max-w-xl mx-auto font-inter">
        Swytch is yours. Every vote, every proposal, every JEWEL shapes our decentralized future. Join the PETverse and own the revolution.
      </p>
    </motion.div>
  );
};

export default JoinDAOFooter;