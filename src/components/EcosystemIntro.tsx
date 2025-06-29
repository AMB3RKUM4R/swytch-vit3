import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  X, Rocket, KeyRound, Terminal, ShieldCheck, Coins, Flame, Workflow, BadgeCheck, Eye, BarChart3, HelpCircle, UserCheck,
  Sparkles, Zap, Bot, ArrowRight, MessageCircle, Vote, Trophy, Send
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUser } from '@/hooks/useAuthUser';
import Confetti from 'react-confetti';

// Interfaces
interface EcosystemSection {
  title: string;
  description: string;
  icon: JSX.Element;
  image: string;
  modal: string;
}

interface Metric {
  label: string;
  value: string;
  icon: JSX.Element;
}

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  jewels: number;
  level: string;
  avatar: string;
}

// Data
const ecosystemSections: EcosystemSection[] = [
  {
    title: "Your Vision: More Than a Game",
    description: "Swytch redefines gaming as a portal to education, empowerment, and decentralized wealth.",
    icon: <Rocket className="text-rose-500 w-6 h-6 animate-pulse" />,
    image: '/bg (123).jpg',
    modal: "Gaming transcends entertainment. Swytch turns players into income beneficiaries with crypto-backed rewards."
  },
  {
    title: "Reinventing Onboarding",
    description: "Onboarding forges PET identities and multi-chain access, seamlessly entering the Swytch ecosystem.",
    icon: <KeyRound className="text-pink-500 w-6 h-6 animate-pulse" />,
    image: '/bg (107).jpg',
    modal: "Your PET identity secures rights under PMA principles, connecting you to decentralized value."
  },
  {
    title: "Narrative-Led Identity Creation",
    description: "Your PET evolves through quests, education, and trust-building, shaping your destiny.",
    icon: <Terminal className="text-cyan-500 w-6 h-6 animate-pulse" />,
    image: '/bg (113).jpg',
    modal: "Become an Oracle, Rebel, or Alchemist, unlocking NFTs, perks, and governance power."
  },
  {
    title: "The PET Omertà",
    description: "Swytch’s code of trust ensures PETs control their vaults and rewards.",
    icon: <ShieldCheck className="text-rose-500 w-6 h-6 animate-pulse" />,
    image: '/bg (28).jpg',
    modal: "The PET Omertà offers private arbitration and PMA-backed rights for decentralized freedom."
  },
  {
    title: "Crypto Without Saying ‘Crypto’",
    description: "Gold, chests, keys = wealth. Swytch simplifies crypto with intuitive metaphors.",
    icon: <Coins className="text-pink-500 w-6 h-6 animate-pulse" />,
    image: '/bg (117).jpg',
    modal: "Treasure chests let players build wealth effortlessly, with full wallet control."
  },
  {
    title: "A New Standard: The Swytch Protocol",
    description: "Swytch invites you to a new dimension of ownership and evolution.",
    icon: <Flame className="text-cyan-500 w-6 h-6 animate-pulse" />,
    image: '/bg (117).jpg',
    modal: "The Swytch Protocol blends law, rights, yield, and game theory for a revolutionary ecosystem."
  },
  {
    title: "How It All Connects",
    description: "Navigate the Swytch lifecycle: gameplay, vaults, tokens, and AI orchestration.",
    icon: <Workflow className="text-rose-500 w-6 h-6 animate-pulse" />,
    image: '/bg (109).jpg',
    modal: "Earn JEWELS, convert to SWYT, stake for levels, access vaults—powered by DAO."
  },
  {
    title: "Vault Access",
    description: "$10 unlocks your Swytch Wallet, granting a PET ID and first mission.",
    icon: <BadgeCheck className="text-pink-500 w-6 h-6 animate-pulse" />,
    image: '/bg (117).jpg',
    modal: "Verified PETs access vaults, quests, NFTs, and education with full key custody."
  },
  {
    title: "Support Spells",
    description: "Optional ads reward tokens and PET yield boosts.",
    icon: <Eye className="text-cyan-500 w-6 h-6 animate-pulse" />,
    image: '/bg (123).jpg',
    modal: "Opt-in spells transform time into tokens to amplify vault earnings."
  },
  {
    title: "Ecosystem Metrics & Growth",
    description: "Track Swytch’s expansion: adoption, APY, DAO votes, and more.",
    icon: <BarChart3 className="text-rose-500 w-6 h-6 animate-pulse" />,
    image: '/bg (28).jpg',
    modal: "On-chain data fuels progress, transparent and accessible to PETs."
  },
  {
    title: "FAQ & Truth Panel",
    description: "The Truth Panel answers questions with AI, human wisdom, and DAO knowledge.",
    icon: <HelpCircle className="text-pink-500 w-6 h-6 animate-pulse" />,
    image: '/bg (28).jpg',
    modal: "Our AI NPC draws from trust law and PET consensus. Ask anything."
  },
  {
    title: "Sentinel Evolution",
    description: "Choose your path: Oracle, Rebel, Architect, Guardian.",
    icon: <UserCheck className="text-cyan-500 w-6 h-6 animate-pulse" />,
    image: '/bg (107).jpg',
    modal: "Your class upgrades vaults, yields, and perks as you evolve."
  }
];

