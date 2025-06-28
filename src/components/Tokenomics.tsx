import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ChevronDown, ArrowRight, X, Sparkles, Zap, Gift, ShieldCheck, BookOpen, Target, Users, Award } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Confetti from 'react-confetti';

// Interfaces
interface Token {
  icon: string;
  title: string;
  description: string;
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

interface LeaderboardEntry {
  name: string;
  level: number;
  jewels: number;
}

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

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

// Data
const tokenData: Token[] = [
  {
    icon: '/icon_energy.gif',
    title: 'JEWELS = Pure Energy',
    description: 'Earn JEWELS through deposits, education, and engagement. They’re your proof-of-purpose, unlocking the Swytch ecosystem’s full potential.'
  },
  {
    icon: '/icon_swap.gif',
    title: 'Stable Value, Zero Volatility',
    description: 'JSIT, FDMT, and SWYT tokens are pegged at $1, ensuring accessibility and shielding you from crypto market chaos.'
  },
  {
    icon: '/icon_reward.gif',
    title: '3.3% Monthly Yield',
    description: 'Earn up to 3.3% monthly yield at Mythic PET level through active participation—no staking, no lock-ups.'
  },
  {
    icon: '/icon_learning.gif',
    title: 'Knowledge Fuels Wealth',
    description: 'Master quests in the Raziel Library to boost your yield tier. Your learning becomes your stake in the Petaverse.'
  },
  {
    icon: '/icon_privacy.gif',
    title: 'Sovereign by Design',
    description: 'Swytch never touches your funds. Smart contracts ensure transparent rewards. Your keys, your vault, your freedom.'
  },
  {
    icon: '/icon_nft.gif',
    title: 'Identity as Power',
    description: 'Your on-chain PET identity reflects your contributions, unlocking exclusive perks, games, and narrative progression.'
  },
  {
    icon: '/icon_vault.gif',
    title: 'Private PET Vaults',
    description: 'Every user commands a smart contract-based PET Vault, securing and growing your Energy autonomously.'
  },
  {
    icon: '/icon_decentralized.gif',
    title: 'Code-Driven Economy',
    description: 'No central control. Every swap, yield, and transaction is governed by immutable smart contracts.'
  },
  {
    icon: '/icon_equalizer.gif',
    title: 'Wealth for All',
    description: 'No whales, no gatekeepers. Rewards are earned through merit and intent, redefining wealth by contribution.'
  },
  {
    icon: '/icon_freedom.gif',
    title: 'Energy is Freedom',
    description: 'Every action—play, learn, share—generates Energy, exchangeable for assets, missions, or real-world value.'
  }
];

const pieData = [
  { name: 'JEWELS Rewards Pool', value: 40 },
  { name: 'Platform Growth & Development', value: 35 },
  { name: 'Educational Incentives', value: 25 },
];

const COLORS = ['#00FFFF', '#38BDF8', '#6366F1'];

const barData = [
  { name: '2020', value: 159 },
  { name: '2021', value: 180 },
  { name: '2022', value: 198 },
  { name: '2023', value: 229 },
  { name: '2024', value: 265 },
];

const initialQuests: Quest[] = [
  { id: 'view-chart', title: 'View Token Allocation Chart', progress: 0, goal: 1, rewardJEWELS: 10, rewardXP: 20, completed: false },
  { id: 'read-faq', title: 'Read an FAQ', progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: 'visit-investment', title: 'Visit Investment Form', progress: 0, goal: 1, rewardJEWELS: 15, rewardXP: 30, completed: false }
];

const achievements: Achievement[] = [
  { id: 'first-visit', title: 'First Visit', description: 'Visit Tokenomics for the first time.', unlocked: false },
  { id: 'faq-3', title: 'Knowledge Seeker', description: 'Read 3 FAQs.', unlocked: false },
  { id: 'streak-3', title: '3-Day Streak', description: 'Visit for 3 consecutive days.', unlocked: false },
  { id: 'jewels-100', title: 'JEWELS Collector', description: 'Collect 100 JEWELS.', unlocked: false }
];

const leaderboard: LeaderboardEntry[] = [
  { name: 'EnergyMaster', level: 9, jewels: 15000 },
  { name: 'CryptoPET', level: 7, jewels: 8000 },
  { name: 'VaultKeeper', level: 5, jewels: 4000 },
  { name: 'SwytchSeeker', level: 4, jewels: 2000 },
  { name: 'NewPET', level: 1, jewels: 1000 }
];

const faqs = [
  {
    question: 'How do JEWELS differ from typical crypto tokens?',
    answer: 'JEWELS are earned through purposeful action—deposits, learning, and engagement—not speculation. They hold utility across the Swytch ecosystem and beyond.'
  },
  {
    question: 'What’s the monthly reward rate?',
    answer: 'Yields range from 1% to 3.3% monthly, scaling with your PET level and active participation.'
  },
  {
    question: 'Do I need to stake to earn rewards?',
    answer: 'No staking or lock-ups required. Rewards flow from your deposits, educational quests, and gaming activity.'
  },
  {
    question: 'Is Swytch’s tokenomics legally sound?',
    answer: 'Absolutely. Built on Private Ministerial Association (PMA) principles, Swytch operates under private trust law, outside public investment frameworks.'
  },
];

const testimonials = [
  {
    quote: 'Swytch turned my gaming hours into real rewards. In six months, I earned more than two years of HODLing!',
    author: 'Nina, Austin, TX'
  },
  {
    quote: 'Swytch’s focus on energy and sovereignty reshaped my financial mindset. It’s wealth with purpose.',
    author: 'Ravi, Mumbai'
  },
  {
    quote: 'From Web3 newbie to active earner, Swytch made it safe and rewarding to dive in.',
    author: 'Julia, Berlin'
  },
];

const earningsYearly = 100 * (1 + 0.033) ** 12;

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

const nodeClickVariants = {
  click: { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } }
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
            <X className="text-rose-400 hover:text-red-500 w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

const Tokenomics: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [jewelsBalance, setJewelsBalance] = useState(0);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [dailyClicks, setDailyClicks] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [achievementsState, setAchievementsState] = useState<Achievement[]>(achievements);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [visitStreak, setVisitStreak] = useState(0);
  const [, setFaqReadCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const nodeRef = useRef<HTMLCanvasElement>(null);
  const clickAudioRef = useRef<HTMLAudioElement>(null);
  const rewardAudioRef = useRef<HTMLAudioElement>(null);
  const investAudioRef = useRef<HTMLAudioElement>(null);

  // Load state from Firebase
  useEffect(() => {
    const fetchState = async () => {
      if (isConnected && address) {
        try {
          const userRef = doc(db, 'users', address);
          const userSnap = await getDoc(userRef);
          const today = new Date().toISOString().split('T')[0];
          const data = userSnap.exists() ? (userSnap.data() as SavedState) : undefined;

          if (data) {
            setJewelsBalance(data.jewels || 0);
            setQuests(data.quests?.filter(q => initialQuests.some(iq => iq.id === q.id)) || initialQuests);
            setDailyClicks(data.clicks || 0);
            setLastVisit(data.lastVisit);
            setVisitStreak(data.streak || 0);
            setAchievementsState(data.achievements || achievements);
            setFaqReadCount(data.achievements?.find(a => a.id === 'faq-3')?.unlocked ? 3 : 0);
          } else {
            await setDoc(userRef, {
              jewels: 0,
              quests: initialQuests,
              clicks: 0,
              lastVisit: today,
              streak: 1,
              achievements,
              WalletBalance: 0,
              membership: 'none',
              updatedAt: serverTimestamp()
            }, { merge: true });
            setJewelsBalance(0);
            setQuests(initialQuests);
            setDailyClicks(0);
            setLastVisit(today);
            setVisitStreak(1);
            setAchievementsState(achievements);
            unlockAchievement('first-visit');
          }

          // Handle daily reset and streak
          if (data?.lastVisit !== today) {
            setDailyClicks(0);
            const resetQuests = initialQuests.map(q => ({ ...q, progress: 0, completed: false }));
            setQuests(resetQuests);
            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
            if (data?.lastVisit === yesterday) {
              setVisitStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak >= 3) unlockAchievement('streak-3');
                return newStreak;
              });
            } else {
              setVisitStreak(1);
            }
            setLastVisit(today);
            await setDoc(userRef, { 
              lastVisit: today, 
              clicks: 0, 
              quests: resetQuests, 
              updatedAt: serverTimestamp() 
            }, { merge: true });
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
            clicks: dailyClicks,
            lastVisit,
            streak: visitStreak,
            achievements: achievementsState,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error('Failed to save state:', err);
          alert('Failed to save user data. Please try again.');
        }
      }
    };
    saveState();
  }, [jewelsBalance, quests, dailyClicks, lastVisit, visitStreak, achievementsState, isConnected, address]);

  // Auto-dismiss reward popup
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Draw Energy Node
  useEffect(() => {
    const canvas = nodeRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;

    const drawNode = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.2)');
      ctx.beginPath();
      ctx.arc(50, 50, 45, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
    };

    drawNode();
  }, []);

  // Unlock Achievement
  const unlockAchievement = async (id: string) => {
    setAchievementsState(prev =>
      prev.map(a => a.id === id && !a.unlocked ? { ...a, unlocked: true } : a)
    );
    let reward: Reward | null = null;
    if (id === 'first-visit') {
      reward = { jewels: 5, xp: 10, message: 'Achievement Unlocked: First Visit!' };
    } else if (id === 'faq-3') {
      reward = { jewels: 15, xp: 30, message: 'Achievement Unlocked: Knowledge Seeker!' };
    } else if (id === 'streak-3') {
      reward = { jewels: 20, xp: 30, message: 'Achievement Unlocked: 3-Day Streak!' };
    } else if (id === 'jewels-100') {
      reward = { jewels: 10, xp: 20, message: 'Achievement Unlocked: JEWELS Collector!' };
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
          achievements: achievementsState,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  };

  // Handle Energy Node Click
  const handleNodeClick = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to collect JEWELS.');
      setShowWalletModal(true);
      return;
    }
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
        q.id === 'view-chart' && !q.completed
          ? { ...q, progress: Math.min(q.progress + 1, q.goal), completed: q.progress + 1 >= q.goal }
          : q
      )
    );
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    // Particle effect
    const canvas = nodeRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            ctx.beginPath();
            ctx.arc(50 + (Math.random() - 0.5) * 20, 50 + (Math.random() - 0.5) * 20, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
            ctx.fill();
            ctx.closePath();
          }, i * 50);
        }
        setTimeout(() => {
          const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
          gradient.addColorStop(1, 'rgba(244, 63, 94, 0.2)');
          ctx.beginPath();
          ctx.arc(50, 50, 45, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.closePath();
        }, 250);
      }
    }

    if (isConnected && address) {
      const userRef = doc(db, 'users', address);
      await setDoc(userRef, {
        jewels: jewelsBalance + jewelsGain,
        clicks: dailyClicks + 1,
        quests,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  };

  // Handle Quest Completion
  const handleClaimQuest = async (questId: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to claim quests.');
      setShowWalletModal(true);
      return;
    }
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
  };

  // Handle FAQ Toggle
  const handleFaqToggle = async (index: number) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to read FAQs.');
      setShowWalletModal(true);
      return;
    }
    setOpenFaq(openFaq === index ? null : index);
    if (openFaq !== index) {
      setFaqReadCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3 && !achievementsState.find(a => a.id === 'faq-3')?.unlocked) {
          unlockAchievement('faq-3');
        }
        return newCount;
      });
      setQuests(prev =>
        prev.map(q =>
          q.id === 'read-faq' && !q.completed
            ? { ...q, progress: 1, completed: true }
            : q
        )
      );
      if (isConnected && address) {
        const userRef = doc(db, 'users', address);
        await setDoc(userRef, {
          quests,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  };

  // Handle Investment Submission
  const handleInvestmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected || !address) {
      alert('Please connect your wallet to submit an investment.');
      setShowWalletModal(true);
      return;
    }
    const form = e.currentTarget;
    const amount = parseFloat(form['amount'].value);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid investment amount.');
      return;
    }
    const jewelAmount = amount * 100 * 10; // 1 USD = 100 INR = 1000 JEWELS
    try {
      const userRef = doc(db, 'users', address);
      await setDoc(userRef, {
        jewels: jewelsBalance + jewelAmount,
        WalletBalance: amount,
        network: 'Avalanche',
        token: 'USDT',
        updatedAt: serverTimestamp(),
        quests: quests.map(q =>
          q.id === 'visit-investment' && !q.completed
            ? { ...q, progress: 1, completed: true }
            : q
        )
      }, { merge: true });
      setJewelsBalance(jewelsBalance + jewelAmount);
      setQuests(prev =>
        prev.map(q =>
          q.id === 'visit-investment' && !q.completed
            ? { ...q, progress: 1, completed: true }
            : q
        )
      );
      investAudioRef.current?.play();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      alert(`Successfully invested ${amount} USDT (${jewelAmount} JEWELS)! Admin will process payout using your address: ${address}.`);
    } catch (err) {
      console.error('Investment error:', err);
      alert('Failed to submit investment. Please try again.');
    }
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden">
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
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Tokenomics
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              A sustainable economy powered by purpose, not speculation. Your contributions fuel rewards, secured by smart contracts.
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
                    if (!isConnected) {
                      openConnectModal();
                    } else {
                      alert('Wallet already connected!');
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  aria-label="Join the Economy"
                >
                  {isConnected ? 'Wallet Connected' : 'Join the Economy'}
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </motion.div>

        {/* Daily Quests */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-cyan-500/10 to-blue-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <Target className="w-8 h-8 text-cyan-400 animate-pulse" /> Daily Quests
              </h3>
              <p className="text-gray-300">Complete tasks to earn JEWELS and XP!</p>
              <div className="space-y-4">
                {quests.map(quest => (
                  <div key={quest.id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{quest.title}</p>
                      <p className="text-sm text-gray-400">
                        Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
                      </p>
                      <div className="w-32 bg-gray-900 rounded-full h-2 mt-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full"
                          style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                        />
                      </div>
                    </div>
                    <motion.button
                      className={`px-4 py-2 rounded-lg font-semibold ${quest.progress >= quest.goal && !quest.completed ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                      onClick={() => handleClaimQuest(quest.id)}
                      disabled={quest.completed || quest.progress < quest.goal}
                      whileHover={{ scale: quest.progress >= quest.goal && !quest.completed ? 1.05 : 1 }}
                      aria-label={`Claim ${quest.title} reward`}
                    >
                      {quest.completed ? 'Claimed' : 'Claim'}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Energy Node */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-6 text-center">
              <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> Energy Node
              </h3>
              <p className="text-2xl text-gray-300">JEWELS: {jewelsBalance} 💎</p>
              <motion.canvas
                ref={nodeRef}
                className="mx-auto cursor-pointer"
                width={100}
                height={100}
                onClick={handleNodeClick}
                variants={nodeClickVariants}
                animate={dailyClicks < 10 ? 'click' : undefined}
                role="button"
                aria-label="Collect JEWELS from Energy Node"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNodeClick()}
              />
              <p className="text-sm text-gray-400">
                {dailyClicks < 10 ? `${10 - dailyClicks} clicks left today` : 'Come back tomorrow!'}
              </p>
              <p className="text-lg text-rose-300">
                Click the Energy Node to collect JEWELS and power your Petaverse journey.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Tokenomics Features */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left"
        >
          {tokenData.map((token, i) => (
            <Card key={i} gradient="from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center mb-4 text-rose-400">
                <img
                  src={token.icon}
                  alt={token.title}
                  className="w-8 h-8 mr-3 rounded-md animate-pulse"
                  onError={(e) => { e.currentTarget.src = '/fallback-icon.png'; }}
                />
                <h4 className="text-xl font-bold">{token.title}</h4>
              </div>
              <p className="text-gray-300 text-sm">{token.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Token Allocation Chart */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Token Allocation
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Transparent distribution fuels rewards, growth, and education in the Swytch ecosystem.
          </p>
          <div role="img" aria-label="Token Allocation Pie Chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#ccc' }}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #00FFFF', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Global Gaming Industry Growth Chart */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Gift className="w-8 h-8 text-teal-400 animate-pulse" /> Gaming Industry Growth ($B)
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Swytch taps into the booming global gaming market, projected to grow exponentially.
          </p>
          <div role="img" aria-label="Gaming Industry Growth Bar Chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #00FFFF', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#00FFFF" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-pink-400 animate-pulse" /> Mini-Leaderboard
              </h3>
              <p className="text-gray-300">See who’s leading the Petaverse economy!</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="p-2">Rank</th>
                      <th className="p-2">Player</th>
                      <th className="p-2">Level</th>
                      <th className="p-2">JEWELS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="p-2 text-white">{i + 1}</td>
                        <td className="p-2 text-white">{entry.name}</td>
                        <td className="p-2 text-gray-300">{entry.level}</td>
                        <td className="p-2 text-gray-300">{entry.jewels.toLocaleString()} JEWELS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-cyan-500/10 to-blue-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <Award className="w-8 h-8 text-cyan-400 animate-pulse" /> Achievements
              </h3>
              <p className="text-gray-300">Earn milestones to show your economic mastery!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievementsState.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${achievement.unlocked ? 'border-cyan-500 bg-gray-800/50' : 'border-gray-600 opacity-50'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Award className={`w-6 h-6 ${achievement.unlocked ? 'text-cyan-400' : 'text-gray-400'}`} />
                      <p className="text-white font-semibold">{achievement.title}</p>
                    </div>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400 animate-pulse" /> Real Impact Stories
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            PETs worldwide are transforming their financial futures with Swytch.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} gradient="from-yellow-500/10 to-orange-500/10">
                <p className="text-gray-300 italic mb-2">"{testimonial.quote}"</p>
                <p className="text-yellow-400 font-bold">— {testimonial.author}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-400 animate-pulse" /> Tokenomics FAQ
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Get answers to the most common questions about Swytch’s economic model.
          </p>
          <div className="max-w-3xl mx-auto text-left space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  className="w-full flex justify-between items-center text-left"
                  onClick={() => handleFaqToggle(i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <h4 className="text-lg text-cyan-300 font-semibold">Q: {faq.question}</h4>
                  <ChevronDown className={`w-6 h-6 text-cyan-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p
                      id={`faq-answer-${i}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-gray-300 mt-2"
                    >
                      A: {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Donation & Investment */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Gift className="w-8 h-8 text-teal-400 animate-pulse" /> Back the Petaverse
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Support Swytch’s decentralized future and unlock early backer rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              <img
                src="/qr_donation.png"
                alt="Donate to Swytch"
                className="w-40 h-40 rounded-lg border border-rose-500/30"
                onError={(e) => { e.currentTarget.src = '/fallback-qr.png'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent rounded-lg" />
            </motion.div>
            <motion.form
              className="relative bg-gray-900/60 p-6 max-w-xl w-full rounded-xl border border-rose-500/20 backdrop-blur-md space-y-4"
              whileHover={{ scale: 1.03 }}
              onSubmit={handleInvestmentSubmit}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl" />
              <div className="relative">
                <h4 className="text-rose-400 font-bold text-xl mb-2">Invest in Swytch</h4>
                <input
                  type="text"
                  placeholder="Your Wallet Address"
                  className="w-full p-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                  value={address || ''}
                  disabled
                  aria-label="Wallet Address"
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount in USDT"
                  className="w-full p-3 mt-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                  aria-label="Investment Amount in USDT"
                  min="0"
                  step="0.01"
                />
                <motion.button
                  type="submit"
                  className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  aria-label="Submit Investment"
                >
                  Submit Investment
                </motion.button>
              </div>
            </motion.form>
          </div>
        </motion.div>

        {/* Earnings Projection */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6 text-center"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> Your Potential
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Deposit <span className="text-rose-400 font-semibold">$100</span> at <span className="text-rose-400 font-semibold">3.3% monthly</span>...
          </p>
          <p className="text-2xl font-bold text-rose-400">
            Grow to ≈ ${earningsYearly.toFixed(2)} by year’s end!
          </p>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-rose-300 italic text-center max-w-xl mx-auto"
        >
          Note: Swytch’s tokenomics align with PMA principles and decentralized trust. Always self-custody. Always opt-in.
        </motion.div>
      </motion.div>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <Modal title="Connect to Swytch" onClose={() => setShowWalletModal(false)}>
            <div className="space-y-4">
              <ConnectButton
                label="Connect Wallet"
                showBalance={false}
                accountStatus="address"
                chainStatus="none"
              />
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
      <audio ref={clickAudioRef} src="/audio/click.mp3" preload="auto" />
      <audio ref={rewardAudioRef} src="/audio/reward.mp3" preload="auto" />
      <audio ref={investAudioRef} src="/audio/invest.mp3" preload="auto" />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .blur-3xl { filter: blur(64px); }
        .blur-2xl { filter: blur(32px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUkqVJutxuNRqMhSRJpmkYkSVKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJutxuNRqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TqCRZQqlUKqlaVSqlUKqVqlaKQlJ/kfgBQUzS2f8eAAAAAElFTkSuQmCC');
        }
        input:focus, button:focus {
          outline: none;
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

export default Tokenomics;