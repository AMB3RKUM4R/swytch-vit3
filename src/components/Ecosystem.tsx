import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Flame, Landmark, Users, Globe2, Rocket, HeartHandshake, Lock, BookOpenCheck, Trophy, Compass,
  Sparkles, Zap, ArrowRight, X, Wallet, Quote
} from 'lucide-react';
import ecosystemImg from '/bg (50).jpg';
import trustImg from '/bg (50).jpg';
import flowImg from '/bg (88).jpg';

const sections = [
  {
    icon: Landmark,
    title: 'Private Energy Trust',
    description: 'The heart of Swytch: a sovereign vault backed by PMA legal structure. Your energy is a measurable asset, fully owned by you—no centralized custody, just pure opt-in freedom.',
    image: trustImg,
  },
  {
    icon: Users,
    title: 'PET Membership',
    description: 'Join a movement, not a platform. PETs (People of Energy & Truth) are creators, not consumers. Earn, vote, propose, and evolve with a sacred, lore-bound identity.',
  },
  {
    icon: Rocket,
    title: 'Multiplayer Energy Economy',
    description: 'Swytch thrives on collaboration. Stake, lend, transfer, or co-create Energy. Form factions, launch missions, and spark trust-based micro-economies.',
  },
  {
    icon: HeartHandshake,
    title: 'Ethical Tokenomics',
    description: 'No inflation, no speculation. JEWELS and FDMT are rooted in proof-of-purpose. Earn, learn, withdraw, re-enter—a fair, transparent value loop.',
  },
  {
    icon: BookOpenCheck,
    title: 'Knowledge as Currency',
    description: 'Raziel, our AI Archive Guardian, offers quests to read, reflect, and grow. Earn JEWELS by exploring sovereignty and consciousness.',
  },
  {
    icon: Lock,
    title: 'Jurisdiction-Free Privacy',
    description: 'No KYC, no surveillance. Swytch’s zero-knowledge trust ensures you reclaim your rights without compromise.',
  },
  {
    icon: Flame,
    title: 'Gamified Onboarding Protocol',
    description: 'Transform, don’t just sign up. NPCs guide you into the PETverse, with missions that encrypt your name into lore-bound power.',
  },
  {
    icon: Trophy,
    title: 'Energy Rewards Protocol',
    description: 'Your JEWELS work for you, growing up to 3.3% monthly. Loyalty isn’t tracked—it’s rewarded with tangible value.',
  },
  {
    icon: Compass,
    title: 'Infinite Expandability',
    description: 'Swytch is modular: new planets, lore, NFTs, lending, health, and spiritual tools. It’s not Web3—it’s WebWe.',
  },
  {
    icon: Globe2,
    title: 'Sovereign Network Layer',
    description: 'Swytch isn’t an app—it’s a digital homeland. A parallel society operating across chains and platforms.',
  },
];

const testimonials = [
  {
    quote: 'Swytch turned my gaming passion into a purpose-driven income stream. I’m not just playing—I’m building my future.',
    author: 'Kael, Seattle',
  },
  {
    quote: 'The PETverse feels like a movement. I’ve learned more about sovereignty here than in years of traditional finance.',
    author: 'Aisha, Dubai',
  },
  {
    quote: 'Earning JEWELS while exploring lore is unreal. Swytch makes crypto accessible and meaningful.',
    author: 'Lucas, São Paulo',
  },
];

const Ecosystem = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const orbitVariants = {
    animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
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

  // Handle email signup
  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for email signup logic
    setEmail('');
    alert('Thank you for joining the Swytch movement! Check your inbox for updates.');
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto space-y-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/60 to-blue-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div
              className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-6 h-6 bg-teal-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
            />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Ecosystem
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              A protocol for freedom, not just a platform. Swytch redefines how you play, earn, and live in a decentralized world.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Join the Movement
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Ecosystem Map */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Our Vision
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Explore the interconnected layers of Swytch, designed to empower PETs worldwide.
          </p>
          <motion.img
            src={ecosystemImg}
            alt="Swytch Ecosystem Map"
            className="w-full rounded-xl border border-cyan-500/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>

        {/* Sections Grid */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {sections.map(({ icon: Icon, title, description, image }, index) => (
            <motion.div
              key={index}
              className="relative bg-gray-900/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-cyan-500/40 transition-all"
              variants={sectionVariants}
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl" />
              <div className="relative">
                <div className="flex items-center mb-4 text-cyan-400">
                  <Icon className="mr-3 w-6 h-6 animate-pulse" />
                  <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <p className="text-gray-300 text-sm">{description}</p>
                {image && (
                  <motion.img
                    src={image}
                    alt={title}
                    className="mt-4 rounded-xl border border-cyan-500/10 w-full h-32 object-cover"
                    whileHover={{ scale: 1.05 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div variants={sectionVariants} className="relative space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Quote className="w-8 h-8 text-yellow-400 animate-pulse" /> Voices of the PETverse
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Hear from PETs shaping the future of Swytch.
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gray-900/60 p-6 rounded-xl border border-yellow-500/20 backdrop-blur-md max-w-2xl mx-auto text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl" />
              <div className="relative">
                <p className="text-gray-300 italic mb-2">"{testimonials[currentTestimonial].quote}"</p>
                <p className="text-yellow-400 font-bold">— {testimonials[currentTestimonial].author}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Flow Diagram */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Compass className="w-8 h-8 text-teal-400 animate-pulse" /> How It Works
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Visualize the flow of Energy, JEWELS, and rewards in the Swytch ecosystem.
          </p>
          <motion.img
            src={flowImg}
            alt="Swytch Flow"
            className="w-full rounded-xl border border-cyan-500/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>

        {/* Email Signup CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" /> Join the PETverse
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Be the first to access Swytch’s decentralized future. Sign up for early updates and exclusive rewards.
            </p>
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 rounded-md font-semibold"
              >
                Sign Up
              </button>
            </form>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-cyan-300 italic text-center max-w-xl mx-auto"
        >
          Note: Swytch is a living ecosystem. Your actions define its value. Once you Swytch, you evolve.
        </motion.div>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-cyan-500/20 shadow-2xl backdrop-blur-lg"
                animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <motion.button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                >
                  <X className="w-8 h-8" />
                </motion.button>
                <h3 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
                  <Wallet className="w-8 h-8 animate-pulse" /> Connect to Swytch
                </h3>
                <div className="space-y-4">
                  <motion.button
                    className="w-full p-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Wallet className="w-5 h-5" /> Connect MetaMask
                  </motion.button>
                  <motion.button
                    className="w-full p-3 bg-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Wallet className="w-5 h-5" /> Connect WalletConnect
                  </motion.button>
                  <motion.button
                    className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
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
        `}</style>
      </motion.div>
    </section>
  );
};

export default Ecosystem;