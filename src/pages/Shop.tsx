// src/pages/Shop.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart, Package, Store } from 'lucide-react';

// Import PageProps and other types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import modular components for Shop page
import WalletSwapForms from '../components/shop/WalletSwapForms';
import RecentPurchases from '../components/shop/RecentPurchases';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';
import MembershipUpgrade from '../components/membership/MembershipUpgrade';
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


const Shop: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore, // Keep for logging, not direct player data modification
  currentLevel, // Keep for display purposes
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null); // PlayerData state not directly used in render, but for fetching
  const [visibleGameFeatures, setVisibleGameFeatures] = useState(gameFeatures.slice(0, 3));
  const [, setIsModalLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);


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
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data for Shop page:', err);
        setShowMessage('⚠️ Failed to load shop data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to explore the shop!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  const handlePurchaseLevel = useCallback(async (level: { id: string; name: string; cost: number; contentRoute: string }) => {
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      setActiveModal('auth');
      return;
    }
    // --- IMPORTANT: Level purchase logic now requires backend Cloud Function ---
    // The client-side app should not directly update 'level' or 'jewels'
    // due to strict Firestore rules.
    //
    try {
      const transactionId = `${userId}_level_purchase_${level.id}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: level.cost,
        currency: 'INR' as SupportedCurrency, // Assuming INR for membership purchase
        transactionType: 'level-purchase' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'shop',
        itemId: level.id,
      });
      setShowMessage(`ℹ️ Membership upgrade to ${level.name} submitted! Awaiting payment confirmation and backend processing.`);
      setActiveModal('payment'); // Open the global payment modal for the user to complete payment
    } catch (err) {
      console.error('Level purchase error:', err);
      setShowMessage('⚠️ Failed to initiate level purchase. Try again.');
      setActiveModal('error');
    }
  }, [userId, setShowMessage, setActiveModal]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    try {
      const shareText = encodeURIComponent("Shopping for NFTs in the Swytch PETverse! 🛒 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // Log transaction for sharing, actual reward by backend
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_shop_${Date.now()}`,
        userId,
        amount: 5, // Example reward
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus, // Status is pending backend verification
        timestamp: serverTimestamp(),
        game: 'shop',
      });
      setShowMessage('🎉 Shared Shop on X! Reward pending verification.');
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
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Shop
          </h1>

          {/* Wallet Swap Forms (if distinct from Vault's CryptoSwapModule) */}
          <motion.div variants={sectionVariants} className="mb-8">
            <WalletSwapForms
                userId={userId}
                setShowMessage={setShowMessage}
                updatePlayerFirestore={updatePlayerFirestore}
            />
          </motion.div>

          {/* Recent Purchases */}
          <motion.div variants={sectionVariants} className="mb-8">
            <RecentPurchases recentPurchases={[]} />
          </motion.div>

          {/* Swytch Levels Grid (for purchasing levels/memberships) */}
          <motion.div variants={sectionVariants} className="mb-8">
            <SwytchLevelsGrid
              userId={userId}
              currentLevel={currentLevel}
              isPending={isPending}
              authLoading={authLoading}
              updatePlayerFirestore={updatePlayerFirestore}
              handlePurchaseLevel={handlePurchaseLevel}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Membership Upgrade (if distinct from Levels Grid) */}
          <motion.div variants={sectionVariants} className="mb-8">
            <MembershipUpgrade
              userId={userId}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
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

          {/* Share on X Button */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Shop on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Shop on X
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

export default Shop;
