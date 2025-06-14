import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Banknote, LockKeyhole, LibraryBig, Users, Globe2, PiggyBank, Gamepad2, Sparkles, AlertTriangle, Wallet, ArrowRight, X
} from 'lucide-react';
import {
  FaWallet, FaCoins, FaLock, FaGoogleWallet, FaDollarSign, FaChartPie, FaCogs
} from 'react-icons/fa';

const benefits = [
  {
    title: 'Unbreakable Security',
    description: 'Your data is distributed across a decentralized network, immune to hacks or single-point failures.',
    icon: LockKeyhole,
  },
  {
    title: 'Absolute Privacy',
    description: 'You control your data, choosing anonymity or selective sharing with zero compromise.',
    icon: ShieldCheck,
  },
  {
    title: 'Crystal Transparency',
    description: 'Every action is recorded on a tamper-proof public ledger, ensuring trust and accountability.',
    icon: Banknote,
  },
  {
    title: 'Minimal Costs',
    description: 'No middlemen mean lower transaction fees and operational costs for true efficiency.',
    icon: PiggyBank,
  },
  {
    title: 'Community Power',
    description: 'A member-driven ecosystem fosters loyalty, engagement, and shared ownership.',
    icon: Users,
  },
  {
    title: 'Tax Efficiency',
    description: 'Benefit from tax-deferred income, pass-through taxation, and potential capital gains.',
    icon: Banknote,
  },
  {
    title: 'Energy as Wealth',
    description: 'JEWELS embody your earned Energy, redeemable for games, NFTs, services, and more.',
    icon: Sparkles,
  },
  {
    title: 'Sovereign Identity',
    description: 'Join via PMA, securing your spiritual and legal autonomy outside public systems.',
    icon: ShieldCheck,
  },
  {
    title: 'Gamified Growth',
    description: 'Level up through quests and activities to unlock higher yield tiers in the Petaverse.',
    icon: Gamepad2,
  },
  {
    title: 'Purpose-Driven Rewards',
    description: 'Earn Energy through learning and participation, not speculation or chance.',
    icon: LibraryBig,
  },
  {
    title: 'Self-Custodied Vaults',
    description: 'Your funds are secured by smart contracts—no admin access, no overrides.',
    icon: LockKeyhole,
  },
  {
    title: 'Code as Law',
    description: 'Smart contracts govern every action, from login to payouts, ensuring fairness.',
    icon: ShieldCheck,
  },
  {
    title: 'P2P Freedom',
    description: 'Use your crypto Energy for instant real-world payments or peer-to-peer transfers.',
    icon: Banknote,
  },
  {
    title: 'Cross-Chain Freedom',
    description: 'PET protocol spans EVM chains, making your assets and identity fully portable.',
    icon: Globe2,
  },
];

const businessModel = [
  {
    icon: FaDollarSign,
    title: 'NFT & Game Marketplace',
    description: 'Trade, play, and own Swytch NFTs and P2E items with tokenized royalties and lifetime value.',
  },
  {
    icon: FaChartPie,
    title: 'Energy Yield System',
    description: 'Earn up to 36% APY via JEWELS through quests, wisdom levels, and smart contract rewards.',
  },
  {
    icon: FaCogs,
    title: 'Decentralized Operations',
    description: 'Staking, swapping, DAO governance, and Web3 identity—gamified and secured on-chain.',
  },
];

const donts = [
  {
    title: 'Never Share Keys',
    description: 'Your private keys or recovery phrase are sacred—sharing them risks total fund loss.',
  },
  {
    title: 'Avoid Shady DApps',
    description: 'Untrusted DApps can exploit your wallet through malicious smart contracts.',
  },
  {
    title: 'Beware Phishing Scams',
    description: 'Always verify URLs and avoid signing unknown messages to protect your assets.',
  },
  {
    title: 'Stay Rational',
    description: 'Ignore FOMO and hype—research token utility before investing your Energy.',
  },
  {
    title: 'Ditch Centralized Custody',
    description: 'Centralized exchanges can freeze or lose your funds during hacks or failures.',
  },
];

const wallets = [
  { name: 'MetaMask', icon: FaWallet },
  { name: 'Rainbow', icon: FaGoogleWallet },
  { name: 'Trust Wallet', icon: FaWallet },
  { name: 'Coinbase Wallet', icon: FaCoins },
  { name: 'Ledger', icon: FaLock },
  { name: 'Safe (Gnosis)', icon: FaLock },
  { name: 'WalletConnect', icon: FaWallet },
  { name: 'Taho', icon: FaWallet },
  { name: 'Zerion', icon: FaWallet },
  { name: 'OKX Wallet', icon: FaWallet },
];

