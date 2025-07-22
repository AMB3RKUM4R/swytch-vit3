// src/pages/LandingPage.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Wallet, Gamepad2, Gem, Link } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import SwytchCard from '../components/SwytchCard';

// Import PageProps for consistency
import { PageProps } from '../lib/types';

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

const LandingPage: FC<PageProps> = ({ setActiveModal, setShowMessage, userId }) => { // Added userId prop

  const handleGetStartedClick = () => {
    if (!userId) { // Only show auth modal if not already logged in
      setActiveModal('auth');
      setShowMessage('👋 Welcome! Please sign in or connect your wallet to get started.');
    } else {
      setShowMessage('🎉 Welcome back! Navigating to Home.');
      // Optionally navigate to /home if already logged in
      // navigate('/home');
    }
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white font-inter bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background flares and particles */}
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
            style={{ top: "15%", left: "20%" }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-cyan-400/20 rounded-full opacity-20 blur-2xl"
            variants={flareVariants}
            animate="animate"
            style={{ bottom: "10%", right: "15%" }}
          />
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-landing-${i}`}
              className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-30"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              variants={particleVariants}
              animate="animate"
            />
          ))}
        </motion.div>

        <motion.div className="relative z-20 max-w-6xl mx-auto py-16 px-6 sm:px-8 lg:px-16 flex flex-col items-center justify-center min-h-screen">
          {/* Hero Section */}
          <motion.div variants={sectionVariants} className="text-center mb-12">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight font-poppins mb-6">
              <Sparkles className="inline-block w-12 h-12 text-cyan-400 animate-pulse mr-4" />
              SWYTCH PETverse
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto font-inter mb-8">
              Re-innovate your favorite classic games with **real item ownership**, **crypto rewards**, and a **decentralized marketplace**.
            </p>
            <motion.button
              className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
              onClick={handleGetStartedClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get Started"
            >
              Get Started <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
            <SwytchCard gradient="from-rose-500/20 to-pink-700/20" className="p-6 text-center">
              <Gem className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white font-poppins mb-2">True Ownership</h3>
              <p className="text-gray-300 text-sm">Your in-game items become real, tradable assets.</p>
            </SwytchCard>
            <SwytchCard gradient="from-cyan-500/20 to-blue-700/20" className="p-6 text-center">
              <Gamepad2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white font-poppins mb-2">Play & Earn</h3>
              <p className="text-gray-300 text-sm">Earn crypto and valuable items by playing skill-based games.</p>
            </SwytchCard>
            <SwytchCard gradient="from-green-500/20 to-teal-700/20" className="p-6 text-center">
              <Wallet className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white font-poppins mb-2">Seamless Economy</h3>
              <p className="text-gray-300 text-sm">Buy, sell, and swap items and currencies with ease.</p>
            </SwytchCard>
          </motion.div>

          {/* Footer Navigation Links (Optional, can be removed if BottomNav is sufficient) */}
          <motion.div variants={sectionVariants} className="text-center mt-auto pt-8">
            <p className="text-gray-400 text-sm font-inter">
              Learn more about Swytch PETverse:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link to="/dspet-disclosure" className="text-primary hover:underline font-inter" onClick={() => setShowMessage('📜 Navigating to Disclosure!')}>Disclosure</Link>
              <Link to="/community" className="text-primary hover:underline font-inter" onClick={() => setShowMessage('👥 Navigating to Community!')}>Community</Link>
              <Link to="/membership" className="text-primary hover:underline font-inter" onClick={() => setShowMessage('🌟 Navigating to Membership!')}>Membership</Link>
              <Link to="/vault" className="text-primary hover:underline font-inter" onClick={() => setShowMessage('💰 Navigating to Vault!')}>Vault</Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default LandingPage;