const metricsData: Metric[] = [
  { label: 'Active PETs', value: '1,234', icon: <UserCheck className="w-6 h-6 text-rose-500" /> },
  { label: 'Vault Yields', value: '3.3% APY', icon: <Coins className="w-6 h-6 text-pink-500" /> },
  { label: 'DAO Votes', value: '567', icon: <BarChart3 className="w-6 h-6 text-cyan-500" /> },
  { label: 'JEWELS Earned', value: '89,012', icon: <Sparkles className="w-6 h-6 text-rose-500" /> },
];

const chatMessages: ChatMessage[] = [
  { id: 1, user: 'AstraRebel', avatar: '/avatar1.jpg', message: 'Just joined the Petaverse—how do I earn JEWELS?', timestamp: '10:15 AM' },
  { id: 2, user: 'NovaGuardian', avatar: '/avatar3.jpg', message: 'Check out the quests in Vault Access!', timestamp: '10:18 AM' },
  { id: 3, user: 'QuantumSage', avatar: '/avatar2.jpg', message: 'The Truth Panel is dope for noobs.', timestamp: '10:20 AM' },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'AstraRebel', jewels: 15000, level: 'Mythic PET', avatar: '/avatar1.jpg' },
  { rank: 2, name: 'QuantumSage', jewels: 12000, level: 'Elder', avatar: '/avatar2.jpg' },
  { rank: 3, name: 'NovaGuardian', jewels: 9000, level: 'Alchemist', avatar: '/avatar3.jpg' },
  { rank: 4, name: 'CipherOracle', jewels: 7000, level: 'Archon', avatar: '/avatar4.jpg' },
  { rank: 5, name: 'LunarSeeker', jewels: 5000, level: 'Sage', avatar: '/avatar5.jpg' },
];

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

