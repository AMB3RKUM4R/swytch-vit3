import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Star, ShieldCheck, Brain, BarChart2, Sparkles, Gift, BookOpen, ScrollText,
  Trophy, Flashlight, CircleDollarSign, Wallet, ArrowRight, X, Zap, Target, Users, Award
} from 'lucide-react';

// Interfaces
interface Level {
  level: number;
  title: string;
  reward: string;
  energyRequired: string;
  perks: string[];
  icon: JSX.Element;
  image: string;
}

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardSWYT: number;
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
  swyt: number;
}

interface Reward {
  swyt: number;
  xp: number;
  message: string;
}

interface SavedState {
  level: number;
  swyt: number;
  quests: Quest[];
  clicks: number;
  lastLogin: string | null;
  streak: number;
  achievements: Achievement[];
}

// Data
const levels: Level[] = [
  {
    level: 1, title: 'Initiate', reward: '1.0%', energyRequired: '100 SWYT',
    perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'],
    icon: <TrendingUp className="w-6 h-6 text-cyan-400 animate-pulse" />, image: '/bg (29).jpg'
  },
  {
    level: 2, title: 'Apprentice', reward: '1.3%', energyRequired: '250 SWYT',
    perks: ['Chatbot Assistant', 'NFT Discounts'],
    icon: <Star className="w-6 h-6 text-purple-400 animate-pulse" />, image: '/bg (28).jpg'
  },
  {
    level: 3, title: 'Seeker', reward: '1.6%', energyRequired: '500 SWYT',
    perks: ['Quest Expansion', 'PET ID Perks'],
    icon: <ScrollText className="w-6 h-6 text-amber-400 animate-pulse" />, image: '/bg (22).jpg'
  },
  {
    level: 4, title: 'Guardian', reward: '1.9%', energyRequired: '1000 SWYT',
    perks: ['Vault Yield Boost', 'Private Vault Channels'],
    icon: <ShieldCheck className="w-6 h-6 text-orange-400 animate-pulse" />, image: '/bg (6).jpg'
  },
  {
    level: 5, title: 'Sage', reward: '2.2%', energyRequired: '3000 SWYT',
    perks: ['Beta Testing Rights', 'Voting Access'],
    icon: <Brain className="w-6 h-6 text-pink-400 animate-pulse" />, image: '/bg (8).jpg'
  },
  {
    level: 6, title: 'Archon', reward: '2.5%', energyRequired: '5000 SWYT',
    perks: ['Early Launch Drops', 'DAO Incentives'],
    icon: <BarChart2 className="w-6 h-6 text-yellow-400 animate-pulse" />, image: '/bg (9).jpg'
  },
  {
    level: 7, title: 'Alchemist', reward: '2.8%', energyRequired: '7500 SWYT',
    perks: ['Smart Contract Access', 'NFT Mint Tools'],
    icon: <Flashlight className="w-6 h-6 text-violet-400 animate-pulse" />, image: '/bg (10).jpg'
  },
  {
    level: 8, title: 'Elder', reward: '3.1%', energyRequired: '9000 SWYT',
    perks: ['Legend Quests', 'Energy Bonus Boost'],
    icon: <Trophy className="w-6 h-6 text-lime-400 animate-pulse" />, image: '/bg (12).jpg'
  },
  {
    level: 9, title: 'Mythic PET', reward: '3.3%', energyRequired: '10000 SWYT',
    perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'],
    icon: <CircleDollarSign className="w-6 h-6 text-teal-400 animate-pulse" />, image: '/bg (11).jpg'
  }
];

const initialQuests: Quest[] = [
  { id: 'collect', title: 'Collect 10 SWYT from Energy Orb', progress: 0, goal: 10, rewardSWYT: 10, rewardXP: 20, completed: false },
  { id: 'view-perk', title: 'View a Level Perk', progress: 0, goal: 1, rewardSWYT: 5, rewardXP: 10, completed: false },
  { id: 'connect-wallet', title: 'Connect Your Wallet', progress: 0, goal: 1, rewardSWYT: 15, rewardXP: 30, completed: false }
];

