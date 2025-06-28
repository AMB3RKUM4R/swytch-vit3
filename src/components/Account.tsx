"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight, CheckCircle, Gift, ShoppingCart, TrendingUp, Zap, Coins, CreditCard, DollarSign, LineChart, User, Users, Wallet, ArrowRight, X, Sparkles, Trophy, Target, Award
} from 'lucide-react';
import { useAccount, useBalance, useConnect, useDisconnect, useContractWrite } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { wagmiConfig } from '../lib/wagmi'; // Adjust path to your wagmiConfig file

// Interfaces
interface Transaction {
  icon: JSX.Element;
  address: string;
  action: string;
  amount: string;
  forToken: string;
}

interface LeaderboardEntry {
  address: string;
  referrals: number;
  rewards: string;
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

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

interface SavedState {
  jewels: number;
  swyt: number;
  quests: Quest[];
  clicks: number;
  lastVisit: string | null;
  streak: number;
  achievements: Achievement[];
}

interface CardProps {
  children: React.ReactNode;
  gradient: string;
  className?: string;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// Data
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // Mainnet USDT
const ENERGY_TRUST_ADDRESS = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0'; // Provided Energy Trust address
const initialTransactions: Transaction[] = [
  {
    icon: <ArrowUpRight className="text-neon-green w-4 h-4 animate-pulse" />,
    address: '0x4b...d9A3',
    action: 'Swapped',
    amount: '$25 USDT',
    forToken: 'JEWELS'
  },
  {
    icon: <TrendingUp className="text-neon-green w-4 h-4 animate-pulse" />,
    address: '0x7c...eE12',
    action: 'Staked',
    amount: '$100 ETH',
    forToken: 'Energy Vault'
  },
  {
    icon: <ShoppingCart className="text-neon-green w-4 h-4 animate-pulse" />,
    address: '0x19...a1F8',
    action: 'Purchased',
    amount: 'NFT #9',
    forToken: 'Vault Guardian'
  },
  {
    icon: <Gift className="text-neon-green w-4 h-4 animate-pulse" />,
    address: '0x32...BbC0',
    action: 'Claimed',
    amount: '3.3% yield',
    forToken: 'Trust Rewards'
  },
  {
    icon: <Zap className="text-neon-green w-4 h-4 animate-pulse" />,
    address: '0xAF...11eB',
    action: 'Upgraded PET to Level 4',
    amount: 'Bonus JEWELS',
    forToken: ''
  },
];

const generateRandomTx = (): Transaction => {
  const actions = ['Arbitraged', 'Swapped', 'Deposited', 'Claimed Reward', 'Purchased', 'Staked'];
  const icons = [ArrowUpRight, TrendingUp, Gift, Zap, ShoppingCart, CheckCircle];
  const amounts = ['$12.50', '$47.20', '$89.00', '$13.33', '$101.00'];
  const tokens = ['JEWELS', 'FDMT', 'USDT', 'ETH', 'NFT'];
  const address = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
  const index = Math.floor(Math.random() * actions.length);
  const IconEl = icons[index % icons.length];

  return {
    icon: <IconEl className="text-neon-green w-4 h-4 animate-pulse" />,
    address,
    action: actions[index],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    forToken: tokens[Math.floor(Math.random() * tokens.length)]
  };
};

const leaderboard: LeaderboardEntry[] = [
  { address: '0x1a...f9B2', referrals: 42, rewards: '500 JEWELS' },
  { address: '0x5b...cD4E', referrals: 35, rewards: '350 JEWELS' },
  { address: '0x9c...eF67', referrals: 28, rewards: '200 JEWELS' },
  { address: '0x3d...aB89', referrals: 15, rewards: '100 JEWELS' },
];

const initialQuests: Quest[] = [
  { id: 'view-tx', title: 'View Transaction Feed', progress: 0, goal: 1, rewardJEWELS: 10, rewardXP: 20, completed: false },
  { id: 'check-stats', title: 'Check Your Stats', progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: 'share-referral', title: 'Share Referral Link', progress: 0, goal: 1, rewardJEWELS: 15, rewardXP: 30, completed: false }
];

const achievements: Achievement[] = [
  { id: 'first-tx-view', title: 'First Transaction View', description: 'View the transaction feed for the first time.', unlocked: false },
  { id: 'streak-3', title: '3-Day Streak', description: 'Check in for 3 consecutive days.', unlocked: false },
  { id: 'jewels-100', title: 'JEWELS Collector', description: 'Collect 100 JEWELS.', unlocked: false },
  { id: 'referrals-10', title: 'Social PET', description: 'View 10 referral entries.', unlocked: false }
];

const checkInRewards = [5, 10, 15, 20, 25, 30, 50];

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

const vaultClickVariants = {
  click: { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } }
};

// Components
const Card = ({ children, gradient, className = '', onMouseEnter, onClick }: CardProps) => (
  <motion.div
    className={`relative bg-gray-900/50 border border-neon-green/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-neon-green/30 transition-all bg-gradient-to-r ${gradient} ${className}`}
    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(57, 255, 20, 0.5)' }}
    onMouseEnter={onMouseEnter}
    onClick={onClick}
    tabIndex={0}
    role="button"
    aria-label={onClick ? 'Interactive card' : 'Information card'}
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
        className="bg-gray-900 border border-neon-green/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-purple-500 flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 text-neon-green animate-pulse" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="text-neon-green hover:text-red-500 w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const metaMaskConnector = connectors.find((c) => c.id === 'metaMask');
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');

  return (
    <div className="space-y-4">
      <motion.button
        onClick={() => (isConnected ? disconnect() : metaMaskConnector && connect({ connector: metaMaskConnector }))}
        className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-500 hover:bg-purple-600'
        } text-white transition-all`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isConnected ? 'Disconnect MetaMask' : 'Connect MetaMask'}
        disabled={!metaMaskConnector}
      >
        <Wallet className="w-5 h-5 text-neon-green animate-pulse" />
        {isConnected ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connect MetaMask'}
      </motion.button>
      <motion.button
        onClick={() => (isConnected ? disconnect() : walletConnectConnector && connect({ connector: walletConnectConnector }))}
        className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-500 hover:bg-purple-600'
        } text-white transition-all`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isConnected ? 'Disconnect WalletConnect' : 'Connect WalletConnect'}
        disabled={!walletConnectConnector}
      >
        <Wallet className="w-5 h-5 text-neon-green animate-pulse" />
        {isConnected ? 'Disconnect' : 'Connect WalletConnect'}
      </motion.button>
    </div>
  );
};

