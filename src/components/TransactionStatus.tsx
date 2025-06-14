import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight, CheckCircle, Gift, ShoppingCart, TrendingUp, Zap, Coins, CreditCard, DollarSign, LineChart, User, Users, Wallet, ArrowRight, X, Sparkles, Trophy
} from 'lucide-react';

const initialTransactions = [
  {
    icon: <ArrowUpRight className="text-green-400 w-4 h-4 animate-pulse" />,
    address: '0x4b...d9A3',
    action: 'Swapped',
    amount: '$25 USDT',
    forToken: 'JEWELS'
  },
  {
    icon: <TrendingUp className="text-yellow-400 w-4 h-4 animate-pulse" />,
    address: '0x7c...eE12',
    action: 'Staked',
    amount: '$100 ETH',
    forToken: 'Energy Vault'
  },
  {
    icon: <ShoppingCart className="text-blue-400 w-4 h-4 animate-pulse" />,
    address: '0x19...a1F8',
    action: 'Purchased',
    amount: 'NFT #9',
    forToken: 'Vault Guardian'
  },
  {
    icon: <Gift className="text-pink-400 w-4 h-4 animate-pulse" />,
    address: '0x32...BbC0',
    action: 'Claimed',
    amount: '3.3% yield',
    forToken: 'Trust Rewards'
  },
  {
    icon: <Zap className="text-indigo-400 w-4 h-4 animate-pulse" />,
    address: '0xAF...11eB',
    action: 'Upgraded PET to Level 4',
    amount: 'Bonus JEWELS',
    forToken: ''
  },
];

const generateRandomTx = () => {
  const actions = ['Arbitraged', 'Swapped', 'Deposited', 'Claimed Reward', 'Purchased', 'Staked'];
  const icons = [ArrowUpRight, TrendingUp, Gift, Zap, ShoppingCart, CheckCircle];
  const amounts = ['$12.50', '$47.20', '$89.00', '$13.33', '$101.00'];
  const tokens = ['JEWELS', 'FDMT', 'USDT', 'ETH', 'NFT'];
  const address = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
  const index = Math.floor(Math.random() * actions.length);
  const IconEl = icons[index % icons.length];

  return {
    icon: <IconEl className="text-cyan-400 w-4 h-4 animate-pulse" />,
    address,
    action: actions[index],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    forToken: tokens[Math.floor(Math.random() * tokens.length)]
  };
};

const leaderboard = [
  { address: '0x1a...f9B2', referrals: 42, rewards: '500 JEWELS' },
  { address: '0x5b...cD4E', referrals: 35, rewards: '350 JEWELS' },
  { address: '0x9c...eF67', referrals: 28, rewards: '200 JEWELS' },
  { address: '0x3d...aB89', referrals: 15, rewards: '100 JEWELS' },
];

const TransactionStatus = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

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

  // Transaction feed
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => [generateRandomTx(), ...prev.slice(0, 50)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-scroll transaction feed
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const scroll = () => {
      feed.scrollTop += 1;
      if (feed.scrollTop >= feed.scrollHeight - feed.clientHeight) {
        feed.scrollTop = 0;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [transactions]);

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
              <Sparkles className="w-12 h-12 animate-pulse" /> Energy Trust
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              Watch the Swytch Bot fuel your 3.3% monthly yield with AI-powered trades across 5 DEXes, live every 2 seconds.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Join the Vault
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Transaction Feed */}
        <motion.div
          variants={sectionVariants}
          className="max-w-5xl mx-auto space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Live Transactions
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Real-time arbitrage across Uniswap, SushiSwap, PancakeSwap, Curve, and Balancer powers your rewards.
          </p>
          <div
            ref={feedRef}
            className="bg-gray-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 h-[500px] overflow-y-auto no-scrollbar shadow-xl"
          >
            <AnimatePresence>
              {transactions.map((tx, index) => (
                <motion.div
                  key={`${tx.address}-${index}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-start space-x-4 bg-gray-900/40 p-4 rounded-lg hover:bg-gray-900/60 transition-all mb-2"
                >
                  <div className="p-2 bg-cyan-500/20 rounded-full">{tx.icon}</div>
                  <div className="text-sm">
                    <p className="text-white font-mono mb-1">{tx.address}</p>
                    <p className="text-gray-300">
                      <span className="text-cyan-400 font-medium">{tx.action}</span> {tx.amount}{' '}
                      {tx.forToken && <span className="text-cyan-300">for {tx.forToken}</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-sm text-cyan-300 italic text-center max-w-xl mx-auto">
            💠 All Vault Deposits fuel AI-driven trades, ensuring real yield, real fast.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
            <Coins className="w-8 h-8 text-orange-400 mb-2 animate-pulse" />
            <p className="text-sm text-gray-400">Your Balance</p>
            <p className="text-xl font-bold text-white">26 SWYT</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
            <LineChart className="w-8 h-8 text-blue-400 mb-2 animate-pulse" />
            <p className="text-sm text-gray-400">Profit</p>
            <p className="text-xl font-bold text-white">57 SWYT</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
            <DollarSign className="w-8 h-8 text-pink-400 mb-2 animate-pulse" />
            <p className="text-sm text-gray-400">Total Deposit</p>
            <p className="text-xl font-bold text-white">9,839 SWYT</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
            <CreditCard className="w-8 h-8 text-purple-400 mb-2 animate-pulse" />
            <p className="text-sm text-gray-400">Total Withdrawals</p>
            <p className="text-xl font-bold text-white">9,870 SWYT</p>
          </motion.div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-md text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl" />
            <p className="text-blue-300 text-3xl font-bold">4.21%</p>
            <p className="text-gray-300 text-sm mt-2">Swytch Profits for May 2025</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-md text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl" />
            <p className="text-blue-300 text-3xl font-bold">3.79%</p>
            <p className="text-gray-300 text-sm mt-2">Your Max Profits for May 2025</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-md text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl" />
            <p className="text-blue-300 text-3xl font-bold">462.14%</p>
            <p className="text-gray-300 text-sm mt-2">Swytch Profits Since Inception</p>
          </motion.div>
        </motion.div>

        {/* Referral Leaderboard */}
        <motion.div
          variants={sectionVariants}
          className="max-w-5xl mx-auto space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" /> Referral Leaderboard
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Invite PETs to the Swytch Vault and earn JEWELS for every referral.
          </p>
          <div className="bg-gray-900/60 backdrop-blur-lg border border-yellow-500/20 rounded-2xl p-6 shadow-xl">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-900/60 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 font-bold text-lg">{index + 1}.</span>
                  <p className="text-white font-mono">{entry.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">{entry.referrals} Referrals</p>
                  <p className="text-yellow-300 font-semibold">{entry.rewards}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
            <User className="w-6 h-6 text-cyan-400 animate-pulse" />
            <p className="text-white">Account Details</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
            <Users className="w-6 h-6 text-cyan-400 animate-pulse" />
            <p className="text-white">Referrals</p>
          </motion.div>
          <motion.div
            className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
            <p className="text-white text-lg font-bold">Active PETs</p>
            <p className="text-cyan-400 font-semibold text-2xl mt-1">0</p>
          </motion.div>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-cyan-300 italic text-center max-w-xl mx-auto"
        >
          🔐 Wallet: 0xAB...CDEF | 🔗 Network: Avalanche | 💼 Status: Active
        </motion.div>

        {/* Final CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" /> Power Your Future
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Join the Swytch Energy Trust and harness AI-driven yields to fuel your decentralized journey.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Start Earning
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
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
                  <Wallet className="w-8 h-8 animate-pulse" /> Connect to the Vault
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

export default TransactionStatus;