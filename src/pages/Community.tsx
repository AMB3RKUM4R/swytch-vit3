// src/pages/Community.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, MessageCircleHeart, Users, Info, Award } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import CommunityHero from '../components/community/CommunityHero';
import CommunityFeatures from '../components/community/CommunityFeatures';
import CommunityChat from '../components/community/CommunityChat';
import CommunityRankings from '../components/community/CommunityRankings';
import { PageProps, Quest, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';

// Define Framer Motion variants
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

// Define initial quests outside the component to prevent re-creation on every render
const initialQuests: Quest[] = [
  { id: "community-visit", title: "Visit Community Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "community-share", title: "Share Community on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const Community: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [quests] = useState<Quest[]>(initialQuests);

  // Instead of fetching player data here, we'll assume it's available from a context
  // or passed down from the parent `App` component as props.
  useEffect(() => {
    if (userId) {
      // The logic for handling `community-visit` quest can be moved here
      // and update Firestore if needed.
      // For now, we'll just show the message to the user as in the original code.
      if (initialAuthCheckComplete) {
        const visitQuest = quests.find((q) => q.id === "community-visit");
        if (visitQuest && !visitQuest.completed) {
          setShowMessage('🎉 Quest "Visit Community Page" completed! Reward pending verification.');
        }
      }
    } else if (initialAuthCheckComplete) {
      setShowMessage('⚠️ Please sign in to join the community!');
      setActiveModal('auth');
    }
  }, [userId, initialAuthCheckComplete, quests, setActiveModal, setShowMessage]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    const shareQuest = quests.find((q) => q.id === "community-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Joined the vibrant Swytch PETverse community! 👥 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId: `${userId}_share_community_${Date.now()}`,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS' as SupportedCurrency,
          transactionType: 'quest-reward' as TransactionType,
          status: 'pending' as TransactionStatus,
          timestamp: serverTimestamp(),
          game: 'community',
          itemId: shareQuest.id,
        });
        setShowMessage(`🎉 Shared Community on X! Reward pending verification.`);
      } catch (err) {
        console.error('Failed to log transaction:', err);
        setShowMessage('⚠️ Failed to share on X. Try again.');
        setActiveModal('error');
      }
    }
  }, [userId, quests, setShowMessage, setActiveModal]);

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
                  src="https://via.placeholder.com/1000x500?text=Cosmic+Community+Hub"
                  alt="PETverse Community Hub"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Users className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Cosmic Community Hub
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Unite with players across the galaxy to share strategies, trade items, and climb the ranks in the PETverse.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('👥 Join the cosmic community!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Connect with the PETverse community on Discord or X!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Community Highlights */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Community Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Live Chat',
                  image: 'https://via.placeholder.com/300x200?text=Live+Chat',
                  description: 'Engage with players in real-time discussions.',
                  tooltip: 'Join live chats to share tips and strategies.',
                },
                {
                  name: 'Rankings',
                  image: 'https://via.placeholder.com/300x200?text=Rankings',
                  description: 'Compete to top the community leaderboards.',
                  tooltip: 'Climb the ranks to earn exclusive rewards.',
                },
                {
                  name: 'Events',
                  image: 'https://via.placeholder.com/300x200?text=Community+Events',
                  description: 'Participate in galactic community events.',
                  tooltip: 'Join events for unique rewards and bragging rights.',
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <motion.button
                            className="relative group p-0 m-0 border-none bg-transparent w-full h-full flex flex-col items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Learn more about ${feature.name}`}
                          >
                            <img src={feature.image} alt={feature.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </motion.button>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">{feature.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{feature.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Community Hero */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Community Hero
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <CommunityHero
                userId={userId}
                jewelsBalance={0} // Pass jewelsBalance from props if available in App.tsx
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
              />
            </Tilt>
          </motion.section>

          {/* Community Features */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Community Features
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <CommunityFeatures
                userId={userId}
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
              />
            </Tilt>
          </motion.section>

          {/* Community Chat */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <MessageCircleHeart className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Community Chat
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <CommunityChat
                userId={userId}
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
              />
            </Tilt>
          </motion.section>

          {/* Community Rankings */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Award className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Galactic Rankings
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Galactic+Rankings"
                  alt="Community Rankings"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <CommunityRankings
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
              leaderboard={[]} // This should be replaced with actual data
            />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Climb the leaderboards to earn fame and exclusive rewards in the PETverse community.
            </p>
          </motion.section>

          {/* Join the Galaxy CTA */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-primary">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Join the Galaxy
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Become a part of the PETverse community and forge alliances across the cosmos.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('👥 Join the cosmic community!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Connect with the PETverse community on Discord or X!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Footer Actions */}
          <motion.section variants={sectionVariants} className="text-center py-8 border-t border-border/50">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-6 text-glow-primary">
              <MessageCircleHeart className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
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
                    aria-label="Share Community on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share Community on X
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Share your community adventures on X and earn rewards!</p>
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
                    <span className="w-6 h-6 mr-2" aria-hidden="true">🏠</span> Back to Home
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

export default Community;