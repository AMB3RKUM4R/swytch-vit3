import { FC, useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchCard from '../components/SwytchCard';
// These components are likely used within Membership, but removing direct imports for global modals.
// import AuthModal from '../components/AuthModal';
// import PaymentModal from '../components/PaymentModal';
import SwytchDailyQuests from '../components/SwytchDailyQuests'; // Assuming this is needed in Membership
import LorePreview from '../components/LorePreview'; // Assuming this is needed in Membership
// Page-specific components for Membership
import SwytchMembershipComponent from '../components/MembershipUpgrade'; // Renamed to avoid conflict with page name
import MembershipBenefits from '../components/MembershipBenefits';
import MembershipUpgrade from '../components/MembershipUpgrade'; // Assuming this is used for specific upgrade calls
import FeatureCards from '../components/FeatureCards';
import ExplanationHero from '../components/ExplanationHero';
import ExplanationCTA from '../components/ExplanationCTA';
import ExplanationTestimonials from '../components/ExplanationTestimonials';
import SwytchLevelsHero from '../components/SwytchLevelsHero'; // Assuming this is used
import SwytchLevelsGrid from '../components/SwytchLevelsGrid'; // Assuming this is used
import SwytchLevelsCTA from '../components/SwytchLevelsCTA'; // Assuming this is used
import PETTestimonials from '../components/PETTestimonials'; // Assuming this is used
import TestimonialsCarousel from '../components/TestimonialsCarousel'; // Assuming this is used
import FinalCTA from '../components/FinalCTA'; // Assuming this is used
import EmailSignup from '../components/EmailSignup'; // Assuming this is used
import CosmicHero from '../components/CosmicHero'; // Assuming this is used
import TrustMarketCTA from '../components/TrustMarketCTA'; // Assuming this is used

import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { useModal } from '../context/ModalContext';

// IMPORTANT: Import PageProps, SupportedCurrency, and TransactionType from your lib/types.ts file
import { PageProps as ImportedPageProps, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';


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

// This 'games' array seems copied into multiple pages. Consider moving to a central constants file.
const games = [
  { id: 'bingo', title: 'Bingo', path: '/games/bingo', description: 'Match numbers and win big!' },
  { id: 'blackjack', title: 'Blackjack', path: '/games/blackjack', description: 'Beat the dealer to 21!' },
  { id: 'bridge', title: 'Bridge', path: '/games/bridge', description: 'Outsmart opponents in this classic!' },
  { id: 'caribbean-stud', title: 'Caribbean Stud', path: '/games/caribbean-stud', description: 'Play poker against the house!' },
  { id: 'fortune-wheel', title: 'Fortune Wheel', path: '/games/fortune-wheel', description: 'Spin for epic rewards!' },
  { id: 'horse-racing', title: 'Horse Racing', path: '/games/horse-racing', description: 'Bet on the fastest horse!' },
  { id: 'pontoon', title: 'Pontoon', path: '/games/pontoon', description: 'Get closer to 21 than the dealer!' },
  { id: 'red-dog', title: 'Red Dog', path: '/games/red-dog', description: 'Predict the card spread!' },
  { id: 'rocket-crash', title: 'Rocket Crash', path: '/games/rocket-crash', description: 'Cash out before the crash!' },
  { id: 'scratch-cards', title: 'Scratch Cards', path: '/games/scratch-cards', description: 'Scratch to reveal prizes!' },
  { id: 'solitaire', title: 'Solitaire', path: '/games/solitaire', description: 'Master the classic card game!' },
  { id: 'crypto-quest', title: 'Crypto Quest (Coming Soon)', path: '#', description: 'Embark on a blockchain adventure!', comingSoon: true },
  { id: 'nft-rumble', title: 'NFT Rumble (Coming Soon)', path: '#', description: 'Battle with NFTs for rewards!', comingSoon: true },
];


// Use ImportedPageProps as the type for the FC
const Membership: FC<ImportedPageProps> = ({
  userId,
  activeModal,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  isPending,
  authLoading,
  // Removed setShowWalletModal from destructuring as it's not part of AppProps/PageProps anymore
  // Removed autoPlay and setAutoPlay as they were optional in previous AppProps but not used here
}) => {
  // Removed const { showMessage } = useModal(); as it's redundant (setShowMessage prop is used)
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [visibleGames, setVisibleGames] = useState(games.slice(0, 6));
  const [hasMore, setHasMore] = useState<boolean>(true);


  const loadMoreGames = useCallback(() => {
    if (visibleGames.length >= games.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setVisibleGames((prev) => [
        ...prev,
        ...games.slice(prev.length, prev.length + 3),
      ]);
    }, 500);
  }, [visibleGames]); // Removed `games` from deps as it's a constant

  const shareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    try {
      const shareText = encodeURIComponent("Upgrading my PETverse Membership! 🌟 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency, // FIX: Use SupportedCurrency type, no need for redundant type casting
        transactionType: 'deposit' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      await updatePlayerFirestore({ jewels: jewelsBalance + 5 });
      setShowMessage('🎉 Shared Membership on X! +5 JEWELS');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]); // Added missing deps

  const handleUpgradeClick = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to upgrade membership!');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: 99, // Example amount for membership upgrade
        currency: 'JEWELS' as SupportedCurrency, // FIX: Use SupportedCurrency type
        transactionType: 'membership' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      setShowMessage('ℹ️ Opening payment for PET Membership upgrade. Admin will process your request.');
      setActiveModal('payment');
      // Removed setShowWalletModal(true); here as it's handled by setActiveModal('auth') or PaymentModal itself
    } catch (err) {
      console.error('Membership upgrade error:', err);
      setShowMessage('⚠️ Failed to initiate membership upgrade. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, setShowMessage, setActiveModal]); // Removed setShowWalletModal from deps

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => { // Renamed 'doc' to 'docSnap' for clarity
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
        }
      }, (err) => {
        console.error('Failed to fetch user data:', err);
        setShowMessage('⚠️ Failed to load membership data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setShowMessage('⚠️ Please sign in to explore membership!');
      setActiveModal('auth');
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
          <p>Loading Membership...</p>
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
            {/* The main content for Membership page likely starts here. */}
            {/* SwytchLevelsHero, SwytchLevelsGrid, MembershipBenefits, MembershipUpgrade, FeatureCards,
                ExplanationHero, ExplanationTestimonials, SwytchLevelsCTA, ExplanationCTA,
                CosmicHero, PETTestimonials, TestimonialsCarousel, FinalCTA, EmailSignup, TrustMarketCTA
                These components are likely relevant to the Membership page content */}
            <SwytchLevelsHero
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
              mousePosition={{x: 0, y: 0}} // Pass a default or actual mousePosition if needed
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            {/* This assumes currentLevel, isPending, authLoading are relevant for SwytchLevelsGrid */}
            <SwytchLevelsGrid
              userId={userId}
              currentLevel={0} // Pass actual currentLevel if needed
              isPending={isPending}
              authLoading={authLoading}
              updatePlayerFirestore={updatePlayerFirestore}
              handlePurchaseLevel={handleUpgradeClick} // Re-using handleUpgradeClick for level purchase
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <MembershipBenefits />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <MembershipUpgrade // This might be a specific component that triggers handleUpgradeClick
              userId={userId}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <FeatureCards />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <ExplanationHero
                userId={userId}
                goldBalance={0} // Pass actual goldBalance
                mousePosition={{x: 0, y: 0}} // Pass actual mousePosition
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <ExplanationTestimonials />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <SwytchLevelsCTA />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <ExplanationCTA />
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={shareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Membership on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Membership on X
            </motion.button>
            <Link
              to="/games"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
              onClick={() => setShowMessage('🎮 Navigating to Games!')}
              role="button"
              aria-label="Navigate to Games Page"
            >
              Explore Games
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
              to="/market"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🛒 Navigating to Market!')}
              role="button"
              aria-label="Navigate to Market Page"
            >
              Visit Market
            </Link>
            <Link
              to="/shop"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🛒 Navigating to Shop!')}
              role="button"
              aria-label="Navigate to Shop Page"
            >
              Visit Shop
            </Link>
            <Link
              to="/community"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('👥 Navigating to Community!')}
              role="button"
              aria-label="Navigate to Community Page"
            >
              Community
            </Link>
            <Link
              to="/benefits"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🌟 Navigating to Benefits!')}
              role="button"
              aria-label="Navigate to Benefits Page"
            >
              Benefits
            </Link>
          </motion.div>
        </motion.div>
        {/* Modals are rendered by App.tsx, so no need to render them here again */}
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Membership;