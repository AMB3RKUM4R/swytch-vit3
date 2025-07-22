// src/pages/DSPETDisclosure.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

// Import PageProps and PlayerData types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Placeholder DisclosureHeader component (consider moving to components/disclosure)
const DisclosureHeader: FC = () => (
  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8">
    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
      <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Swytch PET Disclosure
    </h1>
    <p className="text-gray-300 max-w-xl mx-auto mt-4 font-inter text-center">
      Understand the risks and responsibilities of joining the PETverse.
    </p>
  </SwytchCard>
);

// Placeholder DisclosureContent component (consider moving to components/disclosure)
const DisclosureContent: FC = () => (
  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8">
    <h2 className="text-2xl font-bold text-white font-poppins mb-4">Important Information</h2>
    <p className="mb-4 text-gray-300 font-inter">
      The Swytch Private Energy Trust (PET) is a decentralized platform designed to empower users with financial sovereignty through gamified rewards and community governance. Participation involves risks, including cryptocurrency volatility and regulatory uncertainties.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Investment Risks:</strong> All interactions within Swytch PET, including JEWELS and membership levels, are subject to market risks. Prices may fluctuate, and past performance is not indicative of future results. Users should exercise caution and conduct their own research before engaging.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Legal Disclaimer:</strong> Swytch PET operates on blockchain technology and is not a registered financial institution, bank, or investment advisor. The platform does not offer financial advice. Users are solely responsible for complying with all local, national, and international regulations regarding cryptocurrency transactions, digital asset ownership, and gaming activities.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>No Gambling:</strong> Swytch PET games are designed as games of skill, and any in-game currency or item with real-world value is obtained through skill-based achievements or marketplace transactions, not through games of chance. We adhere strictly to applicable gaming laws and app store policies.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>KYC/AML:</strong> For fiat withdrawals and certain high-value transactions, Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures may be required to comply with financial regulations.
    </p>
    <p className="mb-4 text-gray-300 font-inter">
      <strong>Contact:</strong> For support or further inquiries, please reach out to our team via official channels.
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

const DSPETDisclosure: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  isPending,
  authLoading,
  initialAuthCheckComplete, // Added initialAuthCheckComplete
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null); // PlayerData state not directly used in render, but for fetching

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setPlayerData(docSnap.data() as PlayerData);
          setIsPETMember(docSnap.data().isPETMember || false);
        } else {
          setPlayerData(null);
          setIsPETMember(false);
          // Only show auth modal if auth check is complete and no user
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data for Disclosure page:', err);
        setShowMessage('⚠️ Failed to load disclosure data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      // Only show auth modal if auth check is complete and no user
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to view the disclosure!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    try {
      const shareText = encodeURIComponent("Learned about Swytch PETverse’s transparency! 📜 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // --- IMPORTANT: Removed client-side update to jewels for quest reward. ---
      // This update MUST be handled by a trusted backend (e.g., Firebase Cloud Function)
      // after the share is verified.
      // The client-side app will only log the transaction.
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_disclosure_${Date.now()}`,
        userId,
        amount: 5, // Example reward
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus, // Status is pending backend verification
        timestamp: serverTimestamp(),
        game: 'disclosure',
      });
      // await updatePlayerFirestore({ jewels: jewelsBalance + 5 }); // Removed client-side update
      setShowMessage('🎉 Shared Disclosure on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    }
  }, [userId, setShowMessage, setActiveModal]); // Removed jewelsBalance, updatePlayerFirestore from deps


  if (authLoading || isPending) {
    return null; // LoadingSpinner is handled by App.tsx
  }

  return (
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
          {/* Disclosure Header */}
          <motion.div variants={sectionVariants} className="mb-8">
            <DisclosureHeader />
          </motion.div>

          {/* Disclosure Content */}
          <motion.div variants={sectionVariants} className="mb-8">
            <DisclosureContent />
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Disclosure on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Disclosure on X
            </motion.button>
            <Link
              to="/home"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
              onClick={() => setShowMessage('🏠 Navigating to Home!')}
              role="button"
              aria-label="Navigate to Home Page"
            >
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default DSPETDisclosure;
