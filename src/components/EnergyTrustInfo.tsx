import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Lock, Shield, Book, Zap, Globe, ArrowRight, Wallet, RefreshCw, Send, Sparkles, Star } from 'lucide-react';

interface InfoCard {
  icon: string;
  title: string;
  text: string;
  details: string;
}

const EnergyTrustInfo = () => {
  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const orbitVariants = {
    animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } }
  };

  const infiniteScroll = {
    animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 25, ease: 'linear' } } }
  };

  const infoCards: InfoCard[] = [
    {
      icon: '/icon_1.gif',
      title: 'PMA-Backed Structure',
      text: 'Swytch thrives under a Private Ministerial Association (PMA), liberated from corporate or state control.',
      details: 'Members opt-in via contract, securing constitutional and spiritual sovereignty. Backed by UDHR and amendments, Swytch ensures your privacy and lawful autonomy, free from public system reliance.'
    },
    {
      icon: '/icon_2.gif',
      title: 'Immutable by Design',
      text: 'Every action and reward is etched on an open blockchain with smart contracts.',
      details: 'No admin overrides, no backend dependencies—just deterministic, public logic. This is anti-corruption tech, safeguarding your Energy with unyielding integrity.'
    },
    {
      icon: '/icon_3.gif',
      title: 'Education is Yield',
      text: 'Boost monthly JEWELS yield through quests in the Raziel Library.',
      details: 'Raziel tracks your knowledge journey in decentralized modules. Unlock quests and articles to earn extra yield monthly—your consciousness fuels your rewards.'
    },
    {
      icon: '/icon_1.gif',
      title: 'JEWELS as Proof',
      text: 'Tokens earned through effort, not speculation, symbolizing your service.',
      details: 'JEWELS are your proof-of-work and intent in the PET system. Timestamped and valuable, they unlock vault upgrades, access, or stablecoin liquidity exits.'
    },
    {
      icon: '/icon_2.gif',
      title: 'Zero Data Collection',
      text: 'No emails, no biometrics, no KYC—just pure contract-based autonomy.',
      details: 'Swytch collects no user data. Your PET vault and identity are encrypted contracts and local logic, ensuring your sovereignty by default.'
    },
    {
      icon: '/icon_3.gif',
      title: 'Cross-Chain Ready',
      text: 'Swytch operates across EVM chains like Avalanche, Polygon, and BSC.',
      details: 'No blockchain tribalism here. Smart adapters enable seamless operation across networks and vault structures, adapting to your needs wherever you are.'
    }
  ];

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let frameId: number;
    const scroll = () => {
      scrollContainer.scrollLeft += 1;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      }
      frameId = requestAnimationFrame(scroll);
    };
    frameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto space-y-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Parallax and Orbiting Elements */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/50 to-blue-900/50 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-teal-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-cyan-400 tracking-tight flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12 animate-pulse" /> Private Energy Trust
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Swytch is a declaration of sovereignty—encoded in smart contracts, shielded by constitutional rights, and fueled by Energy. Become a PET and redefine your freedom.
            </p>
            <button
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
            >
              Claim Your Sovereignty
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Info Cards with Infinite Scroll */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Star className="w-10 h-10 text-cyan-400 animate-pulse" /> Why Swytch?
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Discover the pillars of the Private Energy Trust, designed to empower your autonomy and reward your Energy.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...infoCards, ...infoCards].map((card, i) => (
                <motion.div
                  key={`${card.title}-${i}`}
                  className="flex-shrink-0 w-[300px] bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all backdrop-blur-md cursor-pointer"
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="flex items-center mb-4 text-cyan-400">
                    <img src={card.icon} alt="icon" className="w-8 h-8 mr-3 rounded-md animate-pulse" />
                    <h3 className="text-xl font-bold">{card.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{card.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Wallet & Swap Forms */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto"
        >
          <motion.div
            className="relative bg-gray-900/60 p-8 rounded-xl border border-cyan-500/20 shadow-xl backdrop-blur-md"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
            <div className="relative space-y-4">
              <h4 className="text-2xl font-semibold text-white flex items-center gap-3">
                <Wallet className="w-6 h-6 text-cyan-400 animate-pulse" /> Connect Wallet
              </h4>
              <input type="text" placeholder="0x..." className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-cyan-500" />
              <p className="text-gray-400 text-sm">Use your Avalanche-compatible address.</p>
              <button className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold">Connect</button>
            </div>
          </motion.div>

          <motion.div
            className="relative bg-gray-900/60 p-8 rounded-xl border border-teal-500/20 shadow-xl backdrop-blur-md"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
            <div className="relative space-y-4">
              <h4 className="text-2xl font-semibold text-white flex items-center gap-3">
                <Send className="w-6 h-6 text-teal-400 animate-pulse" /> Deposit JEWELS
              </h4>
              <input type="number" placeholder="Amount in USDT" className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-teal-500" />
              <select className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-teal-500">
                <option>Choose Network</option>
                <option>Avalanche</option>
                <option>Polygon</option>
              </select>
              <button className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">Deposit</button>
            </div>
          </motion.div>

          <motion.div
            className="relative bg-gray-900/60 p-8 rounded-xl border border-yellow-500/20 shadow-xl backdrop-blur-md"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl" />
            <div className="relative space-y-4">
              <h4 className="text-2xl font-semibold text-white flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-yellow-400 animate-pulse" /> Withdraw & Swap
              </h4>
              <input type="number" placeholder="Amount to Withdraw" className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-yellow-500" />
              <select className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-yellow-500">
                <option>Select Target Token</option>
                <option>USDT</option>
                <option>FDMT</option>
                <option>JSIT</option>
              </select>
              <button className="w-full py-3 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold">Swap & Withdraw</button>
            </div>
          </motion.div>
        </motion.div>

        {/* Crypto Usage Section */}
        <motion.div
          variants={sectionVariants}
          className="relative max-w-4xl mx-auto text-left bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/20 shadow-2xl hover:shadow-purple-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-bold text-white flex items-center gap-4">
              <Zap className="w-10 h-10 text-purple-400 animate-pulse" /> How Swytch Uses Crypto
            </h3>
            <p className="text-lg text-gray-300">
              In Swytch, crypto is your tool for transformation. JEWELS are time-earned, Energy-bound tokens that unlock ecosystem features, quests, or stablecoin conversions.
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>No gas fees inside the app</li>
              <li>Withdraw directly to stablecoin via smart contracts</li>
              <li>Track your vault via the Trust HUD</li>
              <li>Every action is ledger-traced—visible, yet private</li>
            </ul>
          </div>
        </motion.div>

        {/* Begin Your Journey Section */}
        <motion.div
          variants={sectionVariants}
          className="relative max-w-4xl mx-auto text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
              <Globe className="w-10 h-10 text-teal-400 animate-pulse" /> Begin Your Journey
            </h3>
            <p className="text-lg text-gray-300">
              Take the first step into the Swytch ecosystem. Learn how to join in three simple steps and start earning Energy.
            </p>
            <button
              onClick={() => setShowStepsModal(true)}
              className="bg-teal-600 px-8 py-4 text-white rounded-full hover:bg-teal-700 font-semibold"
            >
              Discover the Steps
            </button>
          </div>
        </motion.div>

        {/* Selected Card Modal */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-2xl w-full p-8 relative border border-cyan-500/20 shadow-2xl"
                animate={{ rotateY: [0, 5, -5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400"
                >
                  <Lock className="w-6 h-6" />
                </button>
                <div className="flex items-center mb-6">
                  <img src={selectedCard.icon} alt="icon" className="w-12 h-12 mr-4 rounded-md animate-pulse" />
                  <h3 className="text-3xl font-bold text-cyan-400">{selectedCard.title}</h3>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed">{selectedCard.details}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps Modal */}
        <AnimatePresence>
          {showStepsModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-lg w-full p-8 relative border border-teal-500/20 shadow-2xl"
                animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <button
                  onClick={() => setShowStepsModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-teal-400"
                >
                  <Shield className="w-6 h-6" />
                </button>
                <h3 className="text-3xl font-bold text-teal-400 mb-6 flex items-center gap-3">
                  <Book className="w-8 h-8 animate-pulse" /> Your Swytch Initiation
                </h3>
                <ol className="list-decimal list-inside text-gray-300 space-y-4 text-lg">
                  <li><strong>Connect Email:</strong> Register with a verified email to begin your journey.</li>
                  <li><strong>Mint Wallet:</strong> Generate a self-sovereign wallet—encrypted, no downloads needed.</li>
                  <li><strong>Earn Energy:</strong> Use your wallet to earn, deposit, and unlock real-world utility.</li>
                </ol>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-cyan-500/20 shadow-2xl"
                animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400"
                >
                  <Wallet className="w-6 h-6" />
                </button>
                <h3 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 animate-pulse" /> Connect to Swytch
                </h3>
                <div className="space-y-4">
                  <button className="w-full p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5" /> Connect MetaMask
                  </button>
                  <button className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5" /> Connect WalletConnect
                  </button>
                  <button className="w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5" /> Generate New Wallet
                  </button>
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

export default EnergyTrustInfo;