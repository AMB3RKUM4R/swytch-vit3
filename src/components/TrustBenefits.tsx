import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Banknote, LockKeyhole, LibraryBig, Users, Globe2, PiggyBank, Gamepad2, Sparkles, AlertTriangle, Wallet, ArrowRight, X, Target} from 'lucide-react';
import {
  FaWallet, FaCoins, FaLock, FaGoogleWallet, FaDollarSign, FaChartPie, FaCogs, FaGem, FaRocket, FaShieldAlt
} from 'react-icons/fa';
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Confetti from 'react-confetti';

// Interfaces (aligned with Tokenomics.tsx)
interface SavedState {
  jewels: number;
  quests: Quest[];
  clicks: number;
  lastVisit: string | null;
  streak: number;
  achievements: Achievement[];
  WalletBalance: number;
  membership: 'none' | 'membership_basic' | 'membership_pro' | 'membership_premium';
  network?: string;
  token?: string;
}

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface Benefit {
  title: string;
  description: string;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BusinessModel {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  details: string;
}

interface Dont {
  title: string;
  description: string;
  details: string;
}

interface Wallet {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// Data
const benefits: Benefit[] = [
  {
    title: 'Unbreakable Security',
    description: 'Your assets live on a decentralized network, immune to hacks or centralized failures.',
    details: 'Swytch PET leverages Avalanche’s Subnet architecture and audited smart contracts to secure your JEWELS and SWYT.',
    icon: LockKeyhole,
  },
  {
    title: 'Absolute Privacy',
    description: 'You control your data with self-custodial wallets and zero-knowledge proofs.',
    details: 'Your financial and spiritual journey stays private. Share only what you choose via WAGMI-integrated DApps.',
    icon: ShieldCheck,
  },
  {
    title: 'Crystal Transparency',
    description: 'Every transaction and reward is verifiable on a public ledger.',
    details: 'Avalanche’s blockchain logs all actions—swaps, stakes, JEWELS claims—in real time for full trust.',
    icon: Banknote,
  },
  {
    title: 'Minimal Costs',
    description: 'Low gas fees maximize your Energy’s value.',
    details: 'Avalanche’s optimized transactions keep costs under $0.01 for most actions, from NFT trades to staking.',
    icon: PiggyBank,
  },
  {
    title: 'Community Power',
    description: 'A DAO-driven ecosystem lets PETs vote on features and rewards.',
    details: 'Stake SWYT to shape quests, yield tiers, and partnerships in the Swytch DAO.',
    icon: Users,
  },
  {
    title: 'Tax Efficiency',
    description: 'Utility tokens like JEWELS and SWYT may reduce tax burdens.',
    details: 'Structured for tax-deferred income in compliant jurisdictions. Consult a tax advisor for optimization.',
    icon: FaDollarSign,
  },
  {
    title: 'Energy as Wealth',
    description: 'JEWELS are earned through quests and redeemable for NFTs or real-world value.',
    details: 'Earn JEWELS via quests or staking, then redeem for game boosts, NFTs, or P2P payments.',
    icon: FaGem,
  },
  {
    title: 'Sovereign Identity',
    description: 'Join via a PMA for autonomy outside traditional systems.',
    details: 'Your wallet is your passport to the Petaverse, free from centralized oversight.',
    icon: FaShieldAlt,
  },
  {
    title: 'Gamified Growth',
    description: 'Level up through quests to unlock higher yields and rewards.',
    details: 'Complete quests to earn JEWELS and XP, boosting your Energy Vault yield up to 36% APY.',
    icon: Gamepad2,
  },
  {
    title: 'Purpose-Driven Rewards',
    description: 'Earn Energy through learning and contribution, not speculation.',
    details: 'Educational quests and DAO contributions reward JEWELS, aligning wealth with wisdom.',
    icon: LibraryBig,
  },
  {
    title: 'Self-Custodied Vaults',
    description: 'Your funds are locked in audited smart contracts, accessible only by you.',
    details: 'Multi-signature Energy Vault contracts ensure only your wallet can withdraw JEWELS or SWYT.',
    icon: FaLock,
  },
  {
    title: 'Code as Law',
    description: 'Smart contracts enforce fairness for all actions.',
    details: 'Solidity contracts automate yields and governance, verified on Etherscan for transparency.',
    icon: ShieldCheck,
  },
  {
    title: 'P2P Freedom',
    description: 'Use JEWELS or SWYT for instant, borderless transactions.',
    details: 'Pay for services, trade NFTs, or send SWYT with near-zero fees via DeFi protocols.',
    icon: Banknote,
  },
  {
    title: 'Cross-Chain Freedom',
    description: 'Move assets across Avalanche, Polygon, and other EVM chains.',
    details: 'WAGMI integration lets you bridge SWYT or stake on Optimism while keeping your PET identity.',
    icon: Globe2,
  },
];

const businessModel: BusinessModel[] = [
  {
    icon: FaDollarSign,
    title: 'NFT & Game Marketplace',
    description: 'Trade NFTs and P2E items with tokenized royalties.',
    details: 'Mint Vault Guardian NFTs or trade them on the Swytch marketplace. P2E games reward JEWELS for skill.',
  },
  {
    icon: FaChartPie,
    title: 'Energy Yield System',
    description: 'Earn up to 36% APY through quests and staking.',
    details: 'Stake SWYT in the Energy Vault for JEWELS, with AI-driven arbitrage maximizing returns.',
  },
  {
    icon: FaCogs,
    title: 'Decentralized Operations',
    description: 'On-chain staking, governance, and identity management.',
    details: 'Vote in the Swytch DAO or manage your Web3 identity via WAGMI on Avalanche’s Subnet.',
  },
];

const donts: Dont[] = [
  {
    title: 'Never Share Keys',
    description: 'Sharing private keys risks losing all your assets.',
    details: 'Store keys offline with a Ledger. Never enter your seed phrase on unverified websites.',
  },
  {
    title: 'Avoid Shady DApps',
    description: 'Malicious DApps can drain your wallet.',
    details: 'Verify DApp permissions and revoke approvals via Etherscan if suspicious.',
  },
  {
    title: 'Beware Phishing Scams',
    description: 'Fake sites or messages can steal your funds.',
    details: 'Bookmark swytch.io, use HTTPS, and avoid signing prompts from unsolicited sources.',
  },
  {
    title: 'Stay Rational',
    description: 'Hype can lead to poor investment choices.',
    details: 'Focus on JEWELS and SWYT utility. Avoid projects with no clear use case.',
  },
  {
    title: 'Ditch Centralized Custody',
    description: 'Exchanges can freeze or lose your funds.',
    details: 'Use MetaMask or Trust Wallet for self-custody of JEWELS and SWYT.',
  },
];

const wallets: Wallet[] = [
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

const tokens: string[] = [
  'ETH', 'USDT', 'DAI', 'MATIC', 'BNB', 'AVAX', 'OP', 'ARB', 'FTM', 'JEWELS', 'FDMT', 'SWYT'
];

const initialQuests: Quest[] = [
  { id: 'explore-benefits', title: 'Explore PET Benefits', progress: 0, goal: 3, rewardJEWELS: 15, rewardXP: 20, completed: false },
  { id: 'connect-wallet', title: 'Connect Your Wallet', progress: 0, goal: 1, rewardJEWELS: 10, rewardXP: 10, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: 'first-connection', title: 'First Connection', description: 'Connect your wallet to Swytch PET.', unlocked: false },
  { id: 'benefits-3', title: 'Knowledge Explorer', description: 'Explore 3 PET Benefits.', unlocked: false },
];

// Animation Variants
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

const flareVariants = {
  animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }
};

const infiniteScroll = {
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } } }
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } }
};