const tokens = [
  'ETH', 'USDT', 'DAI', 'MATIC', 'BNB', 'AVAX', 'OP', 'ARB', 'FTM', 'JEWELS', 'FDMT', 'SWYT'
];

const TrustBenefits = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const infiniteScroll = {
    animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 25, ease: 'linear' } } }
  };

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
    <>
      {/* Hero Section */}
      <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />
        <motion.div
          variants={sectionVariants}
          className="relative max-w-7xl mx-auto"
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
              <Sparkles className="w-12 h-12 animate-pulse" /> Why Swytch PET?
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              The Private Energy Trust is your gateway to sovereignty, rewarding your Energy with decentralized freedom and gamified wealth.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Join the Rebellion
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section with Infinite Scroll */}
      <section className="relative py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <ShieldCheck className="w-10 h-10 text-cyan-400 animate-pulse" /> PET Benefits
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover the pillars of the Swytch Private Energy Trust, designed to empower your autonomy and reward your purpose.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...benefits, ...benefits].map((benefit, i) => (
                <motion.div
                  key={`${benefit.title}-${i}`}
                  className="flex-shrink-0 w-[300px] bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all backdrop-blur-md"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="flex items-center mb-4 text-cyan-400">
                    <benefit.icon className="w-8 h-8 mr-3 animate-pulse" />
                    <h4 className="text-xl font-bold">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-gray-300">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Swytch Ecosphere (Business Model) */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gradient-to-b from-gray-950 to-black text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <FaCogs className="w-10 h-10 text-teal-400 animate-spin-slow" /> Swytch Ecosphere
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            A decentralized universe powered by NFTs, Energy rewards, and autonomous operations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {businessModel.map((item, index) => (
              <motion.div
                key={index}
                className="relative bg-gray-900/60 p-8 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md"
                variants={sectionVariants}
                whileHover={{ scale: 1.03 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
                <div className="relative space-y-4">
                  <item.icon className="w-8 h-8 text-teal-400 animate-pulse" />
                  <h4 className="text-xl font-bold text-teal-300">{item.title}</h4>
                  <p className="text-sm text-gray-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* What NOT to do Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-red-400 flex items-center justify-center gap-4">
            <AlertTriangle className="w-10 h-10 animate-pulse" /> Crypto Pitfalls to Avoid
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Protect your Energy by steering clear of these common crypto mistakes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {donts.map((item, idx) => (
              <motion.div
                key={idx}
                className="relative bg-gray-900/60 border border-red-500/20 rounded-xl p-6 shadow-xl backdrop-blur-md"
                variants={sectionVariants}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center text-red-300">
                    <AlertTriangle className="w-6 h-6 mr-3 animate-pulse" />
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                  </div>
                  <p className="text-sm text-gray-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Supported Wallets & Tokens */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gradient-to-b from-black to-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <Wallet className="w-10 h-10 text-cyan-400 animate-pulse" /> Supported Wallets & Tokens
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Connect your preferred wallet and use a range of tokens via WAGMI integration.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {wallets.map((wallet, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 p-4 rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold border border-cyan-500/20 backdrop-blur-md"
                whileHover={{ scale: 1.05 }}
              >
                <wallet.icon className="w-6 h-6 text-cyan-400 animate-pulse" /> {wallet.name}
              </motion.div>
            ))}
          </div>
          <h4 className="text-xl font-semibold text-cyan-400 mb-4">Supported Tokens</h4>
          <div className="flex flex-wrap justify-center gap-4">
            {tokens.map((token, i) => (
              <motion.span
                key={i}
                className="bg-cyan-800/50 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-full text-sm"
                whileHover={{ scale: 1.1 }}
              >
                {token}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={sectionVariants}
          className="relative max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" /> Ignite Your Sovereignty
            </h3>
            <p className="text-lg text-gray-300">
              Join the Swytch Private Energy Trust and harness your Energy to shape a decentralized future. Your journey starts now.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Become a PET
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>
      </section>

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
                  <FaWallet className="w-5 h-5" /> Connect MetaMask
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaWallet className="w-5 h-5" /> Connect WalletConnect
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaWallet className="w-5 h-5" /> Generate New Wallet
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
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default TrustBenefits;