import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Lock, Book, Zap, Globe, ArrowRight, Wallet, RefreshCw, Send, Sparkles, Star, Coins, ShieldCheck, Key, Terminal, FileText } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Confetti from 'react-confetti';

// Interfaces
interface InfoCard {
  icon: JSX.Element;
  title: string;
  text: string;
  details: string;
}

interface YieldResult {
  baseYield: number;
  bonusYield: number;
  totalYield: number;
  tier: string;
}

interface YieldForm {
  deposit: string;
  quests: string;
  network: string;
  withdraw: string;
  token: string;
}

// Data
const infoCards: InfoCard[] = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'PMA-Backed Structure',
    text: 'Swytch thrives under a Private Ministerial Association, free from corporate control.',
    details: 'Members opt-in via contract, securing constitutional sovereignty. Backed by UDHR, Swytch ensures privacy and autonomy.'
  },
  {
    icon: <Lock className="w-8 h-8 text-pink-400 animate-pulse" />,
    title: 'Immutable by Design',
    text: 'Actions and rewards are etched on an open blockchain with smart contracts.',
    details: 'No admin overrides—just deterministic logic. Anti-corruption tech safeguards your Energy.'
  },
  {
    icon: <Book className="w-8 h-8 text-cyan-400 animate-pulse" />,
    title: 'Education is Yield',
    text: 'Boost JEWELS yield through quests in the Raziel Library.',
    details: 'Raziel tracks your knowledge journey. Unlock quests to earn extra yield monthly.'
  },
  {
    icon: <Coins className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'JEWELS as Proof',
    text: 'Tokens earned through effort symbolize your service.',
    details: 'JEWELS are proof-of-work, unlocking vault upgrades, access, or stablecoin liquidity.'
  },
  {
    icon: <Key className="w-8 h-8 text-pink-400 animate-pulse" />,
    title: 'Zero Data Collection',
    text: 'No emails, no KYC—just contract-based autonomy.',
    details: 'Your PET vault and identity are encrypted, ensuring sovereignty by default.'
  },
  {
    icon: <Terminal className="w-8 h-8 text-cyan-400 animate-pulse" />,
    title: 'Cross-Chain Ready',
    text: 'Swytch operates across EVM chains like Avalanche and Polygon.',
    details: 'Smart adapters enable seamless operation across networks, adapting to your needs.'
  }
];

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

const infiniteScroll = {
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 25, ease: 'linear' } } },
};

