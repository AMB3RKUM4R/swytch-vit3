import { FC, useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import TokenomicsHero from '../components/TokenomicsHero';
import TokenomicsGovern from '../components/TokenomicsGovern';
import TokenomicsQuests from '../components/TokenomicsQuests';
import TokenomicsEnergyNode from '../components/TokenomicsInvestment'; // Assuming this is also TokenomicsInvestment
import TokenomicsInfoCards from '../components/TokenomicsInfoCards';
import TokenomicsPieChart from '../components/TokenomicsPieChart';
import TokenomicsInvestment from '../components/TokenomicsInvestment'; // This seems to be the main component handling investment logic
import TokenomicsFooter from '../components/TokenomicsFooter';
import SwytchCard from '../components/SwytchCard';
// Removed AuthModal and PaymentModal imports as they are globally managed by App.tsx
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { useModal } from '../context/ModalContext';

// IMPORTANT: Import PageProps, SupportedCurrency, TransactionType, TransactionStatus from your lib/types.ts file
import { PageProps as ImportedPageProps, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';


interface Quest { // This Quest interface remains local as it's specific to this component's internal state.
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface Game { // This Game interface remains local as it's specific to this component. Consider moving to constants.
  id: string;
  title: string;
  path: string;
  description: string;
  comingSoon?: boolean;
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
  { id: "tokenomics-visit", title: "Visit Tokenomics Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "tokenomics-share", title: "Share Tokenomics on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const games: Game[] = [ // Explicitly type games array. Consider moving to a central constants file.
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
const Tokenomics: FC<ImportedPageProps> = ({
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
  const [quests, setQuests] = useState<Quest[]>(initialQuests); // Explicitly type quests state
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [visibleGames, setVisibleGames] = useState<Game[]>(games.slice(0, 6)); // Explicitly type visibleGames
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

  const handleClaimQuest = useCallback(async (questId: string) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to claim quests!');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completed || quest.progress < quest.goal) {
      setShowMessage('⚠️ Quest not ready to claim!');
      setIsModalLoading(false);
      return;
    }
    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, completed: true } : q
    );
    setQuests(updatedQuests);
    const transactionId = `${userId}_${Date.now()}`;
    try {
      await addDoc(collection(db, 'Transactions'), { // Ensure 'Transactions' matches your Firestore rule
        transactionId,
        userId,
        amount: quest.rewardJEWELS,
        currency: 'JEWELS', // FIX: Correctly typed
        transactionType: 'quest-reward', // FIX: Correctly typed
        status: 'pending', // FIX: Correctly typed
        timestamp: serverTimestamp(),
        game: questId,
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      await updatePlayerFirestore({ quests: updatedQuests, jewels: jewelsBalance + quest.rewardJEWELS });
      setShowMessage(`🎉 Quest Completed: ${quest.title}! +${quest.rewardJEWELS} JEWELS`);
      setActiveModal('payment');
      // Removed setShowWalletModal(true); here as it's handled by setActiveModal('auth') or PaymentModal itself
    } catch (err) {
      console.error('Quest claim error:', err);
      setShowMessage('⚠️ Failed to claim quest. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, quests, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]); // Removed setShowWalletModal from deps

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    const shareQuest = quests.find((q) => q.id === "tokenomics-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Exploring the Swytch PETverse Tokenomics! 💸 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const updatedQuests = quests.map((q) =>
        q.id === "tokenomics-share" ? { ...q, progress: 1, completed: true } : q
      );
      setQuests(updatedQuests);
      const transactionId = `${userId}_${Date.now()}`;
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS', // FIX: Correctly typed
          transactionType: 'deposit', // FIX: Correctly typed
          status: 'pending', // FIX: Correctly typed
          timestamp: serverTimestamp(),
          game: 'tokenomics',
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
  }, [userId, quests, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]);

  const handleInvestmentSubmit = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to invest.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: parseFloat(investmentAmount) || 100,
        currency: 'JEWELS', // FIX: Correctly typed
        transactionType: 'deposit', // FIX: Correctly typed
        status: 'pending', // FIX: Correctly typed
        timestamp: serverTimestamp(),
        game: 'tokenomics',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      setShowMessage('ℹ️ Opening payment for investment. Admin will process your contribution.');
      setActiveModal('payment');
      // Removed setShowWalletModal(true); here as it's handled by setActiveModal('auth') or PaymentModal itself
    } catch (err) {
      console.error('Investment error:', err);
      setShowMessage('⚠️ Failed to initiate investment. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, investmentAmount, setShowMessage, setActiveModal]); // Removed setShowWalletModal from deps, added missing deps

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId); // Ensure 'Players' matches Firestore collection name
      const unsubscribe = onSnapshot(userRef, (docSnap) => { // Renamed 'doc' to 'docSnap' for clarity
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
          const mergedQuests = initialQuests.map((initialQuest) => {
            const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id); // Explicitly type 'q'
            return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
          });
          setQuests(mergedQuests);
          if (!mergedQuests.find((q) => q.id === "tokenomics-visit")?.completed) {
            const updatedQuests = mergedQuests.map((q) =>
              q.id === "tokenomics-visit" ? { ...q, progress: 1, completed: true } : q
            );
            setQuests(updatedQuests);
            updatePlayerFirestore({ quests: updatedQuests, jewels: (data.jewels || 0) + 5 });
            setShowMessage('🎉 Quest Completed: Visit Tokenomics Page! +5 JEWELS');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data:', err);
        setShowMessage('⚠️ Failed to load tokenomics data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setShowMessage('⚠️ Please sign in to explore tokenomics!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, updatePlayerFirestore]); // Added missing deps

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
          <p>Loading Tokenomics...</p>
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
            <TokenomicsHero userId={userId} jewelsBalance={jewelsBalance} visitStreak={0} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <TokenomicsGovern isPending={isPending} setActiveModal={setActiveModal} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <TokenomicsQuests
              quests={quests}
              handleClaimQuest={handleClaimQuest}
              isConnected={!!userId}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            {/* Assuming TokenomicsEnergyNode and TokenomicsInvestment are the same component or closely related.
                Passing all relevant props collected by Tokenomics page. */}
            <TokenomicsInvestment
              investmentAmount={investmentAmount}
              setInvestmentAmount={setInvestmentAmount}
              handleInvestmentSubmit={handleInvestmentSubmit}
              isPending={isPending}
              // These PayPal functions are placeholder. If not implemented, simplify the component prop types.
              handlePayPalPayment={async () => { throw new Error('PayPal payment not implemented'); }}
              handlePayPalApprove={async () => { throw new Error('PayPal approve not implemented'); }}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <TokenomicsInfoCards />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <TokenomicsPieChart />
          </motion.div>
          <motion.div variants={sectionVariants}>
            {/* The previous TokenomicsInvestment instance was here. Keeping it as is but consolidating props */}
            <TokenomicsInvestment
              investmentAmount={investmentAmount}
              setInvestmentAmount={setInvestmentAmount}
              handleInvestmentSubmit={handleInvestmentSubmit}
              isPending={isPending}
              handlePayPalPayment={async () => { throw new Error('PayPal payment not implemented'); }}
              handlePayPalApprove={async () => { throw new Error('PayPal approve not implemented'); }}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <TokenomicsFooter />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Explore Our Games
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
              Play thrilling games and earn JEWELS in the PETverse! Scroll to explore all games.
            </p>
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
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Tokenomics on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Tokenomics on X
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
          </motion.div>
        </motion.div>
        {/* Modals are rendered by App.tsx, so no need to render them here again */}
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Tokenomics;