const achievements: Achievement[] = [
  { id: 'first-login', title: 'First Login', description: 'Log in to Swytch for the first time.', unlocked: false },
  { id: 'level-2', title: 'Apprentice Reached', description: 'Reach Level 2.', unlocked: false },
  { id: 'streak-3', title: '3-Day Streak', description: 'Log in for 3 consecutive days.', unlocked: false },
  { id: 'swyt-100', title: 'Energy Collector', description: 'Collect 100 SWYT.', unlocked: false }
];

const leaderboard: LeaderboardEntry[] = [
  { name: 'QuantumPET', level: 9, swyt: 15000 },
  { name: 'StarSeeker', level: 7, swyt: 8000 },
  { name: 'VaultSage', level: 5, swyt: 4000 },
  { name: 'EnergyAlchemist', level: 4, swyt: 2000 },
  { name: 'NewInitiate', level: 1, swyt: 1000 }
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

const orbClickVariants = {
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

const LevelsIntro: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [hoveredPerk, setHoveredPerk] = useState<{ level: number; perk: string } | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [energyProgress, setEnergyProgress] = useState(50);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [dailyClicks, setDailyClicks] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [achievementsState, setAchievementsState] = useState<Achievement[]>(achievements);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [loginStreak, setLoginStreak] = useState(0);
  const orbRef = useRef<HTMLCanvasElement>(null);
  const clickAudioRef = useRef<HTMLAudioElement>(null);
  const rewardAudioRef = useRef<HTMLAudioElement>(null);

  // Local Storage Keys
  const STORAGE_KEY = 'swytch_game_state';

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    if (savedState) {
      const parsedState: SavedState = JSON.parse(savedState);
      const { level, swyt, quests, clicks, lastLogin: lastLoginFromStorage, streak, achievements } = parsedState;
      setCurrentLevel(level);
      setEnergyProgress(swyt);
      setQuests(quests);
      setDailyClicks(clicks);
      setLastLogin(lastLoginFromStorage);
      setLoginStreak(streak);
      setAchievementsState(achievements);
    } else {
      // First login achievement
      unlockAchievement('first-login');
    }

    // Handle daily reset and streak
    if (lastLogin !== today) {
      setDailyClicks(0);
      setQuests(initialQuests.map(q => ({ ...q, progress: 0, completed: false })));
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
      if (lastLogin === yesterday) {
        setLoginStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak >= 3) unlockAchievement('streak-3');
          return newStreak;
        });
      } else {
        setLoginStreak(1);
      }
      setLastLogin(today);
    }
  }, []); // Empty dependency array to run once on mount

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      level: currentLevel,
      swyt: energyProgress,
      quests,
      clicks: dailyClicks,
      lastLogin,
      streak: loginStreak,
      achievements: achievementsState
    }));
  }, [currentLevel, energyProgress, quests, dailyClicks, lastLogin, loginStreak, achievementsState]);

  // Auto-dismiss reward popup
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer); // Cleanup to prevent memory leaks
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

  // Draw Energy Orb
  useEffect(() => {
    const canvas = orbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;

    const drawOrb = () => {
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

    drawOrb();
  }, []);

  // Unlock Achievement
  const unlockAchievement = (id: string) => {
    setAchievementsState(prev =>
      prev.map(a => a.id === id && !a.unlocked ? { ...a, unlocked: true } : a)
    );
    if (id === 'level-2') {
      setShowReward({ swyt: 0, xp: 50, message: 'Achievement Unlocked: Apprentice Reached!' });
      rewardAudioRef.current?.play();
    } else if (id === 'streak-3') {
      setShowReward({ swyt: 20, xp: 30, message: 'Achievement Unlocked: 3-Day Streak!' });
      rewardAudioRef.current?.play();
    } else if (id === 'swyt-100') {
      setShowReward({ swyt: 10, xp: 20, message: 'Achievement Unlocked: Energy Collector!' });
      rewardAudioRef.current?.play();
    } else if (id === 'first-login') {
      setShowReward({ swyt: 5, xp: 10, message: 'Achievement Unlocked: First Login!' });
      rewardAudioRef.current?.play();
    }
  };

  // Handle Orb Click
  const handleOrbClick = () => {
    if (dailyClicks >= 10) {
      alert('Daily click limit reached! Come back tomorrow.');
      return;
    }

    clickAudioRef.current?.play();
    const swytGain = Math.floor(Math.random() * 3) + 1;
    setEnergyProgress(prev => {
      const newSwyt = prev + swytGain;
      if (newSwyt >= 100 && !achievementsState.find(a => a.id === 'swyt-100')?.unlocked) {
        unlockAchievement('swyt-100');
      }
      return newSwyt;
    });
    setDailyClicks(prev => prev + 1);
    setQuests(prev =>
      prev.map(q =>
        q.id === 'collect' && !q.completed
          ? { ...q, progress: Math.min(q.progress + swytGain, q.goal) }
          : q
      )
    );

    // Check level-up
    const requiredSwyt = parseInt(levels[currentLevel - 1].energyRequired);
    if (energyProgress + swytGain >= requiredSwyt && currentLevel < levels.length) {
      setCurrentLevel(prev => {
        if (prev === 1) unlockAchievement('level-2');
        return prev + 1;
      });
      setEnergyProgress(0);
      setShowReward({ swyt: 0, xp: 100, message: `Level Up! Welcome to ${levels[currentLevel].title}!` });
      rewardAudioRef.current?.play();
    }

    // Particle effect
    const canvas = orbRef.current;
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
    setEnergyProgress(prev => prev + quest.rewardSWYT);
    setShowReward({
      swyt: quest.rewardSWYT,
      xp: quest.rewardXP,
      message: `Quest Completed: ${quest.title}!`
    });
    rewardAudioRef.current?.play();
  };

  // Handle Perk Hover
  const handlePerkHover = (level: number, perk: string) => {
    setHoveredPerk({ level, perk });
    setQuests(prev =>
      prev.map(q =>
        q.id === 'view-perk' && !q.completed
          ? { ...q, progress: 1, completed: true }
          : q
      )
    );
  };

  // Handle Wallet Connect
  const handleWalletConnect = (type: string) => {
    alert(`Connecting ${type}...`);
    setShowWalletModal(false);
    setQuests(prev =>
      prev.map(q =>
        q.id === 'connect-wallet' && !q.completed
          ? { ...q, progress: 1, completed: true }
          : q
      )
    );
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden">
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
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Levels
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              Embark on a daily quest to ascend tiers, unlock epic perks, and dominate the Petaverse!
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
            >
              Start Your Quest
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Daily Quests */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-cyan-500/10 to-blue-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <Target className="w-8 h-8 text-cyan-400 animate-pulse" /> Daily Quests
              </h3>
              <p className="text-gray-300">Complete these tasks to earn SWYT and XP!</p>
              <div className="space-y-4">
                {quests.map(quest => (
                  <div key={quest.id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{quest.title}</p>
                      <p className="text-sm text-gray-400">
                        Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardSWYT} SWYT, {quest.rewardXP} XP
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
                    >
                      {quest.completed ? 'Claimed' : 'Claim'}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Progress Tracker with Energy Orb */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-6 text-center">
              <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> Your Progress
              </h3>
              <p className="text-gray-300">Level {currentLevel}: {levels[currentLevel - 1].title}</p>
              <motion.canvas
                ref={orbRef}
                className="mx-auto cursor-pointer"
                width={100}
                height={100}
                onClick={handleOrbClick}
                variants={orbClickVariants}
                animate={dailyClicks < 10 ? 'click' : undefined}
                role="button"
                aria-label="Collect SWYT from Energy Orb"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOrbClick()}
              />
              <p className="text-sm text-gray-400">
                {dailyClicks < 10 ? `${10 - dailyClicks} clicks left today` : 'Come back tomorrow!'}
              </p>
              <div className="w-full bg-gray-800 rounded-full h-4">
                <motion.div
                  className="bg-rose-500 h-4 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(energyProgress / parseInt(levels[currentLevel - 1].energyRequired)) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {energyProgress} / {levels[currentLevel - 1].energyRequired} SWYT
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Levels Grid */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-cyan-400 animate-pulse" /> Yield Tiers
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Ascend levels to unlock epic rewards and Petaverse powers.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
            {levels.map((tier, i) => (
              <motion.div
                key={tier.level}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/40 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.02, y: -10 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl" />
                <div className="relative">
                  <img
                    src={tier.image}
                    alt={tier.title}
                    className="w-full h-32 object-cover rounded-lg border border-rose-500/20 mb-4"
                  />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-500/10 rounded-full">{tier.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Level {tier.level}: {tier.title}</h4>
                      <p className="text-sm text-rose-300">+{tier.reward} Monthly Yield</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Required: <span className="text-white font-semibold">{tier.energyRequired}</span>
                  </p>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 relative">
                    {tier.perks.map((perk, j) => (
                      <li
                        key={j}
                        className="cursor-pointer hover:text-rose-300"
                        onMouseEnter={() => handlePerkHover(tier.level, perk)}
                        onMouseLeave={() => setHoveredPerk(null)}
                      >
                        {perk}
                        {hoveredPerk?.level === tier.level && hoveredPerk.perk === perk && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 bg-gray-800 border border-rose-500/20 p-2 rounded-md text-sm text-gray-300 mt-1"
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

        {/* Leaderboard */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-pink-400 animate-pulse" /> Leaderboard
              </h3>
              <p className="text-gray-300">See who’s dominating the Petaverse!</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="p-2">Rank</th>
                      <th className="p-2">Player</th>
                      <th className="p-2">Level</th>
                      <th className="p-2">SWYT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="p-2 text-white">{i + 1}</td>
                        <td className="p-2 text-white">{entry.name}</td>
                        <td className="p-2 text-gray-300">{entry.level}</td>
                        <td className="p-2 text-gray-300">{entry.swyt.toLocaleString()} SWYT</td>
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
              <p className="text-gray-300">Unlock milestones to earn rewards and glory!</p>
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

        {/* Additional Info */}
        <motion.div variants={sectionVariants} className="max-w-3xl mx-auto text-left text-gray-300 text-sm space-y-4">
          <p>
            <Sparkles className="inline w-4 h-4 text-cyan-400 mr-2 animate-pulse" /> Higher levels unlock DAO governance and game design tools.
          </p>
          <p>
            <BookOpen className="inline w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
            Wisdom from Raziel Library quests accelerates your ascent.
          </p>
          <p>
            <Gift className="inline w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
            Engage with NFTs or referrals for yield multipliers.
          </p>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={sectionVariants} className="relative text-center border-t border-rose-500/20 pt-10">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl" />
          <div className="relative space-y-6">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-pink-400 animate-pulse" /> New to Swytch?
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Start with $50 to claim your PET identity and begin your quest!
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
            >
              Begin Earning
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-rose-400 italic text-center max-w-2xl mx-auto"
        >
          🧠 Your rank evolves daily through quests and gameplay. Emit more Energy!
        </motion.div>

        {/* Wallet Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <Modal title="Connect to Swytch" onClose={() => setShowWalletModal(false)}>
              <div className="space-y-4">
                <motion.button
                  className="w-full p-3 bg-rose-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWalletConnect('MetaMask')}
                >
                  <Wallet className="w-5 h-5" /> Connect MetaMask
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWalletConnect('WalletConnect')}
                >
                  <Wallet className="w-5 h-5" /> Connect WalletConnect
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWalletConnect('New Wallet')}
                >
                  <Wallet className="w-5 h-5" /> Generate Wallet
                </motion.button>
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
                  <p className="text-sm text-gray-300">+{showReward.swyt} SWYT, +{showReward.xp} XP</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio */}
        <audio ref={clickAudioRef} src="/audio/click.mp3" preload="auto" />
        <audio ref={rewardAudioRef} src="/audio/reward.mp3" preload="auto" />
      </motion.div>

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

export default LevelsIntro;