// src/pages/Market.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart, Package, Store } from 'lucide-react';

// Import PageProps and PlayerData types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import modular components for Market page
import TrustMarketHero from '../components/market/TrustMarketHero';
import RecentPurchases from '../components/market/RecentPurchases';
import TrustProgression from '../components/market/TrustProgression';
import TrustRewardTiers from '../components/market/TrustRewardTiers';
import WalletSwapForms from '../components/market/WalletSwapForms';
import SmartContractTransactions from '../components/market/SmartContractTransactions';
import TrustMarketCTA from '../components/market/TrustMarketCTA';
import SwytchCard from '../components/SwytchCard';


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

// Consolidated game features list for quick access
const gameFeatures = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'Manage your in-game items.', icon: <Package className="w-5 h-5" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/marketplace', description: 'Buy and sell items with crypto.', icon: <Store className="w-5 h-5" /> },
  { id: 'unity-games', title: 'Play Unity Games', path: '/games', description: 'Launch your Unity games here.', icon: <Sparkles className="w-5 h-5" /> },
];


const Market: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  isPending,
  authLoading,
  initialAuthCheckComplete, // Added initialAuthCheckComplete
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null);
  const [visibleGameFeatures, setVisibleGameFeatures] = useState(gameFeatures.slice(0, 3));
  const [, setIsModalLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setIsPETMember(data.isPETMember || false);
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
        console.error('Failed to fetch user data for Market page:', err);
        setShowMessage('⚠️ Failed to load market data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      // Only show auth modal if auth check is complete and no user
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to explore the market!');
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
    try {
      const shareText = encodeURIComponent("Trading NFTs in the Swytch PETverse Market! 🛒 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // --- IMPORTANT: Removed client-side update to jewels for quest reward. ---
      // This update MUST be handled by a trusted backend (e.g., Firebase Cloud Function)
      // after the share is verified.
      // The client-side app will only log the transaction.
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_market_${Date.now()}`,
        userId,
        amount: 5, // Example reward
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus, // Status is pending backend verification
        timestamp: serverTimestamp(),
        game: 'market',
      });
      // await updatePlayerFirestore({ jewels: jewelsBalance + 5 }); // Removed client-side update
      setShowMessage('🎉 Shared Market on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, setShowMessage, setActiveModal]);


  const loadMoreGameFeatures = useCallback(() => {
    if (visibleGameFeatures.length >= gameFeatures.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setVisibleGameFeatures((prev) => [
        ...prev,
        ...gameFeatures.slice(prev.length, prev.length + 3),
      ]);
    }, 500);
  }, [visibleGameFeatures]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        hasMore
      ) {
        loadMoreGameFeatures();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMoreGameFeatures]);


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
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Market
          </h1>

          {/* Trust Market Hero */}
          <motion.div variants={sectionVariants} className="mb-8">
            <TrustMarketHero
              setActiveModal={setActiveModal} userId={null} goldBalance={0} energyBalance={0} mousePosition={{
                x: 0,
                y: 0
              }} setShowMessage={function (): void {
                throw new Error('Function not implemented.');
              } }            />
          </motion.div>

          {/* Recent Purchases */}
          <motion.div variants={sectionVariants} className="mb-8">
            <RecentPurchases recentPurchases={[]} />
          </motion.div>

          {/* Trust Progression */}
          <motion.div variants={sectionVariants} className="mb-8">
            <TrustProgression />
          </motion.div>

          {/* Trust Reward Tiers */}
          <motion.div variants={sectionVariants} className="mb-8">
            <TrustRewardTiers />
          </motion.div>

          {/* Wallet Swap Forms (if distinct from Vault's CryptoSwapModule) */}
          <motion.div variants={sectionVariants} className="mb-8">
            <WalletSwapForms
                userId={userId}
                setShowMessage={setShowMessage}
                updatePlayerFirestore={updatePlayerFirestore}
            />
          </motion.div>

          {/* Smart Contract Transactions */}
          <motion.div variants={sectionVariants} className="mb-8">
            <SmartContractTransactions />
          </motion.div>

          {/* Explore Game Features Section */}
          <motion.div variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mt-8">
              Explore Game Features
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter text-center">
              Access your inventory or dive into the marketplace!
            </p>
          </motion.div>
          <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <AnimatePresence>
              {visibleGameFeatures.map((item) => (
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
          {hasMore && (
            <motion.div
              className="text-center py-8"
              variants={sectionVariants}
            >
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins"
                onClick={loadMoreGameFeatures}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Load More Game Features"
              >
                Load More
              </motion.button>
            </motion.div>
          )}

          {/* Trust Market CTA */}
          <motion.div variants={sectionVariants} className="mb-8">
            <TrustMarketCTA
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Share on X Button */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Market on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Market on X
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Market;
