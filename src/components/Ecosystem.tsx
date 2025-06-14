import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Landmark, Users, Globe2, Rocket, HeartHandshake, Lock, BookOpenCheck, Trophy, Compass,
  Sparkles, Zap, ArrowRight, X, Wallet, Quote, HelpCircle, Star, Shield, BarChart2
} from 'lucide-react';
import ecosystemImg from '/bg (50).jpg';
import trustImg from '/bg (50).jpg';
import flowImg from '/bg (88).jpg';
import roadmapImg from '/bg (59).jpg';

const sections = [
  {
    icon: Landmark,
    title: 'Private Energy Trust',
    description: 'The core of Swytch: a sovereign vault backed by PMA legal structure. Your energy is a measurable asset, fully owned by you—no centralized custody, just pure opt-in freedom.',
    image: trustImg,
    details: 'Built on zero-knowledge proofs, the Trust ensures your data remains private while enabling verifiable transactions across the PETverse.'
  },
  {
    icon: Users,
    title: 'PET Membership',
    description: 'Join a movement, not a platform. PETs (People of Energy & Truth) are creators, not consumers. Earn, vote, propose, and evolve with a sacred, lore-bound identity.',
    details: 'Membership includes access to exclusive quests, governance rights, and a unique NFT avatar that evolves with your contributions.'
  },
  {
    icon: Rocket,
    title: 'Multiplayer Energy Economy',
    description: 'Swytch thrives on collaboration. Stake, lend, transfer, or co-create Energy. Form factions, launch missions, and spark trust-based micro-economies.',
    details: 'Cross-chain compatibility allows seamless interactions with Ethereum, Polygon, and Solana-based assets.'
  },
  {
    icon: HeartHandshake,
    title: 'Ethical Tokenomics',
    description: 'No inflation, no speculation. JEWELS and FDMT are rooted in proof-of-purpose. Earn, learn, withdraw, re-enter—a fair, transparent value loop.',
    details: 'JEWELS are capped at 100M, with FDMT tied to real-world energy contributions, ensuring long-term stability.'
  },
  {
    icon: BookOpenCheck,
    title: 'Knowledge as Currency',
    description: 'Raziel, our AI Archive Guardian, offers quests to read, reflect, and grow. Earn JEWELS by exploring sovereignty and consciousness.',
    details: 'Quests range from philosophy to blockchain basics, with gamified milestones to track your progress.'
  },
  {
    icon: Lock,
    title: 'Jurisdiction-Free Privacy',
    description: 'No KYC, no surveillance. Swytch’s zero-knowledge trust ensures you reclaim your rights without compromise.',
    details: 'Leverages zk-SNARKs for anonymous yet verifiable interactions, protecting your identity globally.'
  },
  {
    icon: Flame,
    title: 'Gamified Onboarding Protocol',
    description: 'Transform, don’t just sign up. NPCs guide you into the PETverse, with missions that encrypt your name into lore-bound power.',
    details: 'Onboarding includes a 3D interactive tutorial with voice-guided NPCs, blending storytelling and education.'
  },
  {
    icon: Trophy,
    title: 'Energy Rewards Protocol',
    description: 'Your JEWELS work for you, growing up to 3.3% monthly. Loyalty isn’t tracked—it’s rewarded with tangible value.',
    details: 'Rewards are distributed via smart contracts, with options to reinvest or withdraw to external wallets.'
  },
  {
    icon: Compass,
    title: 'Infinite Expandability',
    description: 'Swytch is modular: new planets, lore, NFTs, lending, health, and spiritual tools. It’s not Web3—it’s WebWe.',
    details: 'Future modules include DeFi lending pools, wellness tracking, and cross-metaverse integrations.'
  },
  {
    icon: Globe2,
    title: 'Sovereign Network Layer',
    description: 'Swytch isn’t an app—it’s a digital homeland. A parallel society operating across chains and platforms.',
    details: 'Runs on a decentralized node network, ensuring uptime and censorship resistance.'
  },
  {
    icon: Shield,
    title: 'Community Governance',
    description: 'PETs shape Swytch’s future. Propose and vote on new features, lore expansions, and reward structures.',
    details: 'Governance uses quadratic voting to ensure fair representation, with proposals tracked on-chain.'
  },
  {
    icon: Star,
    title: 'Interstellar Lore',
    description: 'Swytch’s narrative evolves with user contributions. Craft stories, quests, and planets in the PETverse.',
    details: 'Lore is stored on IPFS, with top contributions minted as limited-edition NFTs.'
  }
];

const testimonials = [
  {
    quote: 'Swytch turned my gaming passion into a purpose-driven income stream. I’m not just playing—I’m building my future.',
    author: 'Kael, Seattle',
    role: 'Gamer & PET',
    avatar: '/avatar1.png'
  },
  {
    quote: 'The PETverse feels like a movement. I’ve learned more about sovereignty here than in years of traditional finance.',
    author: 'Aisha, Dubai',
    role: 'Financial Analyst',
    avatar: '/avatar2.png'
  },
  {
    quote: 'Earning JEWELS while exploring lore is unreal. Swytch makes crypto accessible and meaningful.',
    author: 'Lucas, São Paulo',
    role: 'Content Creator',
    avatar: '/avatar3.png'
  },
  {
    quote: 'Swytch’s privacy focus gives me peace of mind. I control my data, and that’s empowering.',
    author: 'Mei, Tokyo',
    role: 'Privacy Advocate',
    avatar: '/avatar4.png'
  },
  {
    quote: 'The gamified onboarding made joining Swytch a journey, not a chore. I’m hooked!',
    author: 'Raj, Mumbai',
    role: 'Web3 Newcomer',
    avatar: '/avatar5.png'
  }
];

