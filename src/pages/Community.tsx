// src/pages/Community.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';

// Import PageProps and Quest types
import { PageProps, Quest, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import modular components for Community page
import CommunityHero from '../components/community/CommunityHero';
import CommunityFeatures from '../components/community/CommunityFeatures';
import CommunityChat from '../components/community/CommunityChat';
import CommunityRankings from '../components/community/CommunityRankings';


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

const initialQuests: Quest[] = [
  { id: "community-visit", title: "Visit Community Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "community-share", title: "Share Community on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const Community: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  jewelsBalance,
  isPending,
  authLoading,
  initialAuthCheckComplete, // Added initialAuthCheckComplete
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null); // PlayerData state not directly used in render, but for fetching
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [, setIsModalLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setIsPETMember(data.isPETMember || false);
          const mergedQuests = initialQuests.map((initialQuest) => {
            const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id);
            return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
          });
          setQuests(mergedQuests);

          // Log visit quest completion, actual reward by backend
          if (!mergedQuests.find((q) => q.id === "community-visit")?.completed) {
            setShowMessage('🎉 Quest "Visit Community Page" completed! Reward pending verification.');
            // This would trigger a backend Cloud Function to update quests and jewels
            // Example: call a Cloud Function via fetch or simple Firestore write to a 'quest_completion_requests' collection
          }

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
        console.error('Failed to fetch user data for Community page:', err);
        setShowMessage('⚠️ Failed to load community data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      // Only show auth modal if auth check is complete and no user
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to join the community!');
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
    setIsModalLoading(true);
    const shareQuest = quests.find((q) => q.id === "community-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Joined the vibrant Swytch PETverse community! 👥 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // --- IMPORTANT: Quest completion logic now requires backend Cloud Function ---
      // The client-side app should not directly update 'quests' or 'jewels'
      // due to strict Firestore rules.
      //
      // const updatedQuests = quests.map((q) =>
      //   q.id === "community-share" ? { ...q, progress: 1, completed: true } : q
      // );
      // setQuests(updatedQuests); // Optimistic local update for UI
      //
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId: `${userId}_share_community_${Date.now()}`,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS' as SupportedCurrency,
          transactionType: 'quest-reward' as TransactionType,
          status: 'pending' as TransactionStatus, // Status is pending backend verification
          timestamp: serverTimestamp(),
          game: 'community',
          itemId: shareQuest.id, // Reference the quest ID
        });
        setShowMessage(`🎉 Shared Community on X! Reward pending verification.`);
      } catch (err) {
        console.error('Failed to log transaction:', err);
        setShowMessage('⚠️ Failed to share on X. Try again.');
        setActiveModal('error');
      }
    }
    setIsModalLoading(false);
  }, [userId, quests, setShowMessage, setActiveModal]);


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
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Community
          </h1>

          {/* Community Hero Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <CommunityHero
              userId={userId}
              jewelsBalance={jewelsBalance}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Community Features Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <CommunityFeatures
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Community Chat Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <CommunityChat
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Community Rankings Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <CommunityRankings
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
              leaderboard={[]} // Pass actual leaderboard data if available
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Community on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Community on X
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

export default Community;
