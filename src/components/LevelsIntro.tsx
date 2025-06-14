import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  TrendingUp, Star, ShieldCheck, Brain, BarChart2, Sparkles, Gift, BookOpen, ScrollText,
  Trophy, Flashlight, CircleDollarSign, Wallet, ArrowRight, X, Zap
} from 'lucide-react';

const levels = [
  {
    level: 1,
    title: 'Initiate',
    reward: '1.0%',
    energyRequired: '100 SWYT',
    perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'],
    icon: <TrendingUp className="w-6 h-6 text-cyan-400 animate-pulse" />,
    image: '/bg (29).jpg'
  },
  {
    level: 2,
    title: 'Apprentice',
    reward: '1.3%',
    energyRequired: '250 SWYT',
    perks: ['Chatbot Assistant', 'NFT Discounts'],
    icon: <Star className="w-6 h-6 text-purple-400 animate-pulse" />,
    image: '/bg (28).jpg'
  },
  {
    level: 3,
    title: 'Seeker',
    reward: '1.6%',
    energyRequired: '500 SWYT',
    perks: ['Quest Expansion', 'PET ID Perks'],
    icon: <ScrollText className="w-6 h-6 text-amber-400 animate-pulse" />,
    image: '/bg (22).jpg'
  },
  {
    level: 4,
    title: 'Guardian',
    reward: '1.9%',
    energyRequired: '1000 SWYT',
    perks: ['Vault Yield Boost', 'Private Vault Channels'],
    icon: <ShieldCheck className="w-6 h-6 text-orange-400 animate-pulse" />,
    image: '/bg (6).jpg'
  },
  {
    level: 5,
    title: 'Sage',
    reward: '2.2%',
    energyRequired: '3000 SWYT',
    perks: ['Beta Testing Rights', 'Voting Access'],
    icon: <Brain className="w-6 h-6 text-pink-400 animate-pulse" />,
    image: '/bg (8).jpg'
  },
  {
    level: 6,
    title: 'Archon',
    reward: '2.5%',
    energyRequired: '5000 SWYT',
    perks: ['Early Launch Drops', 'DAO Incentives'],
    icon: <BarChart2 className="w-6 h-6 text-yellow-400 animate-pulse" />,
    image: '/bg (9).jpg'
  },
  {
    level: 7,
    title: 'Alchemist',
    reward: '2.8%',
    energyRequired: '7500 SWYT',
    perks: ['Smart Contract Access', 'NFT Mint Tools'],
    icon: <Flashlight className="w-6 h-6 text-violet-400 animate-pulse" />,
    image: '/bg (10).jpg'
  },
  {
    level: 8,
    title: 'Elder',
    reward: '3.1%',
    energyRequired: '9000 SWYT',
    perks: ['Legend Quests', 'Energy Bonus Boost'],
    icon: <Trophy className="w-6 h-6 text-lime-400 animate-pulse" />,
    image: '/bg (12).jpg'
  },
  {
    level: 9,
    title: 'Mythic PET',
    reward: '3.3%',
    energyRequired: '10000 SWYT',
    perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'],
    icon: <CircleDollarSign className="w-6 h-6 text-teal-400 animate-pulse" />,
    image: '/bg (11).jpg'
  }
];

const LevelsIntro = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [hoveredPerk, setHoveredPerk] = useState<{ level: number; perk: string } | null>(null);
  const [currentLevel] = useState(1); // Simulated user level
  const [energyProgress, setEnergyProgress] = useState(50); // Simulated SWYT progress

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

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulate progress update
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyProgress(prev => Math.min(prev + 5, parseInt(levels[currentLevel - 1].energyRequired) || 100));
    }, 2000);
    return () => clearInterval(interval);
  }, [currentLevel]);

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
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/60 to-blue-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-teal-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Levels
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              Ascend through tiers to unlock higher yields, exclusive perks, and deeper autonomy in the Petaverse.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
          <div className="relative space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Zap className="w-6 h-6 text-teal-400 animate-pulse" /> Your Progress
            </h3>
            <p className="text-gray-300">Level {currentLevel}: {levels[currentLevel - 1].title}</p>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <motion.div
                className="bg-teal-500 h-4 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(energyProgress / parseInt(levels[currentLevel - 1].energyRequired)) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {energyProgress} / {levels[currentLevel - 1].energyRequired} SWYT
            </p>
          </div>
        </motion.div>

        {/* Levels Grid */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-cyan-400 animate-pulse" /> Yield Tiers
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Each level amplifies your rewards and unlocks new dimensions of the Swytch ecosystem.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
            {levels.map((tier, i) => (
              <motion.div
                key={tier.level}
                className="relative bg-gray-900/60 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-md shadow-xl hover:shadow-cyan-500/40 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.02, y: -10 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
                <div className="relative">
                  <img
                    src={tier.image}
                    alt={tier.title}
                    className="w-full h-32 object-cover rounded-lg border border-cyan-500/20 mb-4"
                  />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-full">{tier.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Level {tier.level}: {tier.title}</h3>
                      <p className="text-sm text-cyan-300">+{tier.reward} Monthly Yield</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Required: <span className="text-white font-semibold">{tier.energyRequired}</span>
                  </p>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    {tier.perks.map((perk, j) => (
                      <li
                        key={j}
                        className="cursor-pointer hover:text-cyan-300"
                        onMouseEnter={() => setHoveredPerk({ level: tier.level, perk })}
                        onMouseLeave={() => setHoveredPerk(null)}
                      >
                        {perk}
                        {hoveredPerk?.level === tier.level && hoveredPerk.perk === perk && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 bg-gray-800 border border-cyan-500/20 p-2 rounded-md text-sm text-gray-300 mt-1"
                          >
                            {perk} enhances your {tier.title} experience!
                          </motion.div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          variants={sectionVariants}
          className="max-w-3xl mx-auto text-left text-gray-300 text-sm space-y-4"
        >
          <p>
            <Sparkles className="inline w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
            Higher levels unlock DAO governance, exclusive game design tools, and real-world energy conversion.
          </p>
          <p>
            <BookOpen className="inline w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
            Wisdom Energy from Raziel Library quests accelerates your ascent and reveals PET-only lore.
          </p>
          <p>
            <Gift className="inline w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
            Engage with NFTs, events, or referrals to trigger yield multipliers and retroactive rewards.
          </p>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center border-t border-cyan-500/20 pt-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-teal-400 animate-pulse" /> New to Swytch?
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Start with just $50 to claim your PET identity, unlock Vault #1, and begin your first yield quest.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Begin Earning
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-cyan-300 italic text-center max-w-2xl mx-auto"
        >
          🧠 Your rank evolves monthly through staking, learning, and gameplay. Emit more Energy to ascend faster.
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
      </motion.div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default LevelsIntro;