const flareVariants = {
  animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

// Components
const Card = ({ children, gradient, className = '' }: { children: React.ReactNode; gradient: string; className?: string }) => (
  <motion.div
    className={`relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-500/30 transition-all bg-gradient-to-r ${gradient} ${className}`}
    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
  >
    {children}
  </motion.div>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: JSX.Element }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <Lock className="text-rose-400 hover:text-red-500 w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

const EnergyTrustInfo: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [yieldForm, setYieldForm] = useState<YieldForm>({ deposit: '', quests: '0', network: 'Avalanche', withdraw: '', token: 'USDT' });
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);
  const [jewels, setJewels] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch JEWELS balance
  useEffect(() => {
    const fetchJewels = async () => {
      if (isConnected && address) {
        try {
          const userRef = doc(db, 'users', address);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setJewels(userSnap.data().jewels || 0);
          } else {
            await setDoc(userRef, { jewels: 0, WalletBalance: 0, updatedAt: serverTimestamp() }, { merge: true });
            setJewels(0);
          }
        } catch (err) {
          console.error('Failed to fetch JEWELS:', err);
        }
      }
    };
    fetchJewels();
  }, [address, isConnected]);

  // Calculate yield
  const handleCalculateYield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      alert('Please connect your wallet to calculate yield.');
      setShowWalletModal(true);
      return;
    }
    const deposit = parseFloat(yieldForm.deposit);
    const quests = parseInt(yieldForm.quests);

    if (isNaN(deposit) || deposit < 100) {
      alert('Please enter a valid deposit amount (minimum $100).');
      return;
    }

    let tierReward = 0.01; // Initiate
    let tier = 'Initiate';
    if (deposit >= 100000) { tierReward = 0.033; tier = 'Mythic PET'; }
    else if (deposit >= 50000) { tierReward = 0.031; tier = 'Elder'; }
    else if (deposit >= 25000) { tierReward = 0.028; tier = 'Alchemist'; }
    else if (deposit >= 10000) { tierReward = 0.025; tier = 'Archon'; }
    else if (deposit >= 5000) { tierReward = 0.022; tier = 'Sage'; }
    else if (deposit >= 2500) { tierReward = 0.019; tier = 'Guardian'; }
    else if (deposit >= 1000) { tierReward = 0.016; tier = 'Seeker'; }
    else if (deposit >= 500) { tierReward = 0.013; tier = 'Apprentice'; }

    const baseYield = deposit * tierReward;
    const bonusYield = deposit * (quests * 0.0003); // 0.03% per quest
    const totalYield = baseYield + bonusYield;

    setYieldResult({ baseYield, bonusYield, totalYield, tier });
    const audio = new Audio('/audio/calculate.mp3');
    audio.play().catch((err) => console.error('Audio playback failed:', err));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Handle deposit
  const handleDeposit = async (amount: string, network: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to deposit JEWELS.');
      setShowWalletModal(true);
      return;
    }
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    try {
      const jewelAmount = depositAmount * 10; // 1 INR = 10 JEWELS, $1 = 100 INR
      const userRef = doc(db, 'users', address);
      await setDoc(userRef, {
        jewels: jewels + jewelAmount,
        WalletBalance: depositAmount,
        updatedAt: serverTimestamp(),
        network // Store network for admin payout tracking
      }, { merge: true });
      setJewels(jewels + jewelAmount);
      const audio = new Audio('/audio/deposit.mp3');
      audio.play().catch((err) => console.error('Audio playback failed:', err));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      alert(`Successfully deposited ${jewelAmount} JEWELS on ${network}! Admin will process payout using your address: ${address}.`);
    } catch (err) {
      console.error('Deposit error:', err);
      alert('Failed to deposit JEWELS. Please try again.');
    }
  };

  // Handle withdraw
  const handleWithdraw = async (amount: string, token: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to withdraw JEWELS.');
      setShowWalletModal(true);
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    const jewelAmount = withdrawAmount * 10; // 1 INR = 10 JEWELS, $1 = 100 INR
    if (jewelAmount > jewels) {
      alert('Insufficient JEWELS balance.');
      return;
    }
    try {
      const userRef = doc(db, 'users', address);
      await setDoc(userRef, {
        jewels: jewels - jewelAmount,
        WalletBalance: withdrawAmount,
        updatedAt: serverTimestamp(),
        token // Store token for admin payout tracking
      }, { merge: true });
      setJewels(jewels - jewelAmount);
      const audio = new Audio('/audio/withdraw.mp3');
      audio.play().catch((err) => console.error('Audio playback failed:', err));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      alert(`Successfully withdrew ${jewelAmount} JEWELS as ${token}! Admin will process payout using your address: ${address}.`);
    } catch (err) {
      console.error('Withdraw error:', err);
      alert('Failed to withdraw JEWELS. Please try again.');
    }
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      {/* Lens Flare and Noise Overlay */}
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: `${50 + mousePosition.y * 50}%`, left: `${50 + mousePosition.x * 50}%` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 bg-repeat bg-[length:64px_64px]" />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 211, 238, 0.5)'
            }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div
        className="relative z-20 max-w-7xl mx-auto space-y-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Private Energy Trust
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Swytch is a declaration of sovereignty—encoded in smart contracts and fueled by Energy.
            </p>
            {isConnected && (
              <p className="text-gray-300 text-center">
                Your JEWELS: <span className="font-bold text-rose-400">{jewels} JEWELS</span>
              </p>
            )}
            <motion.button
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              whileHover={{ scale: 1.05 }}
              aria-label="Claim Your Sovereignty"
            >
              Claim Your Sovereignty
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div variants={sectionVariants} className="space-y-8">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-rose-400 animate-pulse" /> Why Swytch?
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Discover the pillars of the Private Energy Trust, empowering your autonomy.
          </p>
          <div className="relative overflow-hidden no-scrollbar">
            <motion.div className="flex gap-6" variants={infiniteScroll} animate="animate">
              {[...infoCards, ...infoCards].map((card, i) => (
                <motion.div
                  key={`${card.title}-${i}`}
                  className="flex-shrink-0 w-[300px] bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/40 transition-all backdrop-blur-md cursor-pointer"
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="flex items-center mb-4 text-rose-400">
                    {card.icon}
                    <h3 className="text-xl font-bold ml-3">{card.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{card.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Crypto Usage */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-4">
                <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> How Swytch Uses Crypto
              </h3>
              <p className="text-lg text-gray-300">
                JEWELS are time-earned tokens that unlock ecosystem features or stablecoin conversions.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>No gas fees inside the app</li>
                <li>Withdraw to stablecoin via smart contracts</li>
                <li>Track your vault via the Trust HUD</li>
                <li>Every action is ledger-traced—visible, yet private</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Wallet & Swap Forms */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-4">
              <h4 className="text-2xl font-semibold text-white flex items-center gap-3">
                <Wallet className="w-6 h-6 text-rose-400 animate-pulse" /> Connect Wallet
              </h4>
              {isConnected ? (
                <p className="text-gray-300">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              ) : (
                <ConnectButton />
              )}
              <p className="text-gray-400 text-sm">Use your Avalanche-compatible address.</p>
            </div>
          </Card>

          <Card gradient="from-cyan-500/10 to-blue-500/10">
            <div className="space-y-4">
              <h4 className="text-2xl font-semibold text-white flex items-center gap-3">
                <Send className="w-6 h-6 text-cyan-400 animate-pulse" /> Deposit JEWELS
              </h4>
              <input
                type="number"
                placeholder="Amount in USDT"
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-cyan-500"
                onChange={(e) => setYieldForm({ ...yieldForm, deposit: e.target.value })}
                aria-label="Deposit amount"
              />
              <select
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-cyan-500"
                onChange={(e) => setYieldForm({ ...yieldForm, network: e.target.value })}
                value={yieldForm.network}
                aria-label="Network selection"
              >
                <option value="Avalanche">Avalanche</option>
                <option value="Polygon">Polygon</option>
              </select>
              <motion.button
                className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleDeposit(yieldForm.deposit, yieldForm.network)}
                aria-label="Deposit JEWELS"
              >
                Deposit
              </motion.button>
            </div>
          </Card>

          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="space-y-4">
              <h4 className="text-2xl font-semibold text-white flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-pink-400 animate-pulse" /> Withdraw & Swap
              </h4>
              <input
                type="number"
                placeholder="Amount to Withdraw"
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-pink-500"
                onChange={(e) => setYieldForm({ ...yieldForm, withdraw: e.target.value })}
                aria-label="Withdraw amount"
              />
              <select
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-pink-500"
                onChange={(e) => setYieldForm({ ...yieldForm, token: e.target.value })}
                value={yieldForm.token}
                aria-label="Target token"
              >
                <option value="USDT">USDT</option>
                <option value="FDMT">FDMT</option>
                <option value="JSIT">JSIT</option>
              </select>
              <motion.button
                className="w-full py-3 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleWithdraw(yieldForm.withdraw, yieldForm.token)}
                aria-label="Swap and Withdraw"
              >
                Swap & Withdraw
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Yield Calculator */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400 animate-pulse" /> Yield Calculator
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Estimate your monthly JEWELS yield based on deposit and education quests.
          </p>
          <Card gradient="from-cyan-500/10 to-blue-500/10">
            <form onSubmit={handleCalculateYield} className="space-y-4">
              <div>
                <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Deposit Amount (USDT)
                </label>
                <input
                  id="deposit-amount"
                  type="number"
                  value={yieldForm.deposit}
                  onChange={(e) => setYieldForm({ ...yieldForm, deposit: e.target.value })}
                  placeholder="Enter deposit amount"
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500"
                  required
                  aria-label="Deposit amount"
                />
              </div>
              <div>
                <label htmlFor="quests-completed" className="block text-sm font-medium text-gray-300 mb-1">
                  Quests Completed (0–10)
                </label>
                <input
                  id="quests-completed"
                  type="number"
                  value={yieldForm.quests}
                  onChange={(e) => setYieldForm({ ...yieldForm, quests: e.target.value })}
                  placeholder="Number of quests"
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500"
                  min="0"
                  max="10"
                  required
                  aria-label="Quests completed"
                />
              </div>
              <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-cyan-600 text-white hover:bg-cyan-700 rounded-md font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                aria-label="Calculate Yield"
              >
                <Coins className="w-5 h-5" /> Calculate Yield
              </motion.button>
            </form>
            {yieldResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-800 rounded-lg border border-cyan-500/20"
              >
                <p className="text-white font-semibold">Tier: {yieldResult.tier}</p>
                <p className="text-gray-300">Base Yield: ${yieldResult.baseYield.toFixed(2)}/month</p>
                <p className="text-gray-300">Bonus Yield: ${yieldResult.bonusYield.toFixed(2)}/month</p>
                <p className="text-rose-400 font-bold">Total Yield: ${yieldResult.totalYield.toFixed(2)}/month</p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Begin Your Journey */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-rose-500/10 to-pink-500/10" className="text-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-4">
                <Globe className="w-8 h-8 text-rose-400 animate-pulse" /> Begin Your Journey
              </h3>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Take the first step into Swytch. Learn how to join in three simple steps.
              </p>
              <motion.button
                onClick={() => setShowStepsModal(true)}
                className="px-8 py-4 bg-rose-600 text-white rounded-full hover:bg-rose-700 font-semibold"
                whileHover={{ scale: 1.05 }}
                aria-label="Discover the Steps"
              >
                Discover the Steps
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {selectedCard && (
            <Modal title={selectedCard.title} onClose={() => setSelectedCard(null)}>
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  {selectedCard.icon}
                  <h3 className="text-2xl font-bold text-rose-400 ml-3">{selectedCard.title}</h3>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed">{selectedCard.details}</p>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showStepsModal && (
            <Modal title="Your Swytch Initiation" onClose={() => setShowStepsModal(false)}>
              <div className="space-y-4">
                <ol className="list-decimal list-inside text-gray-300 space-y-4 text-lg">
                  <li><strong>Connect Wallet:</strong> Link a self-sovereign wallet via MetaMask or WalletConnect.</li>
                  <li><strong>Deposit JEWELS:</strong> Fund your vault to earn and unlock utility.</li>
                  <li><strong>Earn Energy:</strong> Complete quests and actions to grow your JEWELS.</li>
                </ol>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showWalletModal && (
            <Modal title="Connect to Swytch" onClose={() => setShowWalletModal(false)}>
              <div className="space-y-4">
                <ConnectButton />
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .blur-3xl { filter: blur(64px); }
        .blur-2xl { filter: blur(32px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
        }
        input:focus, textarea:focus, select:focus {
          transition: border-color 0.3s ease, ring-color 0.3s ease;
        }
        @media (prefers-reduced-motion) {
          .animate-pulse, .animate-bounce, [data-animate] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default EnergyTrustInfo;