// src/pages/Market.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, MessageCircleHeart, Package, Store, Info, TrendingUp, PlayCircle, Users, Home } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import TrustMarketHero from '../components/market/TrustMarketHero';
import RecentPurchases from '../components/market/RecentPurchases';
import TrustProgression from '../components/market/TrustProgression';
import TrustRewardTiers from '../components/market/TrustRewardTiers';
import WalletSwapForms from '../components/market/WalletSwapForms';
import SmartContractTransactions from '../components/market/SmartContractTransactions';
import TrustMarketCTA from '../components/market/TrustMarketCTA';
import SwytchCard from '../components/SwytchCard';
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.4 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const gameFeatures = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'Manage your in-game items.', icon: <Package className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/marketplace', description: 'Buy and sell items with crypto.', icon: <Store className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
  { id: 'unity-games', title: 'Play Unity Games', path: '/games', description: 'Launch your Unity games here.', icon: <Sparkles className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
];

const Market: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  playerData,
  logTransaction,
  updatePlayerFirestore,
}) => {
  const [visibleGameFeatures, setVisibleGameFeatures] = useState(gameFeatures.slice(0, 3));
  const [, setIsModalLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // The onSnapshot listener for market items should remain here.
  useEffect(() => {
    const q = query(collection(db, 'MarketItems'), where('isListedForSale', '==', true));
    const unsubscribe = onSnapshot(q, () => {
      // Logic to set market items
    }, (err) => {
      console.error('Failed to fetch market items:', err);
      setShowMessage('⚠️ Failed to load marketplace items.');
    });
    return () => unsubscribe();
  }, [setShowMessage]);

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
      
      // Use logTransaction for this action
      await logTransaction({
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        game: 'market',
      });

      setShowMessage('🎉 Shared Market on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to log transaction:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, setShowMessage, setActiveModal, logTransaction]);

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
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StarfieldBackground />
        <motion.div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="/art8.jpg"
                  alt="PETverse Market"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Store className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Cosmic Market
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Trade, swap, and earn in the PETverse’s decentralized market. Secure your cosmic riches among the stars.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('🛒 Explore the cosmic market!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Trade Now"
                >
                  Trade Now <TrendingUp className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Dive into the PETverse market to trade NFTs and swap currencies!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Trending Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Nebula Dagger',
                  image: '/art9.jpg',
                  description: 'A swift NFT weapon for stealth attacks.',
                  tooltip: 'This dagger enhances agility in PETverse battles.',
                },
                {
                  name: 'Starlight Armor',
                  image: '/art16.jpg',
                  description: 'Radiant armor for cosmic defense.',
                  tooltip: 'Boosts defense stats across all games.',
                },
                {
                  name: 'Astral Token',
                  image: 'art17.jpg',
                  description: 'A rare token with trading value.',
                  tooltip: 'Use this token to unlock premium market features.',
                },
              ].map((item, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="relative group">
                            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      <motion.button
                        className="btn-accent mt-4 text-sm"
                        onClick={() => setShowMessage(`🛒 Viewing ${item.name} (requires backend purchase logic)`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Item
                      </motion.button>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Store className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Market Hero
            </h2>
            <TrustMarketHero
              setActiveModal={setActiveModal}
              userId={userId}
              goldBalance={playerData?.gold || 0}
              energyBalance={playerData?.energy || 0}
              setShowMessage={setShowMessage}
            />
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <TrendingUp className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Recent Purchases
            </h2>
            <RecentPurchases recentPurchases={[]} />
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Trust Progression
            </h2>
            <TrustProgression />
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Reward Tiers
            </h2>
            <TrustRewardTiers />
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Store className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Wallet Swaps
            </h2>
            <WalletSwapForms
              userId={userId}
              setShowMessage={setShowMessage}
              updatePlayerFirestore={updatePlayerFirestore}
            />
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <TrendingUp className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Smart Contract Transactions
            </h2>
            <SmartContractTransactions />
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Market Activity
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="/art10.jpg"
                  alt="Market Activity"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Track the pulse of the PETverse market with real-time transaction updates.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <PlayCircle className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Explore Game Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter text-center">
              Access your inventory, trade in the marketplace, or launch epic Unity games.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {visibleGameFeatures.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="p-8 holographic-card">
                      <Link
                        to={item.path}
                        className="text-center block h-full w-full"
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
                        <div className="h-full flex flex-col justify-center">
                          {item.icon && <div className="mx-auto mb-4">{item.icon}</div>}
                          <h3 className="text-2xl font-bold text-foreground font-russo">{item.title}</h3>
                          <p className="text-muted-foreground font-inter mt-2">{item.description}</p>
                          <span className="btn-accent inline-block px-4 py-2 text-sm mt-4">
                            Go to {item.title}
                          </span>
                        </div>
                      </Link>
                    </SwytchCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {hasMore && (
              <motion.div className="text-center mt-8" variants={sectionVariants}>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={loadMoreGameFeatures}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Load More Game Features"
                >
                  Load More <PlayCircle className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </motion.div>
            )}
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Community Trading Hub
            </h2>
            <TrustMarketCTA setActiveModal={setActiveModal} setShowMessage={setShowMessage} />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Join the PETverse trading community to share strategies and dominate the market.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants} className="text-center py-8 border-t border-border/50">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-6 text-glow-accent">
              <MessageCircleHeart className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Spread the Word
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={handleShareOnX}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Share Market on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share Market on X
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Share your market adventures on X and earn rewards!</p>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Link
                    to="/home"
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={() => setShowMessage('🏠 Navigating to Home!')}
                    role="button"
                    aria-label="Navigate to Home Page"
                  >
                    <Home className="w-6 h-6 mr-2" /> Back to Home
                  </Link>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Return to the PETverse home to continue your adventure!</p>
                </DialogContent>
              </Dialog>
            </div>
          </motion.section>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Market;