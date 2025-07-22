// src/pages/GamesPage.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart, Package, Store, PlayCircle } from 'lucide-react'; // Added PlayCircle icon

// Import PageProps and Quest types
import { PageProps, Quest, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import modular components for GamesPage
import SwytchDailyQuests from '../components/games/SwytchDailyQuests';


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
  { id: "games-visit", title: "Visit Games Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "games-share", title: "Share Games on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
  // Add more general gaming quests here
];

// Updated games list to focus on Inventory and Marketplace, and a general "Unity Games" launcher
const gameFeatures = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'Manage your in-game items and NFTs.', icon: <Package className="w-5 h-5" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/marketplace', description: 'Buy and sell unique items with crypto.', icon: <Store className="w-5 h-5" /> },
  { id: 'unity-games-launcher', title: 'Launch Unity Games', path: '/launch-unity', description: 'Access and play your favorite Unity games.', icon: <PlayCircle className="w-5 h-5" /> }, // Placeholder for launching Unity games
];


const GamesPage: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  isPending,
  authLoading,
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [, setIsModalLoading] = useState<boolean>(false); // Used for general loading states


  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setIsPETMember(data.isPETMember || false);
          // Merge initial quests with saved quests
          const mergedQuests = initialQuests.map((initialQuest) => {
            const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id);
            return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
          });
          setQuests(mergedQuests);

          // Auto-complete "Visit Games Page" quest if not already completed
          if (!mergedQuests.find((q) => q.id === "games-visit")?.completed) {
            const updatedQuests = mergedQuests.map((q) =>
              q.id === "games-visit" ? { ...q, progress: 1, completed: true } : q
            );
            setQuests(updatedQuests);
            updatePlayerFirestore({ quests: updatedQuests, jewels: (data.jewels || 0) + 5 });
            setShowMessage('🎉 Quest Completed: Visit Games Page! +5 JEWELS');
          }
        } else {
          setPlayerData(null);
          setIsPETMember(false);
          setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
          setActiveModal('auth');
        }
      }, (err) => {
        console.error('Failed to fetch user data for Games page:', err);
        setShowMessage('⚠️ Failed to load games data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      setShowMessage('⚠️ Please sign in to explore games!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, updatePlayerFirestore]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    const shareQuest = quests.find((q) => q.id === "games-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Playing awesome games in Swytch PETverse! 🎮 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const updatedQuests = quests.map((q) =>
        q.id === "games-share" ? { ...q, progress: 1, completed: true } : q
      );
      setQuests(updatedQuests);
      // Log transaction for sharing
      const transactionId = `${userId}_share_games_${Date.now()}`;
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS' as SupportedCurrency,
          transactionType: 'quest-reward' as TransactionType,
          status: 'success' as TransactionStatus,
          timestamp: serverTimestamp(),
          game: 'games',
        });
        await updatePlayerFirestore({ quests: updatedQuests, jewels: jewelsBalance + shareQuest.rewardJEWELS });
        setShowMessage(`🎉 Quest Completed: ${shareQuest.title}! +${shareQuest.rewardJEWELS} JEWELS`);
      } catch (err) {
        console.error('Failed to log transaction:', err);
        setShowMessage('⚠️ Failed to share on X. Try again.');
        setActiveModal('error');
      }
    }
    setIsModalLoading(false);
  }, [userId, quests, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]);


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
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Games & Assets
          </h1>

          {/* Daily Quests Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <SwytchDailyQuests
              userId={userId}
              quests={quests}
              setQuests={setQuests}
              jewelsBalance={jewelsBalance}
              // setJewelsBalance is not directly passed here, updatePlayerFirestore handles it
              saveStateToFirestore={async (updates) => {
                if (userId) await updatePlayerFirestore(updates);
              }}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Explore Game Features Section */}
          <motion.div variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mt-8">
              Explore Game Features
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter text-center">
              Access your inventory, dive into the marketplace, or launch your Unity games!
            </p>
          </motion.div>
          <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <AnimatePresence>
              {gameFeatures.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4 }}
                >
                  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="p-6">
                    <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {item.icon && <div className="mx-auto mb-2">{item.icon}</div>}
                      <h3 className="text-xl font-bold text-white font-poppins">{item.title}</h3>
                      <p className="text-gray-300 font-inter mt-2">{item.description}</p>
                      <Link
                        to={item.path}
                        className={`inline-block bg-rose-600 text-white px-4 py-2 rounded-full font-poppins hover:bg-cyan-500 mt-4`}
                        onClick={() => {
                          if (!userId) {
                            setShowMessage('⚠️ Sign in to access this feature!');
                            setActiveModal('auth');
                          } else {
                            setShowMessage(`🎮 Navigating to ${item.title}!`);
                          }
                        }}
                        role="button"
                        aria-label={`Go to ${item.title}`}
                      >
                        Go to {item.title}
                      </Link>
                    </motion.div>
                  </SwytchCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Share on X Button */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Games Page on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Games Page on X
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

export default GamesPage;