const faqs = [
  {
    question: 'What is Swytch?',
    answer: 'Swytch is a decentralized protocol for energy, identity, and value exchange, empowering users to own their data and participate in a trust-based economy.'
  },
  {
    question: 'How do I join the PETverse?',
    answer: 'Connect your wallet (e.g., MetaMask) or generate a new one via Swytch. Complete the gamified onboarding to become a PET and access rewards.'
  },
  {
    question: 'What are JEWELS and FDMT?',
    answer: 'JEWELS are Swytch’s governance and reward tokens, while FDMT represents energy contributions. Both are earned through participation and quests.'
  },
  {
    question: 'Is my data private on Swytch?',
    answer: 'Yes, Swytch uses zero-knowledge proofs and zk-SNARKs to ensure your data remains private and secure, with no KYC required.'
  }
];

const Ecosystem: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  const orbitVariants = {
    animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } }
  };

  const particleVariants = {
    animate: { y: [0, -10, 0], opacity: [0.5, 1, 0.5], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
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
    }, 6000);
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
    alert('Thank you for joining the Swytch movement! Check your inbox for updates.');
  };

  // Toggle FAQ
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
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
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 8}% ${50 + mousePosition.y * 8}%`
          }}
          aria-label="Swytch Ecosystem Hero Section"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/70 to-blue-900/70 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div
              className="absolute top-12 left-12 w-5 h-5 bg-cyan-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.6, 1], transition: { duration: 2.5, repeat: Infinity } }}
            />
            <motion.div
              className="absolute bottom-12 right-12 w-7 h-7 bg-teal-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.4, 1], transition: { duration: 3.5, repeat: Infinity } }}
            />
          </motion.div>
          <div className="relative space-y-8">
            <motion.h2
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -12, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" /> Swytch Ecosystem
            </motion.h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              A protocol for freedom, not just a platform. Swytch redefines how you play, earn, and live in a decentralized, trust-based world.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Join the Swytch Movement"
            >
              Join the Movement
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Ecosystem Map */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-pulse" /> Our Vision
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Explore the interconnected layers of Swytch, designed to empower PETs (People of Energy & Truth) worldwide.
          </p>
          <motion.img
            src={ecosystemImg}
            alt="Swytch Ecosystem Map"
            className="w-full rounded-xl border border-cyan-500/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </motion.div>

        {/* Sections Grid */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 text-left">
          {sections.map(({ icon: Icon, title, description, image, details }, index) => (
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
                  <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
                </div>
                <p className="text-gray-200 text-sm sm:text-base mb-4">{description}</p>
                <p className="text-gray-300 text-xs sm:text-sm italic">{details}</p>
                {image && (
                  <motion.img
                    src={image}
                    alt={title}
                    className="mt-4 rounded-xl border border-cyan-500/10 w-full h-32 sm:h-40 object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    loading="lazy"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div variants={sectionVariants} className="relative space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 animate-pulse" /> Voices of the PETverse
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Hear from PETs shaping the future of Swytch with their stories of empowerment and innovation.
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
              <div className="relative flex flex-col items-center gap-4">
                {testimonials[currentTestimonial].avatar && (
                  <motion.img
                    src={testimonials[currentTestimonial].avatar}
                    alt={`${testimonials[currentTestimonial].author}'s avatar`}
                    className="w-16 h-16 rounded-full border border-yellow-500/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
                <p className="text-gray-200 italic text-sm sm:text-base">"{testimonials[currentTestimonial].quote}"</p>
                <div>
                  <p className="text-yellow-400 font-bold text-sm sm:text-base">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-300 text-xs sm:text-sm">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Flow Diagram */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400 animate-pulse" /> How It Works
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Visualize the flow of Energy, JEWELS, and rewards in Swytch’s decentralized ecosystem.
          </p>
          <motion.img
            src={flowImg}
            alt="Swytch Flow Diagram"
            className="w-full rounded-xl border border-cyan-500/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </motion.div>

        {/* Roadmap Preview */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <BarChart2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-pulse" /> Roadmap Preview
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            A glimpse into Swytch’s future: new features, integrations, and community-driven expansions.
          </p>
          <motion.img
            src={roadmapImg}
            alt="Swytch Roadmap Preview"
            className="w-full rounded-xl border border-purple-500/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-pulse" /> Frequently Asked Questions
          </h3>
          <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto">
            Get answers to common questions about Swytch and the PETverse.
          </p>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map(({ question, answer }, index) => (
              <motion.div
                key={index}
                className="bg-gray-900/60 border border-blue-500/20 rounded-xl p-4 sm:p-6 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <button
                  className="w-full flex justify-between items-center text-left text-blue-400 font-semibold text-sm sm:text-base"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  aria-describedby={`faq-answer-${index}`}
                >
                  {question}
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="text-gray-200 text-sm sm:text-base mt-2"
                    >
                      {answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
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
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-teal-400 animate-pulse" /> Join the PETverse
            </h3>
            <p className="text-lg sm:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Be the first to access Swytch’s decentralized future. Sign up for early updates, exclusive rewards, and PETverse access.
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
                Sign Up
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm sm:text-base text-cyan-300 italic text-center max-w-2xl mx-auto"
        >
          Note: Swytch is a living ecosystem. Your actions define its value. Once you Swytch, you evolve into a sovereign creator.
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
                  Connect your wallet to join the Swytch ecosystem
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
                  <Wallet className="w-8 h-8 animate-pulse" /> Connect to Swytch
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
        `}</style>
      </motion.div>
    </section>
  );
};

export default Ecosystem;