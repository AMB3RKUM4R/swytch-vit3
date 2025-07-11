// pages/GamesPage.tsx (Updated: Replaced throwing stub in SwytchDailyQuests updatePlayerFirestore prop with actual updatePlayerFirestore from props. Added deps to handleClaimQuest/shareOnX. Ensured initialQuests typed. No logic changes.)

import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchCard from '../components/SwytchCard';
import SwytchDailyQuests from '../components/SwytchDailyQuests';
// Removed AuthModal and PaymentModal imports as they are globally managed by App.tsx
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

// IMPORTANT: Import GamesPageProps from your lib/types.ts file
import { PageProps as ImportedGamesPageProps } from '../lib/types'; // Changed to PageProps since GamesPageProps may not be exported


interface Quest { // This Quest interface remains local as it's specific to this component's internal state.
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

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

const initialQuests: Quest[] = [ // Explicitly type initialQuests
  { id: "games-visit", title: "Visit Games Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "games-share", title: "Share Games on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
  { id: "play-blackjack", title: "Win 3 Blackjack hands", progress: 0, goal: 3, rewardJEWELS: 50, rewardXP: 100, completed: false },
  { id: "spin-fortune", title: "Spin the Fortune Wheel 5 times", progress: 0, goal: 5, rewardJEWELS: 30, rewardXP: 60, completed: false },
];

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

// Use ImportedGamesPageProps as the type for the FC
const GamesPage: FC<ImportedGamesPageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  isPending,
  authLoading,
  // Removed setShowWalletModal from destructuring as it's not part of AppProps/GamesPageProps anymore
  // Removed autoPlay and setAutoPlay as they were optional in previous AppProps but not used here
}) => {
  // Removed const { showMessage } = useModal(); as it's redundant (setShowMessage prop is used)
  const [quests, setQuests] = useState<Quest[]>(initialQuests); // Explicitly type quests state
  const [visibleGames, setVisibleGames] = useState(games.slice(0, 6));
  const [, setIsModalLoading] = useState<boolean>(false);
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
    const shareQuest = quests.find((q) => q.id === "games-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Playing awesome games in Swytch PETverse! 🎮 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const updatedQuests = quests.map((q) =>
        q.id === "games-share" ? { ...q, progress: 1, completed: true } : q
      );
      setQuests(updatedQuests);
      const transactionId = `${userId}_${Date.now()}`;
      try {
        await addDoc(collection(db, 'Transactions'), { // Ensure 'Transactions' matches your Firestore rule
          transactionId,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS',
          transactionType: 'deposit',
          status: 'pending',
          timestamp: serverTimestamp(),
          game: 'games',
          adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
        });
        await updatePlayerFirestore({ quests: updatedQuests, jewels: jewelsBalance + shareQuest.rewardJEWELS });
        setShowMessage(`🎉 Quest Completed: ${shareQuest.title}! +${shareQuest.rewardJEWELS} JEWELS`);
      } catch (err) {
        console.error('Failed to share on X:', err);
        setShowMessage('⚠️ Failed to share on X. Try again.');
        setActiveModal('error');
      }
    }
    setIsModalLoading(false);
  }, [userId, quests, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]); // Removed `db` from deps

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => { // Renamed 'doc' to 'docSnap' for clarity
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
          // Ensure quests are loaded from Firestore, falling back to initialQuests
          const fetchedQuests: Quest[] = data.quests?.length ? data.quests : initialQuests;
          setQuests(fetchedQuests);
          if (!fetchedQuests.find((q: Quest) => q.id === "games-visit")?.completed) { // Explicitly type q
            const updatedQuests = fetchedQuests.map((q) =>
              q.id === "games-visit" ? { ...q, progress: 1, completed: true } : q
            );
            setQuests(updatedQuests);
            updatePlayerFirestore({ quests: updatedQuests, jewels: (data.jewels || 0) + 5 });
            setShowMessage('🎉 Quest Completed: Visit Games Page! +5 JEWELS');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data:', err);
        setShowMessage('⚠️ Failed to load games data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setShowMessage('⚠️ Please sign in to play games!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, updatePlayerFirestore]); // Removed `quests` from deps

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        hasMore
      ) {
        loadMoreGames();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMoreGames]);

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
          <p>Loading Games...</p>
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
            <h1 className="text-4xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Games
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
              Dive into thrilling games and earn JEWELS in the PETverse! Scroll to explore all games.
            </p>
          </motion.div>
          <motion.div variants={sectionVariants}>
            <SwytchDailyQuests
              quests={quests}
              setQuests={setQuests}
              userId={userId}
              setShowMessage={setShowMessage}
              setActiveModal={setActiveModal} updatePlayerFirestore={updatePlayerFirestore} jewelsBalance={jewelsBalance} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            
          </motion.div>
          <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <AnimatePresence>
              {visibleGames.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4 }}
                >
                  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="p-6">
                    <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <h3 className="text-xl font-bold text-white font-poppins">{game.title}</h3>
                      <p className="text-gray-300 font-inter mt-2">{game.description}</p>
                      <Link
                        to={game.path}
                        className={`inline-block bg-${game.comingSoon ? 'gray-600' : 'rose-600'} text-white px-4 py-2 rounded-full font-poppins hover:bg-${game.comingSoon ? 'gray-500' : 'cyan-500'} mt-4`}
                        onClick={() => {
                          if (!userId) {
                            setShowMessage('⚠️ Sign in to play games!');
                            setActiveModal('auth');
                          } else if (!game.comingSoon) {
                            setShowMessage(`🎮 Navigating to ${game.title}!`);
                          }
                        }}
                        role="button"
                        aria-label={`Play ${game.title}`}
                        style={{ pointerEvents: game.comingSoon ? 'none' : 'auto' }}
                      >
                        {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                      </Link>
                    </motion.div>
                  </SwytchCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {hasMore && (
            <motion.div
              className="text-center py-8"
              variants={sectionVariants}
            >
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins"
                onClick={loadMoreGames}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Load More Games"
              >
                Load More
              </motion.button>
            </motion.div>
          )}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={shareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Games on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Games on X
            </motion.button>
            <Link
              to="/vault"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
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
              to="/membership"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🌟 Navigating to Membership!')}
              role="button"
              aria-label="Navigate to Membership Page"
            >
              Membership
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
              to="/tokenomics"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('💸 Navigating to Tokenomics!')}
              role="button"
              aria-label="Navigate to Tokenomics Page"
            >
              Tokenomics
            </Link>
          </motion.div>
        </motion.div>
        {/* Modals are rendered by App.tsx, so no need to render them here again */}
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default GamesPage;