const flareVariants = {
  animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

const textVariants = {
  animate: {
    y: [0, -10, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

// Throttle function
const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  return (...args: any[]) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Components
const AnimatedText = ({ text }: { text: string }) => (
  <motion.div
    className="text-gray-100 text-base font-medium text-center p-4 leading-relaxed"
    variants={textVariants}
    animate="animate"
  >
    {text}
  </motion.div>
);

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
        className="bg-gray-900/50 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-md"
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

const EcosystemIntro: React.FC = () => {
  const { user, loading: authLoading } = useAuthUser();
  const { address, isConnected } = useAccount();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [truthQuery, setTruthQuery] = useState('');
  const [truthResponse, setTruthResponse] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [chatMessage, setChatMessage] = useState('');
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', category: 'Quests' });
  const [rankFilter, setRankFilter] = useState<'all' | 'jewels' | 'level'>('all');
  const [jewels, setJewels] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // User ID (wallet address or Firebase UID)
  const userId = isConnected && address ? address : user?.uid;

  // Fetch JEWELS balance
  useEffect(() => {
    const fetchJewels = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
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
  }, [userId]);

  // Throttled mouse move for lens flares
  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }, 100);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  // Simulated AI Truth Panel response
  const handleTruthQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please connect your wallet or log in to use the Truth Panel.');
      setShowWalletModal(true);
      return;
    }
    if (truthQuery.trim()) {
      const audio = new Audio('/audio/truth.mp3');
      audio.play().catch((err) => console.error('Audio playback failed:', err));
      setTruthResponse(`AI Response: Your query "${truthQuery}" is processed by the Truth Panel. Explore the Petaverse for more insights!`);
      setTruthQuery('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Handle chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please connect your wallet or log in to send messages.');
      setShowWalletModal(true);
      return;
    }
    if (chatMessage.trim()) {
      const audio = new Audio('/audio/chat.mp3');
      audio.play().catch((err) => console.error('Audio playback failed:', err));
      alert(`Message sent: ${chatMessage}`);
      setChatMessage('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Handle proposal submission
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please connect your wallet or log in to submit a proposal.');
      setShowWalletModal(true);
      return;
    }
    if (jewels < 500) {
      alert('You need at least 500 JEWELS to submit a proposal.');
      return;
    }
    if (proposalForm.title.trim() && proposalForm.description.trim()) {
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { jewels: jewels - 500, updatedAt: serverTimestamp() }, { merge: true });
        setJewels(jewels - 500);
        const audio = new Audio('/audio/proposal.mp3');
        audio.play().catch((err) => console.error('Audio playback failed:', err));
        setShowConfetti(true);
        alert(`Proposal submitted: ${proposalForm.title}`);
        setProposalForm({ title: '', description: '', category: 'Quests' });
        setTimeout(() => setShowConfetti(false), 3000);
      } catch (err) {
        console.error('Proposal submission error:', err);
        alert('Failed to submit proposal. Please try again.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  // Filter and sort rankings
  const filteredRankings = [...leaderboard].sort((a, b) => {
    if (rankFilter === 'jewels') return b.jewels - a.jewels;
    if (rankFilter === 'level') {
      const levels = ['Mythic PET', 'Elder', 'Alchemist', 'Archon', 'Sage'];
      return levels.indexOf(a.level) - levels.indexOf(b.level);
    }
    return a.rank - b.rank;
  });

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-gray-100 overflow-hidden min-h-screen">
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
          className="relative text-center bg-gray-900/50 glass rounded-3xl p-12 border border-rose-500/20 shadow-2xl hover:shadow-rose-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/60 to-pink-500/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-500 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-pink-500 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Command Hub
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              The AI-orchestrated heart of the Petaverse, where education, identity, and wealth converge.
            </p>
            {userId && (
              <p className="text-gray-300 text-center">
                Your JEWELS: <span className="font-bold text-rose-400">{jewels} JEWELS</span>
              </p>
            )}
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
            >
              Enter the Petaverse
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Metrics Dashboard */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-100 flex items-center justify-center gap-3">
                <BarChart3 className="w-8 h-8 text-rose-500 animate-pulse" /> Ecosystem Metrics
              </h3>
              <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
                Real-time insights into Swytch’s growth, powered by on-chain data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsData.map((metric, i) => (
                  <motion.div
                    key={i}
                    className="bg-gray-800/50 p-4 rounded-lg border border-rose-500/20 glass flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="p-2 bg-rose-500/10 rounded-full">{metric.icon}</div>
                    <div>
                      <p className="text-sm text-gray-300">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-100">{metric.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Ecosystem Sections */}
        <motion.div variants={sectionVariants} className="space-y-16">
          <h3 className="text-3xl font-bold text-gray-100 flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-rose-500 animate-pulse" /> The Swytch Ecosystem
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Explore the interconnected layers of Swytch, orchestrated by AI and driven by PETs.
          </p>
          {ecosystemSections.map((item, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-rose-400">
                  {item.icon}
                  <span className="text-lg font-semibold text-gray-100">{item.title}</span>
                </div>
                <p className="text-gray-300 text-lg">{item.description}</p>
                <motion.button
                  onClick={() => setActiveModal(item.title)}
                  className="text-rose-400 hover:text-pink-500 mt-4 underline text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  Learn More
                </motion.button>
                <div className="relative rounded-xl overflow-hidden h-[200px] bg-gray-800/50 p-4">
                  <AnimatedText text={item.modal} />
                  <noscript>
                    <p className="text-gray-300 text-sm p-4">{item.modal}</p>
                  </noscript>
                </div>
              </div>
              <motion.img
                src={item.image}
                alt={item.title}
                className="rounded-xl shadow-lg w-full max-h-[300px] object-cover"
                whileHover={{ scale: 1.05 }}
                onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Truth Panel Chatbot */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-100 flex items-center justify-center gap-3">
                <Bot className="w-8 h-8 text-rose-500 animate-pulse" /> Truth Panel
              </h3>
              <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
                Ask the AI-driven Truth Panel about Swytch, powered by protocol rules and DAO consensus.
              </p>
              <form onSubmit={handleTruthQuery} className="max-w-xl mx-auto space-y-4">
                <input
                  type="text"
                  value={truthQuery}
                  onChange={(e) => setTruthQuery(e.target.value)}
                  placeholder="Ask about Swytch, PETs, or the Protocol..."
                  className="w-full p-3 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-rose-500"
                  aria-label="Truth Panel query"
                  disabled={authLoading}
                />
                <motion.button
                  type="submit"
                  className="w-full py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  disabled={authLoading}
                >
                  Submit Query
                </motion.button>
              </form>
              {truthResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-300 text-sm mt-4 p-4 bg-gray-800 rounded-lg border border-rose-500/20"
                >
                  {truthResponse}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Community Chat Room */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-gray-100 flex items-center justify-center gap-3">
            <MessageCircle className="text-rose-500 w-8 h-8 animate-pulse" /> PET Chat Room
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Connect with the Swytch community to discuss the Petaverse and earn JEWELS.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-4">
              <div
                ref={chatRef}
                className="h-[300px] overflow-y-auto no-scrollbar p-4 bg-gray-800/80 rounded-lg"
              >
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-start gap-3 mb-4"
                    >
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-8 h-8 rounded-full border border-rose-500/20"
                        onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
                      />
                      <div>
                        <p className="text-gray-100 font-semibold">{msg.user} <span className="text-gray-400 text-xs ml-2">{msg.timestamp}</span></p>
                        <p className="text-gray-300 text-sm">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-rose-500"
                  aria-label="Chat message"
                  disabled={authLoading}
                />
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-md flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  disabled={authLoading}
                >
                  <Send className="w-5 h-5" /> Send
                </motion.button>
              </form>
            </div>
          </Card>
        </motion.div>

        {/* Community Voting Form */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-gray-100 flex items-center justify-center gap-3">
            <Vote className="text-cyan-500 w-8 h-8 animate-pulse" /> Submit a Proposal
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Propose changes to Swytch governance or ecosystem features.
          </p>
          <Card gradient="from-cyan-500/10 to-rose-500/10">
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div>
                <label htmlFor="proposal-title" className="block text-sm font-medium text-gray-300 mb-1">
                  Proposal Title
                </label>
                <input
                  id="proposal-title"
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  placeholder="Enter proposal title"
                  className="w-full p-3 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-cyan-500"
                  required
                  aria-label="Proposal title"
                  disabled={authLoading}
                />
              </div>
              <div>
                <label htmlFor="proposal-description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="proposal-description"
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  placeholder="Describe your proposal"
                  className="w-full p-3 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-cyan-500 h-32 resize-y"
                  required
                  aria-label="Proposal description"
                  disabled={authLoading}
                />
              </div>
              <div>
                <label htmlFor="proposal-category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="proposal-category"
                  value={proposalForm.category}
                  onChange={(e) => setProposalForm({ ...proposalForm, category: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-cyan-500"
                  aria-label="Proposal category"
                  disabled={authLoading}
                >
                  <option value="Quests">Quests</option>
                  <option value="Planets">Planets</option>
                  <option value="Rewards">Rewards</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
              <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-cyan-600 text-white hover:bg-cyan-700 rounded-md font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                disabled={authLoading}
              >
                <Vote className="w-5 h-5" /> Submit Proposal
              </motion.button>
            </form>
          </Card>
        </motion.div>

        {/* Community Rankings */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-gray-100 flex items-center justify-center gap-3">
            <Trophy className="text-pink-500 w-8 h-8 animate-pulse" /> Community Rankings
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            See top PETs shaping the Petaverse.
          </p>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="flex gap-2 mb-4">
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onClick={() => setRankFilter('all')}
                whileHover={{ scale: 1.05 }}
                aria-label="Filter by all"
                disabled={authLoading}
              >
                All
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'jewels' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onClick={() => setRankFilter('jewels')}
                whileHover={{ scale: 1.05 }}
                aria-label="Filter by JEWELS"
                disabled={authLoading}
              >
                Top JEWELS
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'level' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onClick={() => setRankFilter('level')}
                whileHover={{ scale: 1.05 }}
                aria-label="Filter by level"
                disabled={authLoading}
              >
                Top Levels
              </motion.button>
            </div>
            <div className="space-y-4">
              {filteredRankings.map((pet) => (
                <motion.div
                  key={pet.rank}
                  className="flex items-center gap-4 bg-gray-800/80 p-4 rounded-lg border border-rose-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full border border-rose-500/20"
                    onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
                  />
                  <div className="flex-1">
                    <p className="text-gray-100 font-bold">#{pet.rank} {pet.name}</p>
                    <p className="text-sm text-gray-400">{pet.level}</p>
                  </div>
                  <p className="text-rose-400 font-semibold">{pet.jewels} JEWELS</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-rose-500/10 to-pink-500/10" className="text-center">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-gray-100 flex items-center justify-center gap-4">
                <Sparkles className="w-10 h-10 text-rose-500 animate-pulse" /> Join the Petaverse
              </h3>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Become a PET, unlock your vault, and shape decentralized wealth.
              </p>
              <motion.button
                className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
                onClick={() => setShowWalletModal(true)}
                whileHover={{ scale: 1.05 }}
              >
                Get Started
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Learn More Modal */}
        <AnimatePresence>
          {activeModal && (
            <Modal title={activeModal} onClose={() => setActiveModal(null)}>
              <div className="space-y-4">
                <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                  {ecosystemSections.find((d) => d.title === activeModal)?.modal}
                </p>
                <div className="rounded-lg overflow-hidden h-[200px] bg-gray-800/50 p-4">
                  <AnimatedText text={ecosystemSections.find((d) => d.title === activeModal)?.modal || ''} />
                  <noscript>
                    <p className="text-gray-300 text-sm p-4">{ecosystemSections.find((d) => d.title === activeModal)?.modal}</p>
                  </noscript>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Wallet Connection Modal */}
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .blur-3xl { filter: blur(64px); }
        .blur-2xl { filter: blur(32px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          transition: border-color 0.3s ease, ring-color 0.3s ease;
        }
        [data-animate] {
          will-change: transform, opacity;
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

export default EcosystemIntro;