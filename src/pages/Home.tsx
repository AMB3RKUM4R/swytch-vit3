// src/pages/Home.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

// Import PageProps and other types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import new modular components for Home page
import UserOverviewCard from '../components/home/UserOverviewCard';
import MembershipStatusOverview from '../components/home/MembershipStatusOverview';
import QuickAccessGames from '../components/home/QuickAccessGames';
import CoreFeaturesShowcase from '../components/home/CoreFeaturesShowcase';
import ActionButtonsPanel from '../components/home/ActionButtonsPanel';

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

const Home: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  goldBalance,
  isPending,
  authLoading,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

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
          setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
          setActiveModal('auth');
        }
      }, (err) => {
        console.error('Failed to fetch user data for Home page:', err);
        setShowMessage('⚠️ Failed to load home data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      setShowMessage('⚠️ Please sign in to explore the PETverse!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    try {
      const shareText = encodeURIComponent("Joined the Swytch PETverse! 🌟 Explore at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // Log transaction for sharing
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_home_${Date.now()}`,
        userId,
        amount: 5, // Example reward
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'success' as TransactionStatus, // Assuming immediate reward for sharing
        timestamp: serverTimestamp(),
        game: 'home',
      });
      await updatePlayerFirestore({ jewels: jewelsBalance + 5 });
      setShowMessage('🎉 Shared PETverse on X! +5 JEWELS');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    }
  }, [userId, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]);


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
          <h1 className="text-4xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mb-8">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Welcome to Swytch PETverse
          </h1>

          {/* User Overview Card */}
          <motion.div variants={sectionVariants} className="mb-8">
            <UserOverviewCard
              username={playerData?.username || 'Guest'}
              jewelsBalance={jewelsBalance}
              goldBalance={goldBalance}
              isPETMember={false}
              userId={userId}
              walletAddress={playerData?.walletAddress || null}
            />
          </motion.div>

          {/* Membership Status Overview */}
          <motion.div variants={sectionVariants} className="mb-8">
            <MembershipStatusOverview
              membership={playerData?.membership || 'none'}
              isPETMember={false}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Quick Access Games */}
          <motion.div variants={sectionVariants} className="mb-8">
            <QuickAccessGames
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Core Features Showcase */}
          <motion.div variants={sectionVariants} className="mb-8">
            <CoreFeaturesShowcase
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Action Buttons Panel */}
          <motion.div variants={sectionVariants} className="mb-8">
            <ActionButtonsPanel
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
              handleShareOnX={handleShareOnX}
            />
          </motion.div>

          {/* Existing links, potentially moved into ActionButtonsPanel or simplified */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share PETverse on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share PETverse on X
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
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Home;
