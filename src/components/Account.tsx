import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Star, Wallet, ArrowRight, X, Zap, Shield, Rocket, HeartHandshake,
  Quote, Users
} from 'lucide-react';

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
  }
];

const JoinPETverse: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const modalRef = useRef<HTMLDivElement | null>(null);

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
    animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
  };

  const particleVariants = {
    animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }
  };

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
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      {/* Lens Flare Effect */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400 rounded-full opacity-20 blur-3xl pointer-events-none"
        variants={flareVariants}
        animate="animate"
        style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}
      />
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-teal-400 rounded-full opacity-30"
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
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 sm:p-16 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/50 transition-all"
          style={{
            backgroundImage: `url(/bg (60).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
          }}
          aria-label="Join PETverse Hero Section"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/70 to-blue-900/70 rounded-3xl" />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="absolute top-8 left-8 w-4 h-4 bg-cyan-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
            />
            <motion.div
              className="absolute bottom-8 right-8 w-6 h-6 bg-teal-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
            />
          </motion.div>
          <div className="relative space-y-8">
            <motion.h2
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Star className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" /> Join the PETverse
            </motion.h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Embark on a cosmic journey with Swytch. Become a PET (Person of Energy & Truth) and shape a decentralized future.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
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

        {/* Features Section */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-pulse" /> Why Join Swytch?
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Discover the pillars of Swytch’s PETverse, designed to empower you with freedom, rewards, and purpose.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {features.map(({ icon: Icon, title, description, details }, index) => (
              <motion.div
                key={index}
                className="relative bg-gray-900/60 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl hover:shadow-cyan-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ delay: 0.1 * index }}
                aria-label={`Feature: ${title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4 text-cyan-400">
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

        {/* Testimonial Carousel */}
        <motion.div variants={sectionVariants} className="relative space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 animate-pulse" /> PET Voices
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Hear from those already thriving in the PETverse.
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="relative bg-gray-900/60 p-6 sm:p-8 rounded-xl border border-yellow-500/20 backdrop-blur-md max-w-3xl mx-auto text-center"
              aria-label={`Testimonial by ${testimonials[currentTestimonial].author}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl" />
              <div className="relative">
                <p className="text-gray-200 italic text-sm sm:text-base mb-4">"{testimonials[currentTestimonial].quote}"</p>
                <p className="text-yellow-400 font-bold text-sm sm:text-base">{testimonials[currentTestimonial].author}</p>
                <p className="text-gray-300 text-xs sm:text-sm">{testimonials[currentTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Email Signup CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 sm:p-16 border border-teal-500/20 shadow-2xl hover:shadow-teal-500/50 transition-all text-center"
          aria-label="Email Signup Section"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-8">
            <h3 className="text-4xl sm:text-5xl font-bold text-white flex items-center justify-center gap-4">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-teal-400 animate-pulse" /> Stay in the Orbit
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
                className="flex-1 p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                required
                aria-label="Email input"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 rounded-md font-semibold"
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
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-cyan-500/20 shadow-2xl backdrop-blur-lg"
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
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                  aria-label="Close wallet modal"
                >
                  <X className="w-8 h-8" />
                </motion.button>
                <h3 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
                  <Wallet className="w-8 h-8 animate-pulse" /> Enter the PETverse
                </h3>
                <div className="space-y-4">
                  <motion.button
                    className="w-full p-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Connect with MetaMask"
                  >
                    <Wallet className="w-5 h-5" /> Connect MetaMask
                  </motion.button>
                  <motion.button
                    className="w-full p-3 bg-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Connect with WalletConnect"
                  >
                    <Wallet className="w-5 h-5" /> Connect WalletConnect
                  </motion.button>
                  <motion.button
                    className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Generate new wallet"
                  >
                    <Wallet className="w-5 h-5" /> Generate New Wallet
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
        `}</style>
      </motion.div>
    </section>
  );
};

export default JoinPETverse;