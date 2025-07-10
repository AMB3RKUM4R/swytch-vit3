import { FC, useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchCard from '../components/SwytchCard';
// Removed AuthModal and PaymentModal imports as they are globally managed by App.tsx
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { useModal } from '../context/ModalContext';

// IMPORTANT: Import DSPETPrivacyProps from your lib/types.ts file
import { DSPETPrivacyProps as ImportedDSPETPrivacyProps } from '../lib/types';


// Placeholder PrivacyHeader component
const PrivacyHeader: FC = () => (
  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8">
    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
      <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> DSPET Privacy Policy
    </h1>
    <p className="text-gray-300 max-w-xl mx-auto mt-4 font-inter">
      Your privacy is our priority in the Swytch PETverse.
    </p>
  </SwytchCard>
);

// Placeholder PrivacyContent component
const PrivacyContent: FC = () => (
  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8">
    <h2 className="text-2xl font-bold text-white font-poppins mb-4">Swytch PET Privacy Policy</h2>
    <p className="mb-4 text-gray-300 font-inter">
      Swytch Private Energy Trust (PET) is committed to protecting your privacy. We collect minimal personal data, such as wallet addresses and transaction details, stored securely on decentralized networks.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Data Collection:</strong> We collect only what’s necessary for gameplay, rewards, and governance, such as wallet addresses and JEWELS transactions, all encrypted and stored on-chain.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Data Usage:</strong> Your data is used to enhance your PETverse experience, including quest rewards and DAO voting. We do not share data with third parties without consent.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Contact:</strong> For privacy concerns, reach out to support@swytch.pet or join our community channels.
    </p>
  </SwytchCard>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

// Use ImportedDSPETPrivacyProps as the type for the FC
const DSPETPrivacy: FC<ImportedDSPETPrivacyProps> = ({
  userId,
  activeModal,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  isPending,
  authLoading,
  // Removed setShowWalletModal from destructuring as it's not part of AppProps/DSPETPrivacyProps anymore
  // Removed autoPlay and setAutoPlay as they were optional in previous AppProps but not used here
}) => {
  // Removed const { showMessage } = useModal(); as it's redundant (setShowMessage prop is used)
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  const shareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    try {
      const shareText = encodeURIComponent("Swytch PETverse prioritizes privacy! 🔒 Learn more at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), { // Ensure 'Transactions' matches your Firestore rule
        transactionId,
        userId,
        amount: 5,
        currency: 'JEWELS',
        transactionType: 'deposit',
        status: 'pending',
        timestamp: serverTimestamp(),
        game: 'privacy',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      await updatePlayerFirestore({ jewels: jewelsBalance + 5 });
      setShowMessage('🎉 Shared Privacy Policy on X! +5 JEWELS');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]); // Added missing dependencies

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId); // Ensure 'Players' matches Firestore collection name
      const unsubscribe = onSnapshot(userRef, (docSnap) => { // Renamed 'doc' to 'docSnap' for clarity
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
        }
      }, (err) => {
        console.error('Failed to fetch user data:', err);
        setShowMessage('⚠️ Failed to load privacy data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal]);

  if (authLoading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Sparkles className="w-10 h-10 text-rose-400 animate-pulse mx-auto mb-4" />
          <p>Loading Privacy...</p>
        </motion.div>
      </div>
    );
  }

  return (
    // FIX: Pass the actual props to SwytchErrorBoundary
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white font-inter bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="fixed inset-0 pointer-events-none z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-cyan-500/40 to-rose-400/30 rounded-full opacity-30 blur-3xl"
            variants={flareVariants}
            animate="animate"
            style={{ top: "33%", left: "33%" }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-cyan-400/20 rounded-full opacity-20 blur-2xl"
            variants={flareVariants}
            animate="animate"
            style={{ top: "50%", right: "25%" }}
          />
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-30"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              variants={particleVariants}
              animate="animate"
            />
          ))}
        </motion.div>

        <motion.div className="relative z-10 max-w-6xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          <motion.div variants={sectionVariants}>
            <PrivacyHeader />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <PrivacyContent />
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={shareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Privacy Policy on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Privacy Policy on X
            </motion.button>
            <Link
              to="/disclosure"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
              onClick={() => setShowMessage('📜 Navigating to Disclosure!')}
              role="button"
              aria-label="Navigate to Disclosure Page"
            >
              View Disclosure
            </Link>
            <Link
              to="/terms"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('📜 Navigating to Terms!')}
              role="button"
              aria-label="Navigate to Terms Page"
            >
              View Terms
            </Link>
            <Link
              to="/vault"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => {
                if (!userId) {
                  setShowMessage('⚠️ Sign in to access Vault!');
                  setActiveModal('auth');
                } else {
                  setShowMessage('💰 Navigating to Vault!');
                }
              }}
              role="button"
              aria-label="Navigate to Vault Page"
            >
              Visit Vault
            </Link>
            <Link
              to="/games"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🎮 Navigating to Games!')}
              role="button"
              aria-label="Navigate to Games Page"
            >
              Explore Games
            </Link>
          </motion.div>
        </motion.div>
        {/* Modals are rendered by App.tsx, so no need to render them here again */}
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default DSPETPrivacy;