"use client";

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Star, Wallet, ArrowRight, X, Zap, Shield, Rocket, HeartHandshake,
  Quote, Users, BookOpenCheck, Vote
} from 'lucide-react';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { wagmiConfig } from '../lib/wagmi'; // Adjust path to your wagmiConfig file

const features = [
  {
    icon: Flame,
    title: 'Ignite Your Journey',
    description: 'Step into the PETverse with a gamified onboarding experience guided by lore-driven NPCs. Transform your identity into a sovereign creator.',
    details: 'Complete interactive quests to unlock your unique PET avatar and JEWELS rewards.'
  },
  {
    icon: Shield,
    title: 'Unbreakable Privacy',
    description: 'Zero-knowledge proofs protect your data. No KYC, no tracking—just pure, jurisdiction-free freedom.',
    details: 'Powered by zk-SNARKs for anonymous, verifiable interactions across the ecosystem.'
  },
  {
    icon: Rocket,
    title: 'Launch Your Economy',
    description: 'Stake, lend, or co-create Energy in Swytch’s multiplayer economy. Build wealth with trust-based micro-economies.',
    details: 'Cross-chain support for Ethereum, Polygon, and Solana ensures seamless asset flow.'
  },
  {
    icon: HeartHandshake,
    title: 'Ethical Rewards',
    description: 'Earn JEWELS and FDMT through proof-of-purpose. Grow your assets with up to 3.3% monthly rewards.',
    details: 'Capped token supply ensures fairness and long-term value stability.'
  }
];

const testimonials = [
  {
    quote: 'Joining Swytch felt like stepping into a sci-fi epic. The onboarding is a game-changer!',
    author: 'Zara, London',
    role: 'Web3 Enthusiast'
  },
  {
    quote: 'Swytch’s privacy-first approach made me feel in control. It’s a true digital homeland.',
    author: 'Eli, Berlin',
    role: 'Privacy Advocate'
  },
  {
    quote: 'The PETverse’s lore pulled me in. I’m already crafting my own stories!',
    author: 'Nova, Sydney',
    role: 'Storyteller'
  }
];

const loreSnippets = [
  {
    title: 'The Genesis Spark',
    excerpt: 'In the void of the PETverse, a spark ignited—a fusion of Energy and Truth. PETs rose to forge a new cosmos, unbound by chains.',
    icon: Star
  },
  {
    title: 'Raziel’s Archive',
    excerpt: 'Guarded by Raziel, the AI sentinel, ancient knowledge fuels quests. Seek wisdom, earn JEWELS, and shape the PETverse’s fate.',
    icon: BookOpenCheck
  }
];

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }
};

const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const metaMaskConnector = connectors.find((c) => c.id === 'metaMask');
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');

  return (
    <div className="space-y-4">
      <motion.button
        onClick={() => (isConnected ? disconnect() : metaMaskConnector && connect({ connector: metaMaskConnector }))}
        className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-600 hover:bg-rose-700'
        } text-white transition-all`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isConnected ? 'Disconnect MetaMask' : 'Connect MetaMask'}
        disabled={!metaMaskConnector}
      >
        <Wallet className="w-5 h-5 text-rose-400 animate-pulse" />
        {isConnected ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connect MetaMask'}
      </motion.button>
      <motion.button
        onClick={() => (isConnected ? disconnect() : walletConnectConnector && connect({ connector: walletConnectConnector }))}
        className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'
        } text-white transition-all`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isConnected ? 'Disconnect WalletConnect' : 'Connect WalletConnect'}
        disabled={!walletConnectConnector}
      >
        <Wallet className="w-5 h-5 text-rose-400 animate-pulse" />
        {isConnected ? 'Disconnect' : 'Connect WalletConnect'}
      </motion.button>
    </div>
  );
};

