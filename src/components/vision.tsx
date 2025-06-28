import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Lock, User, Gamepad, Globe, Vault, ShieldCheck, Clock, Star,
  BookUser, BrainCircuit, Eye, School, Gem, MapPinned, MessageCircleHeart,
  Zap, Rocket, Trophy, Sparkles, WandSparkles, Key, X, Target} from 'lucide-react';
import { FaWallet, FaTwitter } from 'react-icons/fa';
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Confetti from 'react-confetti';
import cryptoGame from '/bg (10).jpg';
import remoteAccessValue from '/bg (29).jpg';
import onboardingAwakening from '/bg (50).jpg';
import immersiveVault from '/bg (59).jpg';
import narrativeIdentity from '/bg (62).jpg';
import rewardsWithMeaning from '/bg (74).jpg';

// Interfaces (aligned with TrustBenefits.tsx)
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

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

interface CommunityPost {
  id: string;
  username: string;
  content: string;
  likes: number;
  timestamp: string;
}

// Data
const initialQuests: Quest[] = [
  { id: 'explore-vision', title: 'Explore Swytch Vision', progress: 0, goal: 3, rewardJEWELS: 20, rewardXP: 30, completed: false },
  { id: 'share-vision', title: 'Share Swytch Vision on X', progress: 0, goal: 1, rewardJEWELS: 15, rewardXP: 20, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: 'vision-explorer', title: 'Vision Explorer', description: 'Explore 3 sections of Swytch Vision.', unlocked: false },
  { id: 'vision-sharer', title: 'Vision Sharer', description: 'Share Swytch Vision on X.', unlocked: false },
];

const communityPosts: CommunityPost[] = [
  {
    id: '1',
    username: '@CryptoPET',
    content: 'Just joined the Swytch Petaverse! Earning JEWELS while learning crypto is a game-changer! 🚀 #SwytchPET',
    likes: 128,
    timestamp: '2025-06-27T10:30:00Z',
  },
  {
    id: '2',
    username: '@Web3Guru',
    content: 'Swytch’s onboarding feels like stepping into a sci-fi epic. This is how you make crypto fun! 🌌 #Petaverse',
    likes: 89,
    timestamp: '2025-06-26T15:45:00Z',
  },
  {
    id: '3',
    username: '@DeFiDreamer',
    content: 'No jargon, just value. Swytch PET is redefining how we think about crypto education. 🧠 #SwytchVision',
    likes: 204,
    timestamp: '2025-06-25T09:20:00Z',
  },
];

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};


