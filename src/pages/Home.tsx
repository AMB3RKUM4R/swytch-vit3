import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Swords, Users, Shield, Trophy, Gem, DollarSign, Lock, Gamepad2, Map } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserOverviewCard from '../components/home/UserOverviewCard';
import MembershipStatusOverview from '../components/home/MembershipStatusOverview';
import QuickAccessGames from '../components/home/QuickAccessGames';
import ActionButtonsPanel from '../components/home/ActionButtonsPanel';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
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
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-20">
          
          <motion.section variants={sectionVariants} className="text-center">
            <Sparkles className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Galactic Command Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Welcome back, {playerData?.username || 'Hunter'}. Your cosmic odyssey continues here.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              <Shield className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Your Command Dashboard
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UserOverviewCard
                username={playerData?.username || 'Guest'}
                jewelsBalance={jewelsBalance}
                goldBalance={goldBalance}
                isPETMember={playerData?.isPETMember || false}
                userId={userId}
                walletAddress={playerData?.walletAddress || null}
              />
              <MembershipStatusOverview
                membership={playerData?.membership || 'none'}
                isPETMember={playerData?.isPETMember || false}
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
              />
            </div>
          </motion.section>

          <motion.section variants={sectionVariants}>
             <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-accent tracking-tight">
                <Trophy className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
                Mission Control
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <QuickAccessGames userId={userId} setActiveModal={setActiveModal} setShowMessage={setShowMessage} />
                <ActionButtonsPanel
                    userId={userId}
                    setActiveModal={setActiveModal}
                    setShowMessage={setShowMessage}
                    handleShareOnX={handleShareOnX}
                />
            </div>
          </motion.section>


          <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-primary tracking-tight">
              <Swords className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Galactic Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Gem className="w-12 h-12 text-[hsl(var(--accent))]" />, title: 'NFT Ownership', description: 'Own and trade unique NFTs across the PETverse.' },
                { icon: <DollarSign className="w-12 h-12 text-[hsl(var(--primary))]" />, title: 'Crypto Rewards', description: 'Earn and withdraw JEWELS, crypto, or fiat.' },
                { icon: <Lock className="w-12 h-12 text-[hsl(var(--secondary))]" />, title: 'Secure Blockchain', description: 'Enjoy fair play with transparent on-chain transactions.' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={sectionVariants}
                  className="p-8 text-center bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] hover:border-[hsl(var(--primary),0.3)] transition-colors duration-300 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-block p-4 rounded-full bg-[hsl(var(--primary),0.1)]">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold text-foreground font-russo mt-2 mb-3 text-glow-primary">{feature.title}</h3>
                  <p className="text-base text-muted-foreground font-inter leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-lg border border-[hsl(var(--accent),0.2)] bg-gradient-to-br from-[hsl(var(--accent),0.1)] to-transparent flex flex-col items-center text-center">
                    <Map className="w-12 h-12 text-[hsl(var(--accent))] animate-neon-pulse mb-4" />
                    <h3 className="text-3xl font-bold text-foreground font-russo text-glow-accent tracking-tight mb-3">Your Galactic Journey</h3>
                    <p className="text-muted-foreground font-inter mb-6 flex-grow">Track your progress, conquer quests, and forge your legacy among the stars.</p>
                    <Link to="/profile" className="btn-system-glow-accent text-lg font-russo w-fit px-6 py-3 mt-auto">View Journey</Link>
                </div>

                <div className="p-8 rounded-lg border border-[hsl(var(--secondary),0.2)] bg-gradient-to-br from-[hsl(var(--secondary),0.1)] to-transparent flex flex-col items-center text-center">
                    <Users className="w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
                    <h3 className="text-3xl font-bold text-foreground font-russo text-glow-secondary tracking-tight mb-3">Cosmic Community</h3>
                    <p className="text-muted-foreground font-inter mb-6 flex-grow">Forge alliances and share strategies with fellow cosmic warriors on our platforms.</p>
                    <button className="btn-system-glow-secondary text-lg font-russo w-fit px-6 py-3 mt-auto" onClick={handleShareOnX}>Join Now</button>
                </div>
            </div>
          </motion.section>

           <motion.section variants={sectionVariants} className="text-center py-8 border-t border-border/20">
             <div className="flex flex-wrap justify-center items-center gap-6">
                <p className="text-xl font-russo text-glow-primary">Ready for the next adventure?</p>
                <Link
                    to="/games"
                    className="btn-system-glow inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={() => setShowMessage('🎮 Navigating to Games!')}
                    role="button"
                    aria-label="Navigate to Games Page"
                >
                    <Gamepad2 className="w-6 h-6 mr-3" /> Explore All Games
                </Link>
             </div>
           </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Home;