// Main Component
const JoinPETverse: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { address, isConnected, chain } = useAccount();

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Modal focus trap
  useEffect(() => {
    if (showWalletModal && modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowWalletModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showWalletModal]);

  // Handle email signup
  const handleEmailSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail('');
    alert('Welcome to the PETverse! Check your inbox for exclusive updates.');
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden">
      {/* Heavy Lens Dirt Effect */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-rose-600/30 rounded-full opacity-30 blur-3xl pointer-events-none"
        variants={flareVariants}
        animate="animate"
        style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-rose-500/20 rounded-full opacity-20 blur-2xl pointer-events-none"
        variants={flareVariants}
        animate="animate"
        style={{ transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)` }}
      />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-rose-400 rounded-full opacity-30"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto space-y-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 sm:p-16 border border-rose-500/30 shadow-2xl hover:shadow-rose-500/50 transition-all"
          style={{
            backgroundImage: `url(/bg (60).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
          }}
          aria-label="Join PETverse Hero Section"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/50 to-indigo-900/70 rounded-3xl" />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="absolute top-8 left-8 w-4 h-4 bg-rose-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
            />
            <motion.div
              className="absolute bottom-8 right-8 w-6 h-6 bg-pink-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
            />
          </motion.div>
          <div className="relative space-y-8">
            <motion.h2
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Star className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" /> Join the PETverse
            </motion.h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Embark on a cosmic odyssey with Swytch. Become a PET and forge a decentralized destiny.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Connect Wallet to Join"
            >
              Connect Wallet
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-rose-300 italic text-center max-w-xl mx-auto"
        >
          <p>
            🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
            🔗 Network: {chain?.name || 'Unknown'} | 
            💼 Status: {isConnected ? 'Active' : 'Inactive'}
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> Why Join Swytch?
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Discover the pillars of Swytch’s PETverse, crafted to empower you with freedom, rewards, and purpose.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {features.map(({ icon: Icon, title, description, details }, index) => (
              <motion.div
                key={index}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ delay: 0.1 * index }}
                aria-label={`Feature: ${title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4 text-rose-400">
                    <Icon className="mr-3 w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                    <h4 className="text-xl sm:text-2xl font-bold">{title}</h4>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base mb-4">{description}</p>
                  <p className="text-gray-300 text-xs sm:text-sm italic">{details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lore Preview Section */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <BookOpenCheck className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> Explore the Lore
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Dive into the PETverse’s interstellar narrative. Craft your own stories and shape the cosmos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {loreSnippets.map(({ title, excerpt, icon: Icon }, index) => (
              <motion.div
                key={index}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ delay: 0.1 * index }}
                aria-label={`Lore: ${title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4 text-rose-400">
                    <Icon className="mr-3 w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                    <h4 className="text-xl sm:text-2xl font-bold">{title}</h4>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base">{excerpt}</p>
                  <motion.button
                    className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-md text-sm font-semibold group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Learn more about ${title}`}
                  >
                    Read More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Hub Section */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Vote className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> Shape the Future
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Join PET factions, propose ideas, and govern the PETverse. Your voice drives Swytch’s evolution.
          </p>
          <div className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
            <div className="relative space-y-4">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-rose-400 mx-auto animate-pulse" />
              <p className="text-gray-200 text-sm sm:text-base">
                Connect with PETs worldwide. Form factions, vote on proposals, or launch community quests.
              </p>
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-md text-base font-semibold group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Join the Community"
              >
                Join Community
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div variants={sectionVariants} className="relative space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> PET Voices
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Hear from those thriving in the PETverse’s cosmic expanse.
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="relative bg-gray-900/60 p-6 sm:p-8 rounded-xl border border-rose-500/20 backdrop-blur-md max-w-3xl mx-auto text-center"
              aria-label={`Testimonial by ${testimonials[currentTestimonial].author}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl" />
              <div className="relative">
                <p className="text-gray-200 italic text-sm sm:text-base mb-4">"{testimonials[currentTestimonial].quote}"</p>
                <p className="text-rose-400 font-bold text-sm sm:text-base">{testimonials[currentTestimonial].author}</p>
                <p className="text-gray-300 text-xs sm:text-sm">{testimonials[currentTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Email Signup CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 sm:p-16 border border-rose-500/20 shadow-2xl hover:shadow-rose-500/50 transition-all text-center"
          aria-label="Email Signup Section"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
          <div className="relative space-y-8">
            <h3 className="text-4xl sm:text-5xl font-bold text-white flex items-center justify-center gap-4">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 animate-pulse" /> Stay in the Orbit
            </h3>
            <p className="text-lg sm:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Sign up for cosmic updates, exclusive quests, and early access to the PETverse.
            </p>
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 p-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 outline-none"
                required
                aria-label="Email input"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-md font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Submit email"
              >
                Join Now
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Wallet Connection Modal"
              aria-describedby="wallet-modal-description"
            >
              <motion.div
                ref={modalRef}
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-rose-500/20 shadow-2xl backdrop-blur-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.4 }}
                tabIndex={-1}
                aria-describedby="wallet-modal-description"
              >
                <p id="wallet-modal-description" className="sr-only">
                  Connect your wallet to join the Swytch PETverse
                </p>
                <motion.button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                  aria-label="Close wallet modal"
                >
                  <X className="w-8 h-8" />
                </motion.button>
                <h3 className="text-3xl font-bold text-rose-400 mb-6 flex items-center gap-3">
                  <Wallet className="w-8 h-8 animate-pulse" /> Enter the PETverse
                </h3>
                <div className="space-y-4">
                  <ConnectWalletButton />
                  <motion.button
                    className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => alert('Wallet generation not implemented yet.')}
                    aria-label="Generate new wallet"
                  >
                    <Wallet className="w-5 h-5 text-rose-400 animate-pulse" /> Generate New Wallet
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          input:focus {
            transition: border-color 0.3s ease, ring-color 0.3s ease;
          }
          .blur-3xl {
            filter: blur(64px);
          }
          .blur-2xl {
            filter: blur(32px);
          }
          .bg-[url('/noise.png')] {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiQpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
            background-repeat: repeat;
            background-size: 64px 64px;
          }
        `}</style>
      </motion.div>
    </section>
  );
};

// Wrap JoinPETverse with WagmiProvider
const JoinPETverseWithProvider: React.FC = () => (
  <WagmiProvider config={wagmiConfig}>
    <JoinPETverse />
  </WagmiProvider>
);

export default JoinPETverseWithProvider;