import { FC, useCallback, useEffect } from 'react'; // Added memo for performance optimization
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { db } from '@/lib/firebaseConfig'; // Keep auth for auth.currentUser check
import { Link } from 'react-router-dom'; // Import Link if used in a placeholder, otherwise remove

// IMPORTANT: Import DSPETDisclosureProps from lib/types.ts
import { DSPETDisclosureProps as ImportedDSPETDisclosureProps } from '../lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import SwytchErrorBoundary from './ErrorBoundaryComponent';


// Placeholder DisclosureHeader component (assuming it's a separate component)
const DisclosureHeader: FC = () => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
    className="text-center relative"
  >
    <div
      className="absolute inset-0 bg-cover bg-center opacity-20 rounded-2xl"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
    />
    <h1 className="text-5xl lg:text-6xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins relative">
      <Sparkles className="text-cyan-400 w-12 h-12 animate-pulse" /> Swytch Disclosure
    </h1>
    {/* Assuming userId and jewelsBalance would be passed down to DisclosureHeader if it needs them */}
    {/* {userId && (
      <p className="text-gray-300 mt-4 text-center font-inter relative">
        Your JEWELS: <span className="font-bold text-cyan-400">{jewelsBalance} JEWELS</span>
      </p>
    )} */}
    {/* The ConnectButton.Custom was here in the original paste, but DisclosureHeader.tsx does not directly manage it based on your App.tsx structure */}
  </motion.div>
);

// Placeholder DisclosureContent component
const DisclosureContent: FC = () => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
    className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
  >
    <h2 className="text-2xl font-bold text-white font-poppins mb-4">Swytch PET Disclosure</h2>
    <p className="mb-4 text-gray-300 font-inter">
      The Swytch Private Energy Trust (PET) is a decentralized platform designed to empower users with financial sovereignty through gamified rewards and community governance. Participation involves risks, including cryptocurrency volatility and regulatory uncertainties.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Investment Risks:</strong> All investments in Swytch PET, including JEWELS and membership levels, are subject to market risks. Prices may fluctuate, and past performance is not indicative of future results.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Legal Disclaimer:</strong> Swytch PET operates on blockchain technology and is not a registered financial institution. Users are responsible for complying with local regulations regarding cryptocurrency transactions.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Contact:</strong> For support, reach out to our team at support@swytch.pet or join our community channels.
    </p>
  </motion.div>
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

// Use ImportedDSPETDisclosureProps as the type for the FC
const DSPETDisclosure: FC<ImportedDSPETDisclosureProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  isPending,
  authLoading,
  // Removed setShowWalletModal, autoPlay, setAutoPlay as they are not part of AppProps or are handled centrally
}) => {
  const handleAcknowledgeDisclosure = useCallback(() => { // Wrap in useCallback
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to acknowledge disclosure!');
      return;
    }
    setShowMessage('✅ Disclosure acknowledged!');
    setActiveModal('payment'); // Prompt deposit for disclosure-related actions
  }, [userId, setActiveModal, setShowMessage]); // Add dependencies

  // This useEffect will run when the component mounts or userId changes.
  // It performs a user data check and potentially sets PET member status.
  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
          // If you need to update jewelsBalance or other user data from this listener, do it here.
          // setJewelsBalance(data.jewels || 0); // Example if you want to update jewels here
        }
      }, (err) => {
        console.error('Failed to fetch user data for disclosure:', err);
        setShowMessage('⚠️ Failed to load disclosure data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal]); // Add dependencies

  // Loading state for the page itself
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
          <p>Loading Disclosure...</p>
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
            {/* DisclosureHeader should display userId and jewelsBalance if it needs them */}
            <DisclosureHeader />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <DisclosureContent />
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleAcknowledgeDisclosure} // Use the local handler
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Acknowledge Disclosure"
            >
              Acknowledge Disclosure
            </motion.button>
            <Link
              to="/terms"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
              onClick={() => setShowMessage('📜 Navigating to Terms!')}
              role="button"
              aria-label="Navigate to Terms Page"
            >
              View Terms
            </Link>
            <Link
              to="/privacy"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🔒 Navigating to Privacy!')}
              role="button"
              aria-label="Navigate to Privacy Page"
            >
              View Privacy
            </Link>
            <Link
              to="/vault"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => {
                if (!userId) { // Using userId prop for auth check
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

export default DSPETDisclosure;