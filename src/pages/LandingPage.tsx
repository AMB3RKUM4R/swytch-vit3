import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Swords, Users, Gem, Shield, Star, Sparkles, Trophy } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import { PageProps, PlayerData } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.4, delayChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: 5 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 0 15px hsl(var(--secondary),0.5)', transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

const LandingPage: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
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
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to explore the PETverse!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  if (authLoading || isPending) {
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise bg-gray-950"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StarfieldBackground />
        <div className="relative z-20 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura border border-[hsl(var(--primary),0.2)]" variants={imageVariants}>
                <img
                  src="./bg6.jpg"
                  alt="Hero Rising in PETverse"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary tracking-tight">
              <Swords className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Rise as a PETverse Hunter
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-inter mb-8 leading-relaxed">
              From an E-rank hunter to a cosmic legend, forge your path in the SWYTCH PETverse. Wield NFT weapons, earn JEWELS, and conquer decentralized dungeons in a blockchain-powered universe.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-russo mx-auto block w-fit px-6 py-3"
                  onClick={() => userId ? setShowMessage('🌌 Begin your hunt!') : setActiveModal('auth')}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Join the PETverse"
                >
                  Forge Your Legend <Star className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6 bg-[hsl(var(--background))] border border-[hsl(var(--primary),0.2)] rounded-lg">
                <p className="text-sm text-muted-foreground font-inter">Step into the PETverse to battle, trade, and ascend to greatness!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Core Features */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              <Gem className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Unleash Your Power
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Gem className="w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse" />,
                  title: 'Epic NFT Arsenal',
                  description: 'Craft and trade unique NFT weapons and artifacts on a secure blockchain, forging gear worthy of a legendary hunter.',
                  image: './bg3.jpg',
                  tooltip: 'Forge rare NFTs to dominate the PETverse’s dungeons.',
                },
                {
                  icon: <Sparkles className="w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse" />,
                  title: 'JEWELS & Gold',
                  description: 'Slay cosmic beasts in quests to earn JEWELS and Gold, convertible to crypto or fiat for real-world rewards.',
                  image: './bg4.jpg',
                  tooltip: 'Earn glowing rewards to fuel your ascent.',
                },
                {
                  icon: <Shield className="w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse" />,
                  title: 'Ironclad Blockchain',
                  description: 'Engage in decentralized battles with transparent, secure transactions, protected by blockchain runes.',
                  image: './bg5.jpg',
                  tooltip: 'Trust in a secure, transparent cosmos.',
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-6 text-center animated-aura border border-[hsl(var(--primary),0.2)]">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={feature.image} alt={feature.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6 bg-[hsl(var(--background))] border border-[hsl(var(--primary),0.2)] rounded-lg">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground font-inter">{feature.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      {feature.icon}
                      <h3 className="text-xl font-semibold text-foreground font-russo mt-4 text-glow-primary">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 font-inter leading-relaxed">{feature.description}</p>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* PET Membership Teaser */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-accent tracking-tight">
              <Star className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Ascend to PET Legend
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura border border-[hsl(var(--primary),0.2)]" variants={imageVariants}>
                <img
                  src="./bg2.jpg"
                  alt="PET Membership Showcase"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter leading-relaxed">
              Unlock exclusive PET Membership tiers to wield legendary powers, access rare NFTs, and dominate the cosmic battlefield.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Link
                  to="/membership"
                  className="btn-system-glow text-lg font-russo mx-auto block w-fit px-6 py-3 mt-6"
                  onClick={() => setShowMessage('🌟 Ascend to legendary status!')}
                  aria-label="Unlock PET Membership"
                >
                  Become a Legend <Star className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </Link>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6 bg-[hsl(var(--background))] border border-[hsl(var(--primary),0.2)] rounded-lg">
                <p className="text-sm text-muted-foreground font-inter">Join PET Membership to unlock epic perks and rise to glory!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Community Call-to-Action */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-primary tracking-tight">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Join the Cosmic Guild
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-inter leading-relaxed">
              Unite with hunters on Discord and X. Share battle strategies, trade rare NFTs, and forge alliances to conquer the PETverse.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-russo mx-auto block w-fit px-6 py-3"
                  onClick={() => setShowMessage('🤝 Join the cosmic guild!')}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Join Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6 bg-[hsl(var(--background))] border border-[hsl(var(--primary),0.2)] rounded-lg">
                <p className="text-sm text-muted-foreground font-inter">Connect with the PETverse community to share your epic journey!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Transparency Hub */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-accent tracking-tight">
              <Shield className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Trust the Cosmos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-inter leading-relaxed">
              Explore our Transparency Hub to master the rules and risks of the PETverse, secured by immutable blockchain runes.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Link
                  to="/dspet-disclosure"
                  className="btn-system-glow text-lg font-russo mx-auto block w-fit px-6 py-3"
                  onClick={() => setShowMessage('📜 Explore transparency!')}
                  aria-label="Learn More About Transparency"
                >
                  Learn More <Shield className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </Link>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6 bg-[hsl(var(--background))] border border-[hsl(var(--primary),0.2)] rounded-lg">
                <p className="text-sm text-muted-foreground font-inter">Visit the Transparency Hub to understand PETverse’s rules and risks.</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Showcase Section */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-primary tracking-tight">
              <Trophy className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Conquer the Cosmos
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura border border-[hsl(var(--primary),0.2)]" variants={imageVariants}>
                <img
                  src="./bg1.jpg"
                  alt="Cosmic Conquest Showcase"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6 font-inter leading-relaxed">
              Rise through the ranks, conquer cosmic dungeons, and etch your name among the stars in the SWYTCH PETverse.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-russo mx-auto block w-fit px-6 py-3 mt-6"
                  onClick={() => userId ? setShowMessage('🏆 Start your conquest!') : setActiveModal('auth')}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Start Your Conquest"
                >
                  Start Conquest <Trophy className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6 bg-[hsl(var(--background))] border border-[hsl(var(--primary),0.2)] rounded-lg">
                <p className="text-sm text-muted-foreground font-inter">Begin your journey to conquer the PETverse!</p>
              </DialogContent>
            </Dialog>
          </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default LandingPage;