// Main Component
const TransactionStatus: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [jewelsBalance, setJewelsBalance] = useState(0);
  const [swytBalance, setSwytBalance] = useState(26);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [dailyClicks, setDailyClicks] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [achievementsState, setAchievementsState] = useState<Achievement[]>(achievements);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [visitStreak, setVisitStreak] = useState(0);
  const [, setReferralViews] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const vaultRef = useRef<HTMLCanvasElement>(null);
  const clickAudioRef = useRef<HTMLAudioElement>(null);
  const rewardAudioRef = useRef<HTMLAudioElement>(null);
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address, chainId: wagmiConfig.chains[0].id });
  const { data: usdtBalance } = useBalance({ address, token: USDT_ADDRESS, chainId: wagmiConfig.chains[0].id });
  const { writeContract, isPending, isSuccess, error } = useContractWrite();

  // Local Storage Keys
  const JEWELS_STORAGE_KEY = 'swytch_exp_game_state';
  const SWYT_STORAGE_KEY = 'swytch_game_state';
  const MEMBERSHIP_STORAGE_KEY = 'swytch_membership';

  // Load State
  useEffect(() => {
    const jewelsState = localStorage.getItem(JEWELS_STORAGE_KEY);
    const swytState = localStorage.getItem(SWYT_STORAGE_KEY);
    const membershipState = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (jewelsState) {
      const parsedState: SavedState = JSON.parse(jewelsState);
      setJewelsBalance(parsedState.jewels || 0);
      setQuests(parsedState.quests?.filter(q => initialQuests.some(iq => iq.id === q.id)) || initialQuests);
      setDailyClicks(parsedState.clicks || 0);
      setLastVisit(parsedState.lastVisit || null);
      setVisitStreak(parsedState.streak || 0);
      setAchievementsState(parsedState.achievements || achievements);
      setReferralViews(parsedState.achievements?.find(a => a.id === 'referrals-10')?.unlocked ? 10 : 0);
    } else {
      unlockAchievement('first-tx-view');
      setShowCheckInModal(true);
    }

    if (swytState) {
      const parsedSwytState = JSON.parse(swytState);
      setSwytBalance(parsedSwytState.swytBalance || 26);
    }

    if (membershipState) {
      setIsMember(JSON.parse(membershipState).isMember || false);
    }

    if (lastVisit !== today) {
      setDailyClicks(0);
      setQuests(initialQuests.map(q => ({ ...q, progress: 0, completed: false })));
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
      if (lastVisit === yesterday) {
        setVisitStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak >= 3) unlockAchievement('streak-3');
          return newStreak;
        });
        setShowCheckInModal(true);
      } else {
        setVisitStreak(1);
        setShowCheckInModal(true);
      }
      setLastVisit(today);
    }
  }, []);

  // Save State
  useEffect(() => {
    localStorage.setItem(JEWELS_STORAGE_KEY, JSON.stringify({
      jewels: jewelsBalance,
      quests,
      clicks: dailyClicks,
      lastVisit,
      streak: visitStreak,
      achievements: achievementsState
    }));
    localStorage.setItem(SWYT_STORAGE_KEY, JSON.stringify({
      swytBalance
    }));
    localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify({ isMember }));
  }, [jewelsBalance, swytBalance, quests, dailyClicks, lastVisit, visitStreak, achievementsState, isMember]);

  // Auto-dismiss Reward Popup
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  // Transaction Feed
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => [generateRandomTx(), ...prev.slice(0, 49)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll Transaction Feed
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

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Draw Energy Vault
  useEffect(() => {
    const canvas = vaultRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;

    const drawVault = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
      gradient.addColorStop(0, 'rgba(57, 255, 20, 0.8)');
      gradient.addColorStop(1, 'rgba(107, 70, 193, 0.2)');
      ctx.beginPath();
      ctx.arc(50, 50, 45, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
    };

    drawVault();
  }, []);

  // Unlock Achievement
  const unlockAchievement = (id: string) => {
    setAchievementsState(prev =>
      prev.map(a => a.id === id && !a.unlocked ? { ...a, unlocked: true } : a)
    );
    if (id === 'first-tx-view') {
      setShowReward({ jewels: 5, xp: 10, message: 'Achievement Unlocked: First Transaction View!' });
      rewardAudioRef.current?.play();
    } else if (id === 'streak-3') {
      setShowReward({ jewels: 20, xp: 30, message: 'Achievement Unlocked: 3-Day Streak!' });
      rewardAudioRef.current?.play();
    } else if (id === 'jewels-100') {
      setShowReward({ jewels: 10, xp: 20, message: 'Achievement Unlocked: JEWELS Collector!' });
      rewardAudioRef.current?.play();
    } else if (id === 'referrals-10') {
      setShowReward({ jewels: 15, xp: 30, message: 'Achievement Unlocked: Social PET!' });
      rewardAudioRef.current?.play();
    }
  };

  // Handle Energy Vault Click
  const handleVaultClick = () => {
    if (dailyClicks >= 10) {
      alert('Daily click limit reached! Come back tomorrow.');
      return;
    }

    clickAudioRef.current?.play();
    const jewelsGain = Math.floor(Math.random() * 3) + 1;
    setJewelsBalance(prev => {
      const newJewels = prev + jewelsGain;
      if (newJewels >= 100 && !achievementsState.find(a => a.id === 'jewels-100')?.unlocked) {
        unlockAchievement('jewels-100');
      }
      return newJewels;
    });
    setDailyClicks(prev => prev + 1);
    setQuests(prev =>
      prev.map(q =>
        q.id === 'view-tx' && !q.completed
          ? { ...q, progress: Math.min(q.progress + 1, q.goal) }
          : q
      )
    );

    const canvas = vaultRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            ctx.beginPath();
            ctx.arc(50 + (Math.random() - 0.5) * 20, 50 + (Math.random() - 0.5) * 20, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(57, 255, 20, 0.8)';
            ctx.fill();
            ctx.closePath();
          }, i * 50);
        }
        setTimeout(() => {
          const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
          gradient.addColorStop(0, 'rgba(57, 255, 20, 0.8)');
          gradient.addColorStop(1, 'rgba(107, 70, 193, 0.2)');
          ctx.beginPath();
          ctx.arc(50, 50, 45, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.closePath();
        }, 250);
      }
    }
  };

  // Handle Quest Completion
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed || quest.progress < quest.goal) return;

    setQuests(prev =>
      prev.map(q =>
        q.id === questId ? { ...q, completed: true } : q
      )
    );
    setJewelsBalance(prev => prev + quest.rewardJEWELS);
    setShowReward({
      jewels: quest.rewardJEWELS,
      xp: quest.rewardXP,
      message: `Quest Completed: ${quest.title}!`
    });
    rewardAudioRef.current?.play();
  };

  // Handle Stats Hover
  const handleStatsHover = () => {
    setQuests(prev =>
      prev.map(q =>
        q.id === 'check-stats' && !q.completed
          ? { ...q, progress: 1, completed: true }
          : q
      )
    );
  };

  // Handle Referral Click
  const handleReferralClick = () => {
    setReferralViews(prev => {
      const newViews = prev + 1;
      if (newViews >= 10 && !achievementsState.find(a => a.id === 'referrals-10')?.unlocked) {
        unlockAchievement('referrals-10');
      }
      return newViews;
    });
    setQuests(prev =>
      prev.map(q =>
        q.id === 'share-referral' && !q.completed
          ? { ...q, progress: 1, completed: true }
          : q
      )
    );
    alert('Referral link copied: https://swytch.io/ref/0xAB...CDEF');
  };

  // Handle Account Details Click
  const handleAccountDetailsClick = () => {
    const network = chain?.name || 'Unknown';
    alert(
      `Balance: ${swytBalance} SWYT, ${jewelsBalance} JEWELS\n` +
      `ETH: ${ethBalance ? `${formatUnits(ethBalance.value, ethBalance.decimals)} ETH` : 'N/A'}\n` +
      `USDT: ${usdtBalance ? `${formatUnits(usdtBalance.value, usdtBalance.decimals)} USDT` : 'N/A'}\n` +
      `Wallet: ${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}\n` +
      `Network: ${network}\n` +
      `Status: ${isMember ? 'PET Member' : 'Non-Member'}`
    );
  };

  // Handle Check-In
  const handleCheckIn = () => {
    const reward = checkInRewards[Math.min(visitStreak - 1, checkInRewards.length - 1)];
    setJewelsBalance(prev => prev + reward);
    setShowReward({ jewels: reward, xp: 0, message: `Day ${visitStreak} Check-In: +${reward} JEWELS!` });
    rewardAudioRef.current?.play();
    setShowCheckInModal(false);
  };

  // Handle Membership Payment
  const payMembership = async () => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }
    if (chain?.id !== wagmiConfig.chains[0].id) {
      alert('Please switch to Ethereum Mainnet.');
      return;
    }
    if (usdtBalance && Number(formatUnits(usdtBalance.value, usdtBalance.decimals)) < 10) {
      alert('Insufficient USDT balance. You need at least 10 USDT.');
      return;
    }

    try {
      await writeContract({
        address: USDT_ADDRESS,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: '_to', type: 'address' },
              { name: '_value', type: 'uint256' }
            ],
            outputs: [{ type: 'bool' }],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'transfer',
        args: [ENERGY_TRUST_ADDRESS, parseUnits('10', 6)]
      });
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  // Handle Payment Success
  useEffect(() => {
    if (isSuccess) {
      setIsMember(true);
      setShowReward({ jewels: 0, xp: 0, message: 'Swytch PET Purchased! Welcome to the PETverse.' });
      setShowWalletModal(false);
    }
  }, [isSuccess]);

  // Handle Payment Error
  useEffect(() => {
    if (error) {
      alert(`Payment error: ${error.message}`);
    }
  }, [error]);

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-dark-gray via-purple-500/20 to-black text-white overflow-hidden">
      {/* Visual Effects */}
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-neon-green/50 via-purple-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-purple-500/30 to-neon-green/20 rounded-full opacity-20 blur-2xl"
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
              backgroundColor: i % 2 === 0 ? 'rgba(57, 255, 20, 0.5)' : 'rgba(107, 70, 193, 0.5)'
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
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-neon-green/30 shadow-2xl hover:shadow-neon-green/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/60 to-neon-green/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-neon-green rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-purple-500 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-purple-500 flex items-center justify-center gap-4 font-poppins"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 text-neon-green animate-pulse" /> Energy Trust
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
              Join the Swytch Energy Trust to fuel AI-driven gameplay and arbitrage, earning up to 3.3% monthly yield at Mythic PET level across 5 DEXes.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-purple-500 text-white hover:bg-purple-600 rounded-full text-lg font-semibold group font-poppins"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
            >
              Join the Vault
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Membership Upgrade */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-purple-500/10 to-neon-green/10">
            <div className="space-y-6 text-center">
              <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
                <Trophy className="w-8 h-8 text-neon-green animate-pulse" /> Membership Upgrade
              </h3>
              <p className="text-lg text-gray-300 font-inter">
                Become a Swytch PET for $10 USDT (₹830) to unlock exclusive rewards, voting rights, and access to the decentralized ecosystem.
              </p>
              <motion.button
                className={`px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isMember ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
                onClick={isMember ? undefined : payMembership}
                disabled={isMember || isPending}
                whileHover={{ scale: isMember || isPending ? 1 : 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
                whileTap={{ scale: isMember || isPending ? 1 : 0.95 }}
                aria-label={isMember ? 'Already a PET' : isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT'}
              >
                {isMember ? 'PET Member' : isPending ? 'Processing...' : 'Buy Swytch PET for $10 USDT'}
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Daily Quests */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-neon-green/10 to-purple-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3 font-poppins">
                <Target className="w-8 h-8 text-neon-green animate-pulse" /> Daily Quests
              </h3>
              <p className="text-gray-300 font-inter">Complete tasks to earn JEWELS and XP in the Swytch ecosystem!</p>
              <div className="space-y-4">
                {quests.map(quest => (
                  <div key={quest.id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
                    <div>
                      <p className="text-white font-semibold font-poppins">{quest.title}</p>
                      <p className="text-sm text-gray-400 font-inter">
                        Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
                      </p>
                      <div className="w-32 bg-gray-900 rounded-full h-2 mt-2">
                        <div
                          className="bg-neon-green h-2 rounded-full"
                          style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                        />
                      </div>
                    </div>
                    <motion.button
                      className={`px-4 py-2 rounded-lg font-semibold font-poppins ${quest.progress >= quest.goal && !quest.completed ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                      onClick={() => handleClaimQuest(quest.id)}
                      disabled={quest.completed || quest.progress < quest.goal}
                      whileHover={{ scale: quest.progress >= quest.goal && !quest.completed ? 1.05 : 1 }}
                      aria-disabled={quest.completed || quest.progress < quest.goal}
                    >
                      {quest.completed ? 'Claimed' : 'Claim'}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Energy Vault */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-purple-500/10 to-neon-green/10">
            <div className="space-y-6 text-center">
              <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
                <Zap className="w-8 h-8 text-neon-green animate-pulse" /> Energy Vault
              </h3>
              <p className="text-2xl text-gray-300 font-inter">JEWELS: {jewelsBalance} 💎 | SWYT: {swytBalance} ⚡</p>
              <p className="text-lg text-gray-400 font-inter">Check-In Streak: {visitStreak} Day{visitStreak !== 1 ? 's' : ''}</p>
              <motion.canvas
                ref={vaultRef}
                className="mx-auto cursor-pointer"
                width={100}
                height={100}
                onClick={handleVaultClick}
                variants={vaultClickVariants}
                animate={dailyClicks < 10 ? 'click' : undefined}
                role="button"
                aria-label="Collect JEWELS from Energy Vault"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleVaultClick()}
              />
              <p className="text-sm text-gray-400 font-inter">
                {dailyClicks < 10 ? `${10 - dailyClicks} clicks left today` : 'Come back tomorrow!'}
              </p>
              <p className="text-lg text-purple-500 font-inter">
                Click the Energy Vault to collect JEWELS and power your decentralized financial journey.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Transaction Feed */}
        <motion.div
          variants={sectionVariants}
          className="max-w-5xl mx-auto space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <Zap className="w-8 h-8 text-neon-green animate-pulse" /> Live Transactions
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
            Real-time arbitrage across Uniswap, SushiSwap, PancakeSwap, Curve, and Balancer fuels your PET rewards.
          </p>
          <div
            ref={feedRef}
            className="bg-gray-900/60 backdrop-blur-lg border border-neon-green/20 rounded-2xl p-6 h-[500px] overflow-y-auto no-scrollbar shadow-xl"
            role="log"
            aria-live="polite"
            aria-label="Live Transaction Feed"
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
                  <div className="p-2 bg-neon-green/20 rounded-full">{tx.icon}</div>
                  <div className="text-sm">
                    <p className="text-white font-mono mb-1">{tx.address}</p>
                    <p className="text-gray-300 font-inter">
                      <span className="text-neon-green font-medium">{tx.action}</span> {tx.amount}{' '}
                      {tx.forToken && <span className="text-neon-green">for {tx.forToken}</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-sm text-neon-green italic text-center max-w-xl mx-auto font-inter">
            💠 All Vault Deposits power AI-driven trades, delivering real yield for PETs.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          <Card gradient="from-neon-green/10 to-purple-500/10" className="flex flex-col items-center" onMouseEnter={handleStatsHover}>
            <Coins className="w-8 h-8 text-neon-green mb-2 animate-pulse" />
            <p className="text-sm text-gray-400 font-inter">Your Balance</p>
            <p className="text-xl font-bold text-white font-poppins">{swytBalance} SWYT</p>
            {isConnected && (
              <>
                <p className="text-sm text-gray-400 font-inter">ETH</p>
                <p className="text-xl font-bold text-white font-poppins">{ethBalance ? `${formatUnits(ethBalance.value, ethBalance.decimals)} ETH` : 'Loading...'}</p>
                <p className="text-sm text-gray-400 font-inter">USDT</p>
                <p className="text-xl font-bold text-white font-poppins">{usdtBalance ? `${formatUnits(usdtBalance.value, usdtBalance.decimals)} USDT` : 'Loading...'}</p>
              </>
            )}
          </Card>
          <Card gradient="from-neon-green/10 to-purple-500/10" className="flex flex-col items-center" onMouseEnter={handleStatsHover}>
            <LineChart className="w-8 h-8 text-neon-green mb-2 animate-pulse" />
            <p className="text-sm text-gray-400 font-inter">Profit</p>
            <p className="text-xl font-bold text-white font-poppins">57 SWYT</p>
          </Card>
          <Card gradient="from-neon-green/10 to-purple-500/10" className="flex flex-col items-center" onMouseEnter={handleStatsHover}>
            <DollarSign className="w-8 h-8 text-neon-green mb-2 animate-pulse" />
            <p className="text-sm text-gray-400 font-inter">Total Deposit</p>
            <p className="text-xl font-bold text-white font-poppins">9,839 SWYT</p>
          </Card>
          <Card gradient="from-neon-green/10 to-purple-500/10" className="flex flex-col items-center" onMouseEnter={handleStatsHover}>
            <CreditCard className="w-8 h-8 text-neon-green mb-2 animate-pulse" />
            <p className="text-sm text-gray-400 font-inter">Total Withdrawals</p>
            <p className="text-xl font-bold text-white font-poppins">9,870 SWYT</p>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <Card gradient="from-purple-500/10 to-neon-green/10" className="text-center">
            <p className="text-neon-green text-3xl font-bold font-poppins">4.21%</p>
            <p className="text-gray-300 text-sm mt-2 font-inter">Swytch Profits for May 2025</p>
          </Card>
          <Card gradient="from-purple-500/10 to-neon-green/10" className="text-center">
            <p className="text-neon-green text-3xl font-bold font-poppins">3.79%</p>
            <p className="text-gray-300 text-sm mt-2 font-inter">Your Max Profits for May 2025</p>
          </Card>
          <Card gradient="from-purple-500/10 to-neon-green/10" className="text-center">
            <p className="text-neon-green text-3xl font-bold font-poppins">462.14%</p>
            <p className="text-gray-300 text-sm mt-2 font-inter">Swytch Profits Since Inception</p>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-neon-green/10 to-purple-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3 font-poppins">
                <Award className="w-8 h-8 text-neon-green animate-pulse" /> Achievements
              </h3>
              <p className="text-gray-300 font-inter">Earn milestones to showcase your mastery in the Swytch ecosystem!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievementsState.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${achievement.unlocked ? 'border-neon-green bg-gray-800/50' : 'border-gray-600 opacity-50'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Award className={`w-6 h-6 ${achievement.unlocked ? 'text-neon-green' : 'text-gray-400'}`} />
                      <p className="text-white font-semibold font-poppins">{achievement.title}</p>
                    </div>
                    <p className="text-sm text-gray-400 font-inter">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Referral Leaderboard */}
        <motion.div
          variants={sectionVariants}
          className="max-w-5xl mx-auto space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <Trophy className="w-8 h-8 text-neon-green animate-pulse" /> Referral Leaderboard
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
            Invite PETs to the Swytch Vault and earn JEWELS for every referral in our decentralized ecosystem.
          </p>
          <Card gradient="from-neon-green/10 to-purple-500/10">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-900/60 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-neon-green font-bold text-lg">{index + 1}.</span>
                  <p className="text-white font-mono">{entry.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm font-inter">{entry.referrals} Referrals</p>
                  <p className="text-neon-green font-semibold font-poppins">{entry.rewards}</p>
                </div>
              </motion.div>
            ))}
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <Card gradient="from-neon-green/10 to-purple-500/10" className="flex items-center gap-4 cursor-pointer" onClick={handleAccountDetailsClick}>
            <User className="w-6 h-6 text-neon-green animate-pulse" />
            <p className="text-white font-poppins">Account Details</p>
          </Card>
          <Card gradient="from-neon-green/10 to-purple-500/10" className="flex items-center gap-4 cursor-pointer" onClick={handleReferralClick}>
            <Users className="w-6 h-6 text-neon-green animate-pulse" />
            <p className="text-white font-poppins">Referrals</p>
          </Card>
          <Card gradient="from-neon-green/10 to-purple-500/10" className="text-center">
            <p className="text-white text-lg font-bold font-poppins">Active PETs</p>
            <p className="text-neon-green font-semibold text-2xl mt-1 font-poppins">0</p>
          </Card>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-neon-green italic text-center max-w-xl mx-auto font-mono"
        >
          <p>
            🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
            🔗 Network: {chain?.name || 'Unknown'} | 
            💼 Status: {isMember ? 'PET Member' : 'Non-Member'}
          </p>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-neon-green/20 shadow-2xl hover:shadow-neon-green/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-neon-green/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
              <Sparkles className="w-10 h-10 text-neon-green animate-pulse" /> Power Your Future
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
              Join the Swytch Energy Trust as a PET to harness AI-driven yields and fuel your decentralized journey with JEWELS and SWYT.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-purple-500 text-white hover:bg-purple-600 rounded-full text-lg font-semibold group font-poppins"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
            >
              Start Earning
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <Modal title="Connect to the Vault" onClose={() => setShowWalletModal(false)}>
            <div className="space-y-4">
              <ConnectWalletButton />
              <motion.button
                className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins"
                whileHover={{ scale: 1.05 }}
                onClick={() => alert('Wallet generation not implemented yet.')}
              >
                <Wallet className="w-5 h-5 text-neon-green animate-pulse" /> Generate New Wallet
              </motion.button>
              <motion.button
                className={`w-full p-3 rounded-lg font-semibold text-white font-poppins ${isMember ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
                onClick={isMember ? undefined : payMembership}
                disabled={isMember || isPending}
                whileHover={{ scale: isMember || isPending ? 1 : 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
                whileTap={{ scale: isMember || isPending ? 1 : 0.95 }}
                aria-label={isMember ? 'Already a PET' : isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT'}
              >
                {isMember ? 'PET Member' : isPending ? 'Processing...' : 'Buy Swytch PET for $10 USDT'}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Check-In Modal */}
      <AnimatePresence>
        {showCheckInModal && (
          <Modal title={`Day ${visitStreak} Check-In`} onClose={() => setShowCheckInModal(false)}>
            <div className="space-y-6 text-center">
              <p className="text-gray-300 font-inter">
                Claim your daily reward: <span className="text-neon-green font-bold font-poppins">{checkInRewards[Math.min(visitStreak - 1, checkInRewards.length - 1)]} JEWELS</span>
              </p>
              <motion.button
                className="w-full p-3 bg-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins"
                whileHover={{ scale: 1.05 }}
                onClick={handleCheckIn}
              >
                <Gift className="w-5 h-5 text-neon-green" /> Claim Reward
              </motion.button>
              <button
                className="text-gray-400 hover:text-gray-300 text-sm font-inter"
                onClick={() => setShowCheckInModal(false)}
              >
                Skip
              </button>
            </div>
          </Modal>
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
            className="fixed bottom-20 right-4 max-w-sm w-full bg-gray-900 border border-neon-green/20 rounded-xl shadow-2xl p-4 backdrop-blur-lg z-50"
          >
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-neon-green animate-pulse" />
              <div>
                <p className="text-white font-bold font-poppins">{showReward.message}</p>
                <p className="text-sm text-gray-300 font-inter">+{showReward.jewels} JEWELS{showReward.xp > 0 ? `, +${showReward.xp} XP` : ''}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio */}
      <audio ref={clickAudioRef} src="/audio/click.mp3" preload="auto" />
      <audio ref={rewardAudioRef} src="/audio/reward.mp3" preload="auto" />

      <style>{`
        :root {
          --purple-500: #6B46C1;
          --neon-green: #39FF14;
          --dark-gray: #1A202C;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .blur-3xl { filter: blur(64px); }
        .blur-2xl { filter: blur(32px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUkqVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJutxuNRqVSqlUKqVSqZQqlaKQlJ/kfgBQUzS2f8eAAAAAElFTkSuQmCC');
        }
        button:focus, canvas:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(57, 255, 20, 0.5);
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

export default TransactionStatus;