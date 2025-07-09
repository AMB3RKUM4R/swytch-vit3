import { FC, useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import VisionHero from '../components/VisionHero';
import VisionQuests from '../components/VisionQuests';
import VisionSupport from '../components/VisionSupport';
import VisionYourVision from '../components/VisionArchitect';
import VisionCryptoFuture from '../components/VisionCryptoFuture';
import VisionOnboarding from '../components/VisionSupport';
import VisionStandard from '../components/VisionStandard';
import VisionCommunity from '../components/VisionCommunity';
import VisionEqualizer from '../components/VisionEqualizer';
import VisionArchitect from '../components/VisionArchitect';
import VisionCTA from '../components/VisionCTA';
import SwytchCard from '../components/SwytchCard';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { useModal } from '../context/ModalContext';

// Define PageProps to match types.ts and App.tsx
interface PageProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  jewelsBalance: number;
  goldBalance: number;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
  autoPlay?: boolean;
  setAutoPlay?: Dispatch<SetStateAction<boolean>>;
}

interface Quest {
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

const initialQuests: Quest[] = [
  { id: "vision-visit", title: "Visit Vision Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "vision-share", title: "Share Vision on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
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

const Vision: FC<PageProps> = ({
  userId,
  activeModal,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  isPending,
  authLoading,
  setShowWalletModal,
}) => {
  const { showMessage } = useModal();
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [visibleGames, setVisibleGames] = useState(games.slice(0, 6));
  const [hasMore, setHasMore] = useState<boolean>(true);

  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

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
  }, [visibleGames]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    const shareQuest = quests.find((q) => q.id === "vision-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Inspired by the Swytch PETverse Vision! 🌟 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const updatedQuests = quests.map((q) =>
        q.id === "vision-share" ? { ...q, progress: 1, completed: true } : q
      );
      setQuests(updatedQuests);
      const transactionId = `${userId}_${Date.now()}`;
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS' as 'INR' | 'USD' | 'ETH',
          transactionType: 'deposit' as 'membership' | 'deposit' | 'withdraw',
          status: 'pending' as 'success' | 'pending' | 'failed',
          timestamp: serverTimestamp(),
          game: 'vision',
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

  const logUpiIntent = useCallback(async () => {
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
        currency: 'JEWELS' as 'INR' | 'USD' | 'ETH',
        transactionType: 'deposit' as 'membership' | 'deposit' | 'withdraw',
        status: 'pending' as 'success' | 'pending' | 'failed',
        timestamp: serverTimestamp(),
        game: 'vision',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      setShowMessage('ℹ️ Opening payment for investment. Admin will process your contribution.');
      setActiveModal('payment');
      setShowWalletModal(true);
    } catch (err) {
      console.error('UPI intent error:', err);
      setShowMessage('⚠️ Failed to initiate payment. Try again.');
      setActiveModal('error');
    }
    setIsModalLoading(false);
  }, [userId, investmentAmount, setShowMessage, setActiveModal, setShowWalletModal]);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setIsPETMember(data.isPETMember || false);
          const mergedQuests = initialQuests.map((initialQuest) => {
            const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id);
            return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
          });
          setQuests(mergedQuests);
          if (!mergedQuests.find((q) => q.id === "vision-visit")?.completed) {
            const updatedQuests = mergedQuests.map((q) =>
              q.id === "vision-visit" ? { ...q, progress: 1, completed: true } : q
            );
            setQuests(updatedQuests);
            updatePlayerFirestore({ quests: updatedQuests, jewels: (data.jewels || 0) + 5 });
            setShowMessage('🎉 Quest Completed: Visit Vision Page! +5 JEWELS');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data:', err);
        setShowMessage('⚠️ Failed to load vision data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setShowMessage('⚠️ Please sign in to explore the vision!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, updatePlayerFirestore]);

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
          <p>Loading Vision...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={function (_value: SetStateAction<string>): void {
      throw new Error('Function not implemented.');
    } } setActiveModal={function (_value: SetStateAction<string | null>): void {
      throw new Error('Function not implemented.');
    } }>
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
            <VisionHero userId={userId} jewelsBalance={jewelsBalance} setActiveModal={setActiveModal}/>
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionQuests
              quests={quests}
              setQuests={setQuests}
              jewelsBalance={jewelsBalance}
              saveStateToFirestore={updatePlayerFirestore}
              handleShareOnX={handleShareOnX} setJewelsBalance={function (): void {
                throw new Error('Function not implemented.');
              } }            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionSupport
              userId={userId}
              investmentAmount={investmentAmount}
              setInvestmentAmount={setInvestmentAmount}
              logUpiIntent={logUpiIntent}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionYourVision/>
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionCryptoFuture expandedSection={expandedSection} toggleSection={toggleSection} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionOnboarding userId={null} investmentAmount={''} setInvestmentAmount={function (): void {
              throw new Error('Function not implemented.');
            } } logUpiIntent={function (): Promise<void> {
              throw new Error('Function not implemented.');
            } }/>
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionStandard />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionCommunity />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionEqualizer expandedSection={expandedSection} toggleSection={toggleSection} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VisionArchitect />
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
          <motion.div variants={sectionVariants}>
            <VisionCTA setActiveModal={setActiveModal}/>
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Vision on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Vision on X
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
                  setShowWalletModal(true);
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

        <AnimatePresence>
          {isModalLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Loading Modal"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 border border-rose-500/30 backdrop-blur-lg bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <Sparkles className="w-10 h-10 text-rose-400 animate-pulse mx-auto mb-4" />
                <p className="text-white text-center font-inter">Processing...</p>
              </motion.div>
            </motion.div>
          )}
          {activeModal === 'auth' && (
            <AuthModal
              setShowMessage={setShowMessage}
            />
          )}
          {activeModal === 'payment' && (
            <PaymentModal
              userId={userId}

              setShowMessage={setShowMessage} setIsPETMember={function (_value: SetStateAction<boolean>): void {
                throw new Error('Function not implemented.');
              } } updatePlayerFirestore={function (_updates: Partial<any>): Promise<void> {
                throw new Error('Function not implemented.');
              } }              
            />
          )}
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-16 right-4 max-w-xs w-full bg-gray-900/70 border border-rose-500/30 rounded-xl shadow-xl p-4 backdrop-blur-lg z-50 bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                <p className="text-white font-bold font-poppins">{showMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          :root {
            --rose-500: #ec4899;
            --cyan-500: #22d3ee;
          }
          .bg-noise {
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUkqVJutxuNRqMhSRJpmkYkSVKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJutxuNRqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TqCRZQqlUKqlaVSqlUKqVqlaKQlJ/kfgBQUzS2f8eAAAAAElFTkSuQmCC");
            background-repeat: repeat;
            background-size: 64px 64px;
          }
          .blur-3xl { filter: blur(64px); }
          .blur-2xl { filter: blur(32px); }
          input:focus, select:focus, button:focus, [role="button"]:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.5);
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          }
          @media (prefers-reduced-motion) {
            .animate-pulse { animation: none !important; }
            .transition, .transition-all, .hover\\:scale-105:hover, .hover\\:bg-gray-800\\/90:hover {
              transition: none !important;
            }
          }
        `}</style>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Vision;