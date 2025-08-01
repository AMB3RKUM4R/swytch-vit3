import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Parallax } from 'react-parallax';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, MessageCircleHeart, Swords, Users, Star, Info, Shield, Trophy, Gem, DollarSign, Lock, Gamepad2, Map } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import UserOverviewCard from '../components/home/UserOverviewCard';
import MembershipStatusOverview from '../components/home/MembershipStatusOverview';
import QuickAccessGames from '../components/home/QuickAccessGames';
import CoreFeaturesShowcase from '../components/home/CoreFeaturesShowcase';
import ActionButtonsPanel from '../components/home/ActionButtonsPanel';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
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

const Home: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  jewelsBalance,
  goldBalance,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

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
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data for Home page:', err);
        setShowMessage('⚠️ Failed to load home data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to explore the PETverse!');
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
    try {
      const shareText = encodeURIComponent("Joined the Swytch PETverse! 🌟 Explore at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_home_${Date.now()}`,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'home',
      });
      setShowMessage('🎉 Shared PETverse on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    }
  }, [userId, setShowMessage, setActiveModal]);

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
        <div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section with Parallax */}
          <Parallax
            bgImage="https://via.placeholder.com/1920x1080?text=Galactic+Universe"
            strength={300}
            className="rounded-lg overflow-hidden mb-16"
          >
            <motion.section
              variants={sectionVariants}
              className="text-center py-24 bg-black/50"
            >
              <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
                <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                  <img
                    src="/art112.jpg"
                    alt="SWYTCH PETverse Hub"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </motion.div>
              </Tilt>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
                <Sparkles className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
                Galactic Command Center
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
                Embark on a cosmic odyssey in the SWYTCH PETverse. Battle, trade NFTs, and earn crypto rewards in a decentralized universe.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    className="btn-system-glow text-lg font-semibold group"
                    onClick={() => setShowMessage('🌌 Launch your cosmic journey!')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Launch Journey"
                  >
                    Launch Journey <Swords className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Dive into the PETverse to battle, trade, and conquer the stars!</p>
                </DialogContent>
              </Dialog>
            </motion.section>
          </Parallax>

          {/* User Dashboard */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Shield className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Your Command Dashboard
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <UserOverviewCard
                username={playerData?.username || 'Guest'}
                jewelsBalance={jewelsBalance}
                goldBalance={goldBalance}
                isPETMember={playerData?.isPETMember || false}
                userId={userId}
                walletAddress={playerData?.walletAddress || null}
              />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Monitor your resources, track your progress, and command your cosmic empire.
            </p>
          </motion.section>

          {/* Membership Status */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Star className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Stellar Status
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <MembershipStatusOverview
                membership={playerData?.membership || 'none'}
                isPETMember={playerData?.isPETMember || false}
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
              />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Ascend through the ranks to unlock exclusive rewards and cosmic privileges.
            </p>
          </motion.section>

          {/* Core Features Showcase */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Swords className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Galactic Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Gem className="w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse" />,
                  title: 'NFT Ownership',
                  description: 'Own and trade unique NFTs across the PETverse.',
                  image: '/art57.jpg',
                  tooltip: 'Forge and trade rare items on our secure blockchain.',
                },
                {
                  icon: <DollarSign className="w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse" />,
                  title: 'Crypto Rewards',
                  description: 'Earn and withdraw JEWELS, crypto, or fiat.',
                  image: '/art47.jpg',
                  tooltip: 'Convert your earnings into real-world value.',
                },
                {
                  icon: <Lock className="w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse" />,
                  title: 'Secure Blockchain',
                  description: 'Enjoy fair play with transparent transactions.',
                  image: '/art54.jpg',
                  tooltip: 'Every action is verified for ultimate security.',
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={feature.image} alt={feature.title} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      {feature.icon}
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
            <CoreFeaturesShowcase setActiveModal={setActiveModal} setShowMessage={setShowMessage} />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Discover the core systems powering your PETverse adventure.
            </p>
          </motion.section>

          {/* Quick Access Games */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Gamepad2 className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Cosmic Gateways
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <QuickAccessGames userId={userId} setActiveModal={setActiveModal} setShowMessage={setShowMessage} />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Jump into battles, markets, or your inventory with a single command.
            </p>
          </motion.section>

          {/* Galactic Journey */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Map className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Your Galactic Journey
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="art26.jpg"
                  alt="Galactic Journey"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Track your progress, conquer quests, and forge your legacy among the stars.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group mt-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="View Journey"
                >
                  View Journey <Map className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Explore your achievements and progress in the PETverse!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Community Hub */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Cosmic Community Hub
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="/art25.jpg"
                  alt="Cosmic Community"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Forge alliances, share strategies, and dominate the PETverse with fellow cosmic warriors.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group mt-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join Community"
                >
                  Join Community <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Connect with the PETverse community on Discord or X!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Action Buttons Panel */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Trophy className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Mission Control
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <ActionButtonsPanel
                userId={userId}
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
                handleShareOnX={handleShareOnX}
              />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Command your journey: deposit, withdraw, trade, or connect with the cosmos.
            </p>
          </motion.section>

          {/* Footer Actions */}
          <motion.section variants={sectionVariants} className="text-center py-8 border-t border-border/50">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-6 text-glow-primary">
              <MessageCircleHeart className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Broadcast Your Legend
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={handleShareOnX}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Share PETverse on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share PETverse on X
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Share your cosmic journey on X and earn rewards!</p>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Link
                    to="/games"
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={() => setShowMessage('🎮 Navigating to Games!')}
                    role="button"
                    aria-label="Navigate to Games Page"
                  >
                    <Gamepad2 className="w-6 h-6 mr-2" /> Explore Games
                  </Link>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Dive into the PETverse’s epic games to start your legend!</p>
                </DialogContent>
              </Dialog>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Home;