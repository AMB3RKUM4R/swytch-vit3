import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, MessageCircleHeart, Package, Store, PlayCircle, Info, ShoppingCart, Star, Users, Wallet } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import WalletSwapForms from '../components/shop/WalletSwapForms';
import RecentPurchases from '../components/shop/RecentPurchases';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';
import MembershipUpgrade from '../components/membership/MembershipUpgrade';
import SwytchCard from '../components/SwytchCard';
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

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
  { id: 'unity-games', title: 'Play Unity Games', path: '/games', description: 'Launch your Unity games here.', icon: <PlayCircle className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
];

const Shop: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  currentLevel,
  isPending,
  authLoading,
  initialAuthCheckComplete,
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
    try {
      const transactionId = `${userId}_level_purchase_${level.id}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: level.cost,
        currency: 'INR' as SupportedCurrency,
        transactionType: 'level-purchase' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'shop',
        itemId: level.id,
      });
      setShowMessage(`ℹ️ Membership upgrade to ${level.name} submitted! Awaiting payment confirmation and backend processing.`);
      setActiveModal('payment');
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
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_shop_${Date.now()}`,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
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
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Cosmic+Shop"
                  alt="PETverse Shop"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Sparkles className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Cosmic Shop
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Acquire legendary NFTs, upgrade your membership, and swap currencies in the PETverse’s stellar marketplace.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('🛒 Start shopping in the cosmic shop!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Shop Now"
                >
                  Shop Now <Store className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Explore exclusive items and memberships in the PETverse shop!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Featured Items */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Featured Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starforged Sword',
                  image: 'https://via.placeholder.com/300x200?text=Starforged+Sword',
                  description: 'A powerful NFT weapon for cosmic battles.',
                  tooltip: 'Boost your combat prowess with this rare sword.',
                },
                {
                  name: 'Galactic Shield',
                  image: 'https://via.placeholder.com/300x200?text=Galactic+Shield',
                  description: 'Defend against attacks with this NFT shield.',
                  tooltip: 'Increases defense stats across PETverse games.',
                },
                {
                  name: 'Cosmic Crystal',
                  image: 'https://via.placeholder.com/300x200?text=Cosmic+Crystal',
                  description: 'Unlock special abilities with this crystal.',
                  tooltip: 'Grants unique perks and enhances rewards.',
                },
              ].map((item, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      <motion.button
                        className="btn-accent inline-block px-4 py-2 text-sm mt-4"
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

          {/* Wallet Swap Forms */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Wallet className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Wallet Swaps
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <WalletSwapForms
                userId={userId}
                setShowMessage={setShowMessage}
                updatePlayerFirestore={updatePlayerFirestore}
              />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Swap JEWELS, crypto, or fiat to fuel your cosmic adventures.
            </p>
          </motion.section>

          {/* Recent Purchases */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <ShoppingCart className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Recent Purchases
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <RecentPurchases recentPurchases={[]} />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Review your latest acquisitions and prepare for your next purchase.
            </p>
          </motion.section>

          {/* Membership Showcase */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Star className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Membership Tiers
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Membership+Showcase"
                  alt="Membership Showcase"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
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
            <MembershipUpgrade
              userId={userId}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Ascend to new ranks with exclusive memberships to unlock cosmic rewards.
            </p>
          </motion.section>

          {/* Game Features */}
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
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        if (!userId) {
                          setShowMessage('⚠️ Sign in to access this feature!');
                          setActiveModal('auth');
                          e.preventDefault();
                        } else {
                          setShowMessage(`🎮 Navigating to ${item.title}!`);
                        }
                      }}
                      className="no-underline"
                    >
                      <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="p-8 holographic-card">
                        <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {item.icon && <div className="mx-auto mb-4">{item.icon}</div>}
                          <h3 className="text-2xl font-bold text-foreground font-russo">{item.title}</h3>
                          <p className="text-muted-foreground font-inter mt-2">{item.description}</p>
                          <motion.button className="btn-accent inline-block px-4 py-2 text-sm mt-4">
                            Go to {item.title}
                          </motion.button>
                        </motion.div>
                      </SwytchCard>
                    </Link>
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

          {/* Community Shop CTA */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-primary">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Community Shop Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Join the PETverse community to share shopping tips and discover exclusive deals.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Connect with the PETverse community on Discord or X for exclusive shop insights!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Footer Actions */}
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
                    aria-label="Share Shop on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share Shop on X
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Share your shopping spree on X and earn cosmic rewards!</p>
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
                    <Link className="w-6 h-6 mr-2" to={''} /> Back to Home
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

export default Shop;