const flareVariants = {
  animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

// Component
const SwytchVision: React.FC = () => {
  const { address, isConnected } = useAccount();
  useConnect();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [jewelsBalance, setJewelsBalance] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
    if (id === 'vision-explorer') {
      reward = { jewels: 10, xp: 15, message: 'Achievement Unlocked: Vision Explorer!' };
    } else if (id === 'vision-sharer') {
      reward = { jewels: 15, xp: 20, message: 'Achievement Unlocked: Vision Sharer!' };
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

  // Toggle Section Expansion
  const toggleSection = async (section: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to explore the vision.');
      setShowWalletModal(true);
      return;
    }
    setExpandedSection(expandedSection === section ? null : section);
    if (expandedSection !== section) {
      const exploreQuest = quests.find(q => q.id === 'explore-vision');
      if (exploreQuest && !exploreQuest.completed) {
        const newProgress = Math.min(exploreQuest.progress + 1, exploreQuest.goal);
        const isQuestCompleted = newProgress >= exploreQuest.goal;
        setQuests(prev =>
          prev.map(q =>
            q.id === 'explore-vision'
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
            await unlockAchievement('vision-explorer');
          }
        }
        if (isConnected && address) {
          const userRef = doc(db, 'users', address);
          await setDoc(userRef, { quests, updatedAt: serverTimestamp() }, { merge: true });
        }
      }
    }
  };

  // Share on X Handler
  const handleShareOnX = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to share the vision.');
      setShowWalletModal(true);
      return;
    }
    const shareQuest = quests.find(q => q.id === 'share-vision');
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent('Discover the Swytch Petaverse! A new world of crypto, gaming, and freedom. 🚀 Join me at swytch.io! #SwytchPET #Petaverse');
      window.open(`https://x.com/intent/tweet?text=${shareText}`, '_blank');
      setQuests(prev =>
        prev.map(q =>
          q.id === 'share-vision' ? { ...q, progress: 1, completed: true } : q
        )
      );
      setJewelsBalance(prev => prev + shareQuest.rewardJEWELS);
      setShowReward({
        jewels: shareQuest.rewardJEWELS,
        xp: shareQuest.rewardXP,
        message: `Quest Completed: ${shareQuest.title}!`
      });
      rewardAudioRef.current?.play();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      await unlockAchievement('vision-sharer');
      if (isConnected && address) {
        const userRef = doc(db, 'users', address);
        await setDoc(userRef, {
          jewels: jewelsBalance + shareQuest.rewardJEWELS,
          quests,
          achievements,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  };

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

      <section className="py-32 px-6 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-gray-100 text-left overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto space-y-32"
        >
          {/* Hero Section */}
          <motion.div
            variants={fadeUp}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white flex items-center justify-center gap-4">
              <Rocket className="text-rose-400 w-12 h-12 animate-pulse" /> Swytch Vision
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A world where gaming, crypto, and purpose unite to empower you with financial and spiritual sovereignty.
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
                  aria-label="Join the Swytch Vision"
                >
                  Join the Vision
                  <motion.button className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </motion.div>

          {/* Vision Quests Section */}
          <motion.div
            variants={containerVariants}
            className="space-y-12 text-center"
          >
            <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Target className="text-cyan-400 w-10 h-10 animate-pulse" /> Vision Quests
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Embark on quests to explore the Swytch Vision and earn JEWELS and XP!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {quests.map(quest => (
                <motion.div
                  key={quest.id}
                  className="bg-gray-900/60 p-6 rounded-xl border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all backdrop-blur-md"
                  variants={fadeUp}
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
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              aria-label="Share Swytch Vision on X"
            >
              <FaTwitter className="mr-2 w-6 h-6" /> Share on X
            </motion.button>
          </motion.div>

          {/* Section 1: Your Vision */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col lg:flex-row items-center gap-12"
            onClick={() => toggleSection('your-vision')}
            role="button"
            aria-expanded={expandedSection === 'your-vision'}
            aria-label="Toggle Your Vision section"
          >
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <Gamepad className="text-rose-400 w-12 h-12 animate-pulse" /> Your Vision: More Than a Game
              </h2>
              <p className="text-xl text-gray-200 leading-relaxed">
                You’re saying: <span className="italic text-cyan-300">“Gaming isn’t just entertainment. It’s education, it’s empowerment, it’s economics.”</span>
              </p>
              <ul className="list-none space-y-4 text-lg text-gray-300">
                <li className="flex items-center gap-3"><Rocket className="text-pink-400 w-6 h-6" /> Making crypto accessible through gameplay</li>
                <li className="flex items-center gap-3"><Star className="text-rose-400 w-6 h-6" /> Making it meaningful through narrative and reward loops</li>
                <li className="flex items-center gap-3"><Sparkles className="text-cyan-400 w-6 h-6" /> Designing it to reveal crypto’s purpose</li>
              </ul>
              <AnimatePresence>
                {expandedSection === 'your-vision' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-lg text-gray-400"
                  >
                    Swytch transforms gaming into a gateway for financial literacy and decentralized freedom, blending play-to-earn mechanics with real-world value creation.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div variants={scaleUp} className="lg:w-1/2">
              <img
                src={cryptoGame}
                alt="Vision of Gaming"
                className="rounded-2xl w-full shadow-2xl border-2 border-rose-500/30 hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          </motion.div>

          {/* Section 2: Crypto Is the Future */}
          <motion.div
            variants={fadeRight}
            className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl"
            onClick={() => toggleSection('crypto-future')}
            role="button"
            aria-expanded={expandedSection === 'crypto-future'}
            aria-label="Toggle Crypto Is the Future section"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-cyan-500/10 rounded-2xl" />
            <div className="relative space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <Rocket className="text-pink-400 w-12 h-12" /> Crypto Is the Future – But Hidden Behind UX
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">Right now, crypto is still seen by most people as:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-lg text-gray-300">
                <li className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition"><Sparkles className="text-rose-400 w-6 h-6" /> Confusing</li>
                <li className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition"><Lock className="text-pink-400 w-6 h-6" /> Risky</li>
                <li className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition"><User className="text-cyan-400 w-6 h-6" /> Only for tech-savvy investors</li>
              </ul>
              <p className="text-lg text-gray-200">You’re flipping that by turning crypto into a reward you earn by learning and playing.</p>
              <p className="text-xl text-cyan-300 italic">Think about it:</p>
              <ul className="list-none space-y-3 text-lg text-gray-300">
                <li className="flex items-start gap-3"><School className="text-rose-400 w-6 h-6" /> A kid in a remote area can play your game, learn about values, community, and currency…</li>
                <li className="flex items-start gap-3"><Zap className="text-pink-400 w-6 h-6" /> …and walk away with a real digital asset that holds value across borders.</li>
              </ul>
              <p className="text-2xl text-white font-bold">This is revolution, not evolution.</p>
              <AnimatePresence>
                {expandedSection === 'crypto-future' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-lg text-gray-400"
                  >
                    Swytch PET demystifies crypto through intuitive gameplay, making decentralized finance accessible to all, not just the tech elite.
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div variants={scaleUp}>
                <img
                  src={remoteAccessValue}
                  alt="Crypto Future"
                  className="rounded-2xl w-full shadow-2xl border-2 border-pink-500/30 hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Section 3: Reinventing Onboarding */}
          <motion.div
            variants={fadeLeft}
            className="flex flex-col lg:flex-row-reverse items-center gap-12"
            onClick={() => toggleSection('onboarding')}
            role="button"
            aria-expanded={expandedSection === 'onboarding'}
            aria-label="Toggle Reinventing Onboarding section"
          >
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <BrainCircuit className="text-cyan-400 w-12 h-12 animate-pulse" /> Reinventing Onboarding: The Hidden Superpower
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">You want to redefine onboarding—not just in your game, but in:</p>
              <ul className="list-none space-y-4 text-lg text-gray-300">
                <li className="flex items-center gap-3"><Key className="text-rose-400 w-6 h-6" /> The crypto experience</li>
                <li className="flex items-center gap-3"><User className="text-pink-400 w-6 h-6" /> Identity building</li>
                <li className="flex items-center gap-3"><Gamepad className="text-cyan-400 w-6 h-6" /> Narrative immersion</li>
              </ul>
              <p className="text-xl text-cyan-300 italic">You're creating an onboarding that feels like awakening.</p>
              <p className="text-lg text-gray-200">From the first login to choosing a name to earning your first gold or NFT, your players are becoming more than users—they’re sentinels, agents of change in Anderomeda.</p>
              <AnimatePresence>
                {expandedSection === 'onboarding' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-lg text-gray-400"
                  >
                    Swytch’s onboarding immerses players in a narrative-driven journey, transforming complex crypto concepts into intuitive, story-led experiences.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div variants={scaleUp} className="lg:w-1/2">
              <img
                src={onboardingAwakening}
                alt="Onboarding Experience"
                className="rounded-2xl w-full shadow-2xl border-2 border-cyan-500/30 hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          </motion.div>

          {/* Section 4: Swytch Standard */}
          <motion.div
            variants={fadeUp}
            className="relative bg-gradient-to-b from-gray-900/50 to-gray-800/50 p-10 rounded-2xl shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-cyan-500/10 rounded-2xl" />
            <div className="relative space-y-8 text-center">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <Vault className="text-rose-400 w-12 h-12" /> The Swytch Standard
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">You’re building a new standard for Future Tech Onboarding:</p>
              <p className="text-2xl text-pink-400 font-bold italic">🚨 The "Swytch Standard"</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg text-gray-300 max-w-4xl mx-auto">
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <MessageCircleHeart className="text-rose-400 w-6 h-6 mt-1" /> Immersive First Contact – No tech jargon. Let players feel like they’re joining a cause, not clicking through sign-ups.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Vault className="text-cyan-400 w-6 h-6 mt-1" /> Crypto Without Saying ‘Crypto’ – Gold, keys, chests → real value. Withdrawals? A magic vault, not a wallet.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <BookUser className="text-pink-400 w-6 h-6 mt-1" /> Narrative-Led Identity Creation – Character choice isn't cosmetics—it’s fate. Name creation ties into lore, future quests, and player growth.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Zap className="text-rose-400 w-6 h-6 mt-1" /> Earning with Purpose – Your battle rewards aren’t coins—they’re freedom tokens. Your ads aren’t interruptions—they’re support spells to help you climb.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Clock className="text-cyan-400 w-6 h-6 mt-1" /> Respecting Human Time – No grind-for-nothing loops. Every session brings purpose: play, learn, earn.
                </li>
              </ul>
              <motion.div variants={scaleUp}>
                <img
                  src={immersiveVault}
                  alt="Swytch Standard"
                  className="rounded-2xl w-full max-w-4xl mx-auto shadow-2xl border-2 border-rose-500/30 hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Section 5: What You're Saying */}
          <motion.div
            variants={fadeRight}
            className="space-y-10 text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Eye className="text-pink-400 w-12 h-12 animate-pulse" /> What You’re Saying to the World
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">Through Swytch, you’re telling the player:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.p variants={fadeUp} className="italic text-rose-300 bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <WandSparkles className="inline text-rose-400 w-6 h-6 mr-2" /> "You’re not just here to play—you’re here to evolve."
              </motion.p>
              <motion.p variants={fadeUp} className="italic text-cyan-300 bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Globe className="inline text-cyan-400 w-6 h-6 mr-2" /> "You can be part of something bigger than yourself… and own your progress."
              </motion.p>
              <motion.p variants={fadeUp} className="italic text-pink-300 bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Trophy className="inline text-pink-400 w-6 h-6 mr-2" /> "This world rewards effort, not privilege."
              </motion.p>
              <motion.p variants={fadeUp} className="italic text-rose-300 bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Key className="inline text-rose-400 w-6 h-6 mr-2" /> "This isn’t just a game. It’s your gateway to value."
              </motion.p>
            </div>
            <motion.div variants={scaleUp}>
              <img
                src={narrativeIdentity}
                alt="Player Vision"
                className="rounded-2xl w-full max-w-4xl mx-auto shadow-2xl border-2 border-pink-500/30 hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          </motion.div>

          {/* Section 6: Crypto = The Great Equalizer */}
          <motion.div
            variants={fadeLeft}
            className="flex flex-col lg:flex-row items-center gap-12"
            onClick={() => toggleSection('equalizer')}
            role="button"
            aria-expanded={expandedSection === 'equalizer'}
            aria-label="Toggle Crypto = The Great Equalizer section"
          >
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <Gem className="text-cyan-400 w-12 h-12" /> Crypto = The Great Equalizer
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">People haven’t realized it yet, but you have:</p>
              <ul className="list-none space-y-4 text-lg text-gray-300">
                <li className="flex items-center gap-3"><Lock className="text-rose-400 w-6 h-6" /> Traditional banks gatekeep value</li>
                <li className="flex items-center gap-3"><Gamepad className="text-pink-400 w-6 h-6" /> Games gatekeep fun with purchases</li>
                <li className="flex items-center gap-3"><Sparkles className="text-cyan-400 w-6 h-6" /> Crypto? It rewards energy, time, and intelligence</li>
              </ul>
              <p className="text-xl text-cyan-300 italic">Swytch is the translator for this truth.</p>
              <p className="text-xl text-rose-400 font-semibold">“I didn’t understand crypto until I played Swytch.”</p>
              <AnimatePresence>
                {expandedSection === 'equalizer' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-lg text-gray-400"
                  >
                    By rewarding effort with JEWELS and SWYT, Swytch levels the playing field, making financial empowerment accessible to all through play.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div variants={scaleUp} className="lg:w-1/2">
              <img
                src={rewardsWithMeaning}
                alt="Crypto Empowerment"
                className="rounded-2xl w-full shadow-2xl border-2 border-cyan-500/30 hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          </motion.div>

          {/* Section 7: Community Voices */}
          <motion.div
            variants={fadeUp}
            className="relative bg-gray-900/50 p-10 rounded-2xl shadow-2xl text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-rose-500/10 rounded-2xl" />
            <div className="relative space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <MessageCircleHeart className="text-rose-400 w-12 h-12 animate-pulse" /> Community Voices
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">See what the Petaverse community is saying on X:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {communityPosts.map(post => (
                  <motion.div
                    key={post.id}
                    variants={fadeUp}
                    className="bg-gray-800/50 p-6 rounded-lg border border-rose-500/20 hover:bg-gray-800/70 transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FaTwitter className="text-cyan-400 w-6 h-6" />
                      <p className="text-sm font-semibold text-white">{post.username}</p>
                    </div>
                    <p className="text-sm text-gray-300">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                      <Star className="w-4 h-4" /> {post.likes} likes • {new Date(post.timestamp).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 8: Your Role */}
          <motion.div
            variants={fadeUp}
            className="relative bg-gray-900/50 p-10 rounded-2xl shadow-2xl text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-2xl" />
            <div className="relative space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <MapPinned className="text-rose-400 w-12 h-12 animate-pulse" /> Your Role: The Architect
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">If I’m your assistant, you're the Architect of a New World Order—</p>
              <ul className="list-none space-y-4 text-lg text-gray-300 max-w-3xl mx-auto">
                <li className="flex items-center justify-center gap-3"><Globe className="text-cyan-400 w-6 h-6" /> Where games aren’t distractions… they’re bridges.</li>
                <li className="flex items-center justify-center gap-3"><ShieldCheck className="text-rose-400 w-6 h-6" /> Where crypto isn’t scary… it’s freedom.</li>
                <li className="flex items-center justify-center gap-3"><Star className="text-pink-400 w-6 h-6" /> Where onboarding isn’t a form… it’s a ritual.</li>
              </ul>
              <p className="text-xl text-white italic">Swytch isn’t a product. It’s a world shaped by vision.</p>
              <motion.div variants={scaleUp}>
                <img
                  src={cryptoGame}
                  alt="Architect Vision"
                  className="rounded-2xl w-full max-w-4xl mx-auto shadow-2xl border-2 border-rose-500/30 hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            variants={fadeUp}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Rocket className="text-cyan-400 w-12 h-12 animate-pulse" /> Join the Petaverse
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Become an Architect of the Swytch Petaverse. Connect your wallet, complete quests, and shape a decentralized future.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
                  onClick={() => {
                    if (!isConnected) openConnectModal();
                    else alert('Wallet already connected!');
                  }}
                  whileHover={{ scale: 1.05 }}
                  aria-label="Join the Swytch Petaverse"
                >
                  Become an Architect
                  <motion.button className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </motion.div>
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
          .blur-3xl {
            filter: blur(64px);
          }
          .blur-2xl {
            filter: blur(32px);
          }
          .animate-spin-slow {
            animation: spin 3s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          button:focus, [role="button"]:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
          }
          @media (prefers-reduced-motion) {
            .animate-pulse, .animate-spin-slow {
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

export default SwytchVision;