import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { Users, Gem, Shield, Star, Sparkles, Rocket, Gamepad2 } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { PlayerData } from '../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 0 15px hsl(var(--secondary),0.5)', transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] } },
};


const LandingPage: FC = () => {
  // Get all data from our new contexts
  const { 
    userId, 
    setIsPETMember, 
    dataLoading, 
    authLoading, 
    initialAuthCheckComplete 
  } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // isPending from PageProps is now dataLoading from usePlayer
  const isPending = dataLoading;

  const [, setPlayerData] = useState<PlayerData | null>(null);

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
        console.error('Failed to fetch user data for Landing page:', err);
        setShowMessage('⚠️ Failed to load landing data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      if (initialAuthCheckComplete && window.location.pathname !== '/') {
        // Only show this message if they are not on the landing page
        setShowMessage('⚠️ Please sign in to explore the PETverse!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  if (authLoading || isPending) {
    return null; // Let the main App.tsx loading screen handle it
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise bg-gray-950"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          
          <motion.section 
            variants={sectionVariants} 
            className="text-center p-8 mb-20 bg-black/20 rounded-xl border border-[hsl(var(--primary),0.2)] backdrop-blur-sm"
          >
            <motion.div variants={iconVariants}>
                <Rocket className="mx-auto w-24 h-24 text-[hsl(var(--secondary))] animate-neon-pulse mb-6" />
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Welcome to the PETverse
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-inter mb-8 leading-relaxed">
              Forge your path from E-rank hunter to a cosmic legend. Wield NFT weapons, earn JEWELS, and conquer decentralized dungeons in a blockchain-powered universe.
            </p>
            <motion.button
              className="btn-system-glow text-xl font-russo mx-auto block w-fit px-8 py-4"
              onClick={() => userId ? setShowMessage('🚀 Launching into the PETverse!') : setActiveModal('auth')}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Enter the PETverse"
            >
              Enter the PETverse <Gamepad2 className="ml-3 w-6 h-6" />
            </motion.button>
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-20">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              Core Gameplay Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Gem className="w-12 h-12 text-[hsl(var(--primary))]" />, title: 'Epic NFT Arsenal', description: 'Craft, trade, and wield unique NFT weapons and artifacts on a secure blockchain.', },
                { icon: <Sparkles className="w-12 h-12 text-[hsl(var(--secondary))]" />, title: 'Play-to-Earn Rewards', description: 'Slay beasts to earn JEWELS and Gold, convertible for real-world value.', },
                { icon: <Shield className="w-12 h-12 text-[hsl(var(--accent))]" />, title: 'Decentralized & Secure', description: 'Engage in battles with transparent, secure transactions protected by blockchain.', },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={sectionVariants}
                  className="p-8 text-center bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] hover:border-[hsl(var(--primary),0.3)] transition-colors duration-300 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-block p-4 rounded-full bg-[hsl(var(--primary),0.1)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground font-russo mt-2 mb-3 text-glow-primary">{feature.title}</h3>
                  <p className="text-base text-muted-foreground font-inter leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="p-8 rounded-lg border border-[hsl(var(--accent),0.2)] bg-gradient-to-br from-[hsl(var(--accent),0.1)] to-transparent">
                <div className="flex items-center mb-4">
                  <Star className="w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-4" />
                  <h2 className="text-3xl font-bold text-foreground font-russo text-glow-accent tracking-tight">
                    Become a Legend
                  </h2>
                </div>
                <p className="text-muted-foreground font-inter mb-6">
                  Unlock exclusive PET Membership tiers for legendary powers, rare NFTs, and cosmic domination.
                </p>
                <Link
                  to="/membership"
                  className="btn-system-glow-accent text-lg font-russo w-fit px-6 py-3"
                  onClick={() => setShowMessage('🌟 Ascending to legendary status!')}
                  aria-label="Unlock PET Membership"
                >
                  View Tiers <Star className="ml-2 w-5 h-5" />
                </Link>
              </div>

              <div className="p-8 rounded-lg border border-[hsl(var(--secondary),0.2)] bg-gradient-to-br from-[hsl(var(--secondary),0.1)] to-transparent">
                <div className="flex items-center mb-4">
                  <Users className="w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
                  <h2 className="text-3xl font-bold text-foreground font-russo text-glow-secondary tracking-tight">
                    Join the Guild
                  </h2>
                </div>
                <p className="text-muted-foreground font-inter mb-6">
                  Unite with hunters on Discord and X. Share strategies, trade NFTs, and forge alliances.
                </p>
                 <Dialog>
                  <DialogTrigger asChild>
                    <motion.button
                      className="btn-system-glow-secondary text-lg font-russo w-fit px-6 py-3"
                      variants={buttonVariants} whileHover="hover" whileTap="tap"
                    >
                      Connect Now <Users className="ml-2 w-5 h-5" />
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="tooltip max-w-sm p-6 bg-[hsl(var(--background))] border border-[hsl(var(--secondary),0.2)] rounded-lg">
                    <p className="text-muted-foreground font-inter">Find our community links on the official game page!</p>
                  </DialogContent>
                </Dialog>
              </div>

            </div>
          </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default LandingPage;