// Component
const TrustBenefits: React.FC = () => {
  const { address, isConnected } = useAccount();
  useConnect();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [jewelsBalance, setJewelsBalance] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const rewardAudioRef = useRef<HTMLAudioElement>(null);

  // Load state from Firebase
  useEffect(() => {
    const fetchState = async () => {
      if (isConnected && address) {
        try {
          const userRef = doc(db, 'users', address);
          const userSnap = await getDoc(userRef);
          const data = userSnap.exists() ? (userSnap.data() as SavedState) : undefined;

          if (data) {
            setJewelsBalance(data.jewels || 0);
            setQuests(data.quests?.filter(q => initialQuests.some(iq => iq.id === q.id)) || initialQuests);
            setAchievements(data.achievements?.filter(a => initialAchievements.some(ia => ia.id === a.id)) || initialAchievements);
          } else {
            await setDoc(userRef, {
              jewels: 0,
              quests: initialQuests,
              clicks: 0,
              lastVisit: new Date().toISOString().split('T')[0],
              streak: 1,
              achievements: initialAchievements,
              WalletBalance: 0,
              membership: 'none',
              updatedAt: serverTimestamp()
            }, { merge: true });
            setJewelsBalance(0);
            setQuests(initialQuests);
            setAchievements(initialAchievements);
          }
        } catch (err) {
          console.error('Failed to fetch state:', err);
          alert('Failed to load user data. Please try again.');
        }
      }
    };
    fetchState();
  }, [isConnected, address]);

  // Save state to Firebase
  useEffect(() => {
    const saveState = async () => {
      if (isConnected && address) {
        try {
          const userRef = doc(db, 'users', address);
          await setDoc(userRef, {
            jewels: jewelsBalance,
            quests,
            achievements,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error('Failed to save state:', err);
          alert('Failed to save user data. Please try again.');
        }
      }
    };
    saveState();
  }, [jewelsBalance, quests, achievements, isConnected, address]);

  // Auto-dismiss reward popup
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Infinite Scroll Effect
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

  // Modal Accessibility
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

  // Unlock Achievement
  const unlockAchievement = async (id: string) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id && !a.unlocked ? { ...a, unlocked: true } : a))
    );
    let reward: Reward | null = null;
    if (id === 'first-connection') {
      reward = { jewels: 5, xp: 10, message: 'Achievement Unlocked: First Connection!' };
    } else if (id === 'benefits-3') {
      reward = { jewels: 15, xp: 20, message: 'Achievement Unlocked: Knowledge Explorer!' };
    }
    if (reward) {
      setShowReward(reward);
      setJewelsBalance(prev => prev + reward.jewels);
      rewardAudioRef.current?.play();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      if (isConnected && address) {
        const userRef = doc(db, 'users', address);
        await setDoc(userRef, {
          jewels: jewelsBalance + reward.jewels,
          achievements,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  };

  // Toggle Expanded Benefit
  const toggleBenefit = async (title: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to explore benefits.');
      setShowWalletModal(true);
      return;
    }
    setExpandedBenefit(expandedBenefit === title ? null : title);
    if (expandedBenefit !== title) {
      const exploreQuest = quests.find(q => q.id === 'explore-benefits');
      if (exploreQuest && !exploreQuest.completed) {
        const newProgress = Math.min(exploreQuest.progress + 1, exploreQuest.goal);
        const isQuestCompleted = newProgress >= exploreQuest.goal;
        setQuests(prev =>
          prev.map(q =>
            q.id === 'explore-benefits'
              ? { ...q, progress: newProgress, completed: isQuestCompleted }
              : q
          )
        );
        if (isQuestCompleted) {
          setJewelsBalance(prev => prev + exploreQuest.rewardJEWELS);
          setShowReward({
            jewels: exploreQuest.rewardJEWELS,
            xp: exploreQuest.rewardXP,
            message: `Quest Completed: ${exploreQuest.title}!`
          });
          rewardAudioRef.current?.play();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          if (newProgress >= 3) {
            await unlockAchievement('benefits-3');
          }
        }
        if (isConnected && address) {
          const userRef = doc(db, 'users', address);
          await setDoc(userRef, { quests, updatedAt: serverTimestamp() }, { merge: true });
        }
      }
    }
  };

  // Wallet Connect Handler

  return (
    <>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      {/* Visual Effects */}
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
        {[...Array(15)].map((_, i) => (
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

      {/* Hero Section */}
      <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.08)_0%,_transparent_70%)] pointer-events-none" />
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto"
          style={{
            backgroundImage: `url(/bg (59).jpg), url(/fallback-bg.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-8">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <FaRocket className="w-12 h-12 animate-pulse" /> Why Swytch PET?
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              The Swytch Private Energy Trust (PET) empowers you with financial and spiritual sovereignty through decentralized technology and gamified rewards.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built on Avalanche with WAGMI integration, Swytch PET offers AI-driven yields, NFT marketplaces, and DAO governance for a trustless Petaverse.
            </p>
            {isConnected && (
              <p className="text-gray-300 text-center">
                Your JEWELS: <span className="font-bold text-rose-400">{jewelsBalance} JEWELS</span>
              </p>
            )}
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
                  onClick={() => {
                    if (!isConnected) openConnectModal();
                    else alert('Wallet already connected!');
                  }}
                  whileHover={{ scale: 1.05 }}
                  aria-label="Join the Swytch Private Energy Trust"
                >
                  {isConnected ? 'Wallet Connected' : 'Join the Petaverse'}
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </motion.div>
      </section>

      {/* Featured Quest Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <Target className="w-10 h-10 text-cyan-400 animate-pulse" /> Featured Quests
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Start your Petaverse journey with these quests to earn JEWELS and XP!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {quests.map(quest => (
              <motion.div
                key={quest.id}
                className="bg-gray-900/60 p-6 rounded-xl border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all backdrop-blur-md"
                variants={sectionVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <h4 className="text-xl font-semibold text-white">{quest.title}</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
                  </p>
                  <div className="w-32 bg-gray-900 rounded-full h-2 mx-auto">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                    />
                  </div>
                  <motion.button
                    className={`px-4 py-2 rounded-lg font-semibold ${quest.progress >= quest.goal && !quest.completed ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                    onClick={async () => {
                      if (quest.progress >= quest.goal && !quest.completed) {
                        setQuests(prev =>
                          prev.map(q =>
                            q.id === quest.id ? { ...q, completed: true } : q
                          )
                        );
                        setJewelsBalance(prev => prev + quest.rewardJEWELS);
                        setShowReward({
                          jewels: quest.rewardJEWELS,
                          xp: quest.rewardXP,
                          message: `Quest Completed: ${quest.title}!`
                        });
                        rewardAudioRef.current?.play();
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 2000);
                        if (isConnected && address) {
                          const userRef = doc(db, 'users', address);
                          await setDoc(userRef, {
                            jewels: jewelsBalance + quest.rewardJEWELS,
                            quests,
                            updatedAt: serverTimestamp()
                          }, { merge: true });
                        }
                      }
                    }}
                    disabled={quest.completed || quest.progress < quest.goal}
                    whileHover={{ scale: quest.progress >= quest.goal && !quest.completed ? 1.05 : 1 }}
                    aria-label={`Claim ${quest.title} reward`}
                  >
                    {quest.completed ? 'Claimed' : 'Claim'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
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
            <FaShieldAlt className="w-10 h-10 text-rose-400 animate-pulse" /> PET Benefits
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Swytch PET aligns your Energy with decentralized freedom. Discover the pillars of the Petaverse.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6 no-scrollbar"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...benefits, ...benefits].map((benefit, i) => (
                <motion.div
                  key={`${benefit.title}-${i}`}
                  className="flex-shrink-0 w-[320px] bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/40 transition-all backdrop-blur-md cursor-pointer"
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => toggleBenefit(benefit.title)}
                  role="button"
                  aria-expanded={expandedBenefit === benefit.title}
                  aria-label={`Toggle details for ${benefit.title}`}
                >
                  <div className="flex items-center mb-4 text-rose-400">
                    <benefit.icon className="w-8 h-8 mr-3 animate-pulse" />
                    <h4 className="text-xl font-bold">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{benefit.description}</p>
                  <AnimatePresence>
                    {expandedBenefit === benefit.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-gray-400"
                      >
                        {benefit.details}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
            <FaCogs className="w-10 h-10 text-pink-400 animate-spin-slow" /> Swytch Ecosphere
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            A decentralized universe of NFTs, yields, and governance, powered by Avalanche and WAGMI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {businessModel.map((item, index) => (
              <motion.div
                key={index}
                className="relative bg-gray-900/60 p-8 rounded-xl shadow-xl border border-pink-500/20 backdrop-blur-md"
                variants={sectionVariants}
                whileHover={{ scale: 1.03 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl" />
                <div className="relative space-y-4">
                  <item.icon className="w-8 h-8 text-pink-400 animate-pulse" />
                  <h4 className="text-xl font-bold text-pink-300">{item.title}</h4>
                  <p className="text-sm text-gray-300">{item.description}</p>
                  <p className="text-sm text-gray-400">{item.details}</p>
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
            Protect your JEWELS and SWYT by avoiding these common crypto traps.
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
                  <p className="text-sm text-gray-400">{item.details}</p>
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
            <FaWallet className="w-10 h-10 text-rose-400 animate-pulse" /> Supported Wallets & Tokens
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Connect seamlessly with WAGMI and use tokens across EVM chains in the Petaverse.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {wallets.map((wallet, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 p-4 rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold border border-rose-500/20 backdrop-blur-md"
                whileHover={{ scale: 1.05 }}
              >
                <wallet.icon className="w-6 h-6 text-rose-400 animate-pulse" /> {wallet.name}
              </motion.div>
            ))}
          </div>
          <h4 className="text-xl font-semibold text-rose-400 mb-4">Supported Tokens</h4>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-6">
            Use JEWELS and SWYT for Petaverse actions or bridge stablecoins for flexibility.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {tokens.map((token, i) => (
              <motion.span
                key={i}
                className="bg-rose-800/50 border border-rose-400 text-rose-200 px-4 py-2 rounded-full text-sm"
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
          initial="hidden"
          animate="visible"
          className="relative max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-pink-500/20 shadow-2xl hover:shadow-pink-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl" />
          <div className="relative space-y-8">
            <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <FaRocket className="w-10 h-10 text-pink-400 animate-pulse" /> Ignite Your Sovereignty
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Swytch PET is a rebellion against centralized control. Earn JEWELS, govern the Petaverse, and build wealth on your terms.
            </p>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Connect your wallet, claim your first quest, and become a PET in a decentralized future.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  className="inline-flex items-center px-8 py-4 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group"
                  onClick={() => {
                    if (!isConnected) openConnectModal();
                    else alert('Wallet already connected!');
                  }}
                  whileHover={{ scale: 1.05 }}
                  aria-label="Join the Swytch Private Energy Trust"
                >
                  Become a PET
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </motion.div>
      </section>

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
            aria-labelledby="modal-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-rose-500/20 shadow-2xl backdrop-blur-lg"
              tabIndex={-1}
            >
              <motion.button
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
                whileHover={{ rotate: 90 }}
                aria-label="Close modal"
              >
                <X className="w-8 h-8" />
              </motion.button>
              <h3 id="modal-title" className="text-3xl font-bold text-rose-400 mb-6 flex items-center gap-3">
                <FaWallet className="w-8 h-8 animate-pulse" /> Connect to Swytch
              </h3>
              <div className="space-y-4">
                <ConnectButton
                  label="Connect Wallet"
                  showBalance={false}
                  accountStatus="address"
                  chainStatus="none"
                />
                <motion.button
                  className="w-full p-3 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => alert('Redirecting to wallet creation guide...')}
                  aria-label="Create New Wallet"
                >
                  <FaWallet className="w-5 h-5" /> Create New Wallet
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Popup */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            variants={rewardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-20 right-4 max-w-sm w-full bg-gray-900 border border-rose-500/20 rounded-xl shadow-2xl p-4 backdrop-blur-lg z-50"
          >
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-rose-400 animate-pulse" />
              <div>
                <p className="text-white font-bold">{showReward.message}</p>
                <p className="text-sm text-gray-300">+{showReward.jewels} JEWELS, +{showReward.xp} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio */}
      <audio ref={rewardAudioRef} src="/audio/reward.mp3" preload="auto" />

      <style>
        {`
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
          .blur-3xl {
            filter: blur(64px);
          }
          .blur-2xl {
            filter: blur(32px);
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          button:focus, .cursor-pointer:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
          }
          @media (prefers-reduced-motion) {
            .animate-pulse, .animate-spin-slow, [data-animate] {
              animation: none !important;
              transition: none !important;
            }
          }
          .bg-[url('/noise.png')] {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUkqVJutxuNRqMhSRJpmkYkSVKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJutxuNRqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TqCRZQqlUKqlaVSqlUKqVqlaKQlJ/kfgBQUzS2f8eAAAAAElFTkSuQmCC');
          }
        `}
      </style>
    </>
  );
};

export default TrustBenefits;