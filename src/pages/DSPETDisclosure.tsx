import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, MessageCircleHeart, Info, Shield, FileText, Users } from 'lucide-react';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Placeholder DisclosureHeader component
const DisclosureHeader: FC = () => (
  <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="max-w-4xl mx-auto p-8 holographic-card">
    <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3 font-russo text-glow-primary">
      <Sparkles className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" /> Swytch PET Disclosure
    </h1>
    <p className="text-muted-foreground max-w-xl mx-auto mt-4 font-inter text-center">
      Understand the risks and responsibilities of joining the PETverse’s decentralized universe.
    </p>
  </SwytchCard>
);

// Placeholder DisclosureContent component
const DisclosureContent: FC = () => (
  <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="max-w-4xl mx-auto p-8 holographic-card">
    <h2 className="text-2xl font-bold text-foreground font-russo mb-4 text-glow-secondary">Important Information</h2>
    <p className="mb-4 text-muted-foreground font-inter">
      The Swytch Private Energy Trust (PET) is a decentralized platform designed to empower users with financial sovereignty through gamified rewards and community governance. Participation involves risks, including cryptocurrency volatility and regulatory uncertainties.
    </p>
    <p className="mb-4 text-muted-foreground font-inter">
      <strong>Investment Risks:</strong> All interactions within Swytch PET, including JEWELS and membership levels, are subject to market risks. Prices may fluctuate, and past performance is not indicative of future results. Users should exercise caution and conduct their own research before engaging.
    </p>
    <p className="mb-4 text-muted-foreground font-inter">
      <strong>Legal Disclaimer:</strong> Swytch PET operates on blockchain technology and is not a registered financial institution, bank, or investment advisor. The platform does not offer financial advice. Users are solely responsible for complying with all local, national, and international regulations regarding cryptocurrency transactions, digital asset ownership, and gaming activities.
    </p>
    <p className="mb-4 text-muted-foreground font-inter">
      <strong>No Gambling:</strong> Swytch PET games are designed as games of skill, and any in-game currency or item with real-world value is obtained through skill-based achievements or marketplace transactions, not through games of chance. We adhere strictly to applicable gaming laws and app store policies.
    </p>
    <p className="mb-4 text-muted-foreground font-inter">
      <strong>KYC/AML:</strong> For fiat withdrawals and certain high-value transactions, Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures may be required to comply with financial regulations.
    </p>
    <p className="mb-4 text-muted-foreground font-inter">
      <strong>Contact:</strong> For support or further inquiries, please reach out to our team via official channels.
    </p>
  </SwytchCard>
);

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

const DSPETDisclosure: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
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
        console.error('Failed to fetch user data for Disclosure page:', err);
        setShowMessage('⚠️ Failed to load disclosure data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to view the disclosure!');
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
      const shareText = encodeURIComponent("Learned about Swytch PETverse’s transparency! 📜 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_disclosure_${Date.now()}`,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'disclosure',
      });
      setShowMessage('🎉 Shared Disclosure on X! Reward pending verification.');
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
        <motion.div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Transparency+Hub"
                  alt="PETverse Disclosure"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <FileText className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Transparency Hub
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Discover the responsibilities and risks of navigating the PETverse’s decentralized universe.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('📜 Explore the transparency hub!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Learn More"
                >
                  Learn More <Info className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Understand the risks and rules of the PETverse!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Transparency Highlights */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Transparency Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Investment Risks',
                  image: 'https://via.placeholder.com/300x200?text=Investment+Risks',
                  description: 'Understand the volatility of crypto assets.',
                  tooltip: 'JEWELS and NFTs may fluctuate in value.',
                },
                {
                  name: 'Legal Disclaimer',
                  image: 'https://via.placeholder.com/300x200?text=Legal+Disclaimer',
                  description: 'PETverse is not a financial institution.',
                  tooltip: 'Comply with local regulations for crypto and gaming.',
                },
                {
                  name: 'KYC/AML Compliance',
                  image: 'https://via.placeholder.com/300x200?text=KYC+AML',
                  description: 'Required for fiat withdrawals.',
                  tooltip: 'Ensure compliance for high-value transactions.',
                },
              ].map((highlight, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={highlight.image} alt={highlight.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{highlight.name}</h3>
                          <p className="text-sm text-muted-foreground">{highlight.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{highlight.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{highlight.description}</p>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Disclosure Content */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Shield className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Full Disclosure
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <DisclosureContent />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Review the full details to navigate the PETverse responsibly.
            </p>
          </motion.section>

          {/* Transparency Showcase */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <FileText className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Transparency Showcase
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Transparency+Showcase"
                  alt="Transparency Showcase"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Our commitment to transparency ensures a fair and secure PETverse experience.
            </p>
          </motion.section>

          {/* Community Transparency Hub CTA */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-accent">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Community Transparency Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Join the PETverse community to discuss transparency and stay informed.
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
                <p className="text-sm text-muted-foreground">Join the PETverse community on Discord or X for transparency discussions!</p>
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
                    aria-label="Share Disclosure on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share Disclosure on X
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Share PETverse transparency on X and earn rewards!</p>
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
                    <Link to="/home" className="w-6 h-6 mr-2" /> Back to Home
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

export default DSPETDisclosure;