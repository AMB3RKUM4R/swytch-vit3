import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  X, Rocket, KeyRound, Terminal, ShieldCheck, Coins, Flame, Workflow, BadgeCheck, Eye, BarChart3, HelpCircle, UserCheck,
  Sparkles, Zap, Bot, ArrowRight, Wallet, MessageCircle, Vote, Trophy, Send
} from 'lucide-react';

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
    icon: <Rocket className="text-[hsl(var(--primary))] w-6 h-6 animate-pulse" />,
    image: '/bg (123).jpg',
    modal: "Gaming transcends entertainment. Swytch turns players into income beneficiaries with crypto-backed rewards."
  },
  {
    title: "Reinventing Onboarding",
    description: "Onboarding forges PET identities and multi-chain access, seamlessly entering the Swytch ecosystem.",
    icon: <KeyRound className="text-[hsl(var(--accent))] w-6 h-6 animate-pulse" />,
    image: '/bg (107).jpg',
    modal: "Your PET identity secures rights under PMA principles, connecting you to decentralized value."
  },
  {
    title: "Narrative-Led Identity Creation",
    description: "Your PET evolves through quests, education, and trust-building, shaping your destiny.",
    icon: <Terminal className="text-[hsl(var(--secondary))] w-6 h-6 animate-pulse" />,
    image: '/bg (113).jpg',
    modal: "Become an Oracle, Rebel, or Alchemist, unlocking NFTs, perks, and governance power."
  },
  {
    title: "The PET Omertà",
    description: "Swytch’s code of trust ensures PETs control their vaults and rewards.",
    icon: <ShieldCheck className="text-[hsl(var(--primary))] w-6 h-6 animate-pulse" />,
    image: '/bg (28).jpg',
    modal: "The PET Omertà offers private arbitration and PMA-backed rights for decentralized freedom."
  },
  {
    title: "Crypto Without Saying ‘Crypto’",
    description: "Gold, chests, keys = wealth. Swytch simplifies crypto with intuitive metaphors.",
    icon: <Coins className="text-[hsl(var(--accent))] w-6 h-6 animate-pulse" />,
    image: '/bg (117).jpg',
    modal: "Treasure chests let players build wealth effortlessly, with full wallet control."
  },
  {
    title: "A New Standard: The Swytch Protocol",
    description: "Swytch invites you to a new dimension of ownership and evolution.",
    icon: <Flame className="text-[hsl(var(--secondary))] w-6 h-6 animate-pulse" />,
    image: '/bg (117).jpg',
    modal: "The Swytch Protocol blends law, rights, yield, and game theory for a revolutionary ecosystem."
  },
  {
    title: "How It All Connects",
    description: "Navigate the Swytch lifecycle: gameplay, vaults, tokens, and AI orchestration.",
    icon: <Workflow className="text-[hsl(var(--primary))] w-6 h-6 animate-pulse" />,
    image: '/bg (109).jpg',
    modal: "Earn JEWELS, convert to SWYT, stake for levels, access vaults—powered by DAO."
  },
  {
    title: "Vault Access",
    description: "$10 unlocks your Swytch Wallet, granting a PET ID and first mission.",
    icon: <BadgeCheck className="text-[hsl(var(--accent))] w-6 h-6 animate-pulse" />,
    image: '/bg (117).jpg',
    modal: "Verified PETs access vaults, quests, NFTs, and education with full key custody."
  },
  {
    title: "Support Spells",
    description: "Optional ads reward tokens and PET yield boosts.",
    icon: <Eye className="text-[hsl(var(--secondary))] w-6 h-6 animate-pulse" />,
    image: '/bg (123).jpg',
    modal: "Opt-in spells transform time into tokens to amplify vault earnings."
  },
  {
    title: "Ecosystem Metrics & Growth",
    description: "Track Swytch’s expansion: adoption, APY, DAO votes, and more.",
    icon: <BarChart3 className="text-[hsl(var(--primary))] w-6 h-6 animate-pulse" />,
    image: '/bg (28).jpg',
    modal: "On-chain data fuels progress, transparent and accessible to PETs."
  },
  {
    title: "FAQ & Truth Panel",
    description: "The Truth Panel answers questions with AI, human wisdom, and DAO knowledge.",
    icon: <HelpCircle className="text-[hsl(var(--accent))] w-6 h-6 animate-pulse" />,
    image: '/bg (28).jpg',
    modal: "Our AI NPC draws from trust law and PET consensus. Ask anything."
  },
  {
    title: "Sentinel Evolution",
    description: "Choose your path: Oracle, Rebel, Architect, Guardian.",
    icon: <UserCheck className="text-[hsl(var(--secondary))] w-6 h-6 animate-pulse" />,
    image: '/bg (107).jpg',
    modal: "Your class upgrades vaults, yields, and perks as you evolve."
  }
];

const metricsData: Metric[] = [
  { label: 'Active PETs', value: '1,234', icon: <UserCheck className="w-6 h-6 text-[hsl(var(--primary))]" /> },
  { label: 'Vault Yields', value: '3.3% APY', icon: <Coins className="w-6 h-6 text-[hsl(var(--accent))]" /> },
  { label: 'DAO Votes', value: '567', icon: <BarChart3 className="w-6 h-6 text-[hsl(var(--secondary))]" /> },
  { label: 'JEWELS Earned', value: '89,012', icon: <Sparkles className="w-6 h-6 text-[hsl(var(--primary))]" /> },
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

// Components
const AnimatedText = ({ text }: { text: string }) => (
  <motion.div
    className="text-[hsl(var(--foreground))] text-base font-medium text-center p-4 leading-relaxed"
    variants={textVariants}
    animate="animate"
  >
    {text}
  </motion.div>
);

const Card = ({ children, gradient, className = '' }: { children: React.ReactNode; gradient: string; className?: string }) => (
  <motion.div
    className={`relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 rounded-2xl shadow-xl glass hover:shadow-[hsl(var(--primary))/30] transition-all bg-gradient-to-r ${gradient} ${className}`}
    whileHover={{ scale: 1.05, boxShadow: '0 0 15px hsla(340, 75%, 55%, 0.5)' }}
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
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 w-full max-w-md shadow-2xl glass"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-[hsl(var(--primary))] flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="text-[hsl(var(--primary))] hover:text-[hsl(var(--destructive))] w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

const EcosystemIntro: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [truthQuery, setTruthQuery] = useState('');
  const [truthResponse, setTruthResponse] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [chatMessage, setChatMessage] = useState('');
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', category: 'Quests' });
  const [rankFilter, setRankFilter] = useState<'all' | 'jewels' | 'level'>('all');
  const chatRef = useRef<HTMLDivElement>(null);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
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
    setTruthResponse(`AI Response: Your query "${truthQuery}" is processed by the Truth Panel. Explore the Petaverse for more insights!`);
    setTruthQuery('');
  };

  // Handle chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      alert(`Message sent: ${chatMessage}`);
      setChatMessage('');
    }
  };

  // Handle proposal submission
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposalForm.title.trim() && proposalForm.description.trim()) {
      alert(`Proposal submitted: ${proposalForm.title}`);
      setProposalForm({ title: '', description: '', category: 'Quests' });
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
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-background text-foreground overflow-hidden min-h-screen">
      {/* Lens Flare and Noise Overlay */}
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-[hsl(var(--primary))/50] via-[hsl(var(--secondary))/40] to-[hsl(var(--accent))/30] rounded-full opacity-30 blur-3xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-[hsl(var(--secondary))/40] via-[hsl(var(--primary))/30] to-[hsl(var(--accent))/20] rounded-full opacity-20 blur-2xl"
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
              backgroundColor: i % 2 === 0 ? 'hsla(340, 75%, 55%, 0.5)' : 'hsla(180, 100%, 50%, 0.5)'
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
          className="relative text-center bg-[hsl(var(--card))] glass rounded-3xl p-12 border border-[hsl(var(--border))] shadow-2xl hover:shadow-[hsl(var(--primary))/40] transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))/60] to-[hsl(var(--secondary))/60] rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-[hsl(var(--primary))] rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-[hsl(var(--accent))] rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-[hsl(var(--primary))] flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Command Hub
            </motion.h2>
            <p className="text-xl sm:text-2xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
              The AI-orchestrated heart of the Petaverse, where education, identity, and wealth converge.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent))] rounded-full text-lg font-semibold group"
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
          <Card gradient="from-[hsl(var(--primary))/10] to-[hsl(var(--secondary))/10]">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
                <BarChart3 className="w-8 h-8 text-[hsl(var(--primary))] animate-pulse" /> Ecosystem Metrics
              </h3>
              <p className="text-lg text-[hsl(var(--muted-foreground))] text-center max-w-3xl mx-auto">
                Real-time insights into Swytch’s growth, powered by on-chain data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsData.map((metric, i) => (
                  <motion.div
                    key={i}
                    className="bg-[hsl(var(--muted))] p-4 rounded-lg border border-[hsl(var(--border))] glass flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="p-2 bg-[hsl(var(--primary))/10] rounded-full">{metric.icon}</div>
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{metric.label}</p>
                      <p className="text-lg font-bold text-[hsl(var(--foreground))]">{metric.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Ecosystem Sections */}
        <motion.div variants={sectionVariants} className="space-y-16">
          <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-[hsl(var(--primary))] animate-pulse" /> The Swytch Ecosystem
          </h3>
          <p className="text-lg text-[hsl(var(--muted-foreground))] text-center max-w-3xl mx-auto">
            Explore the interconnected layers of Swytch, orchestrated by AI and driven by PETs.
          </p>
          {ecosystemSections.map((item, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-[hsl(var(--primary))]">
                  {item.icon}
                  <span className="text-lg font-semibold text-[hsl(var(--foreground))]">{item.title}</span>
                </div>
                <p className="text-[hsl(var(--muted-foreground))] text-lg">{item.description}</p>
                <motion.button
                  onClick={() => setActiveModal(item.title)}
                  className="text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))] mt-4 underline text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  Learn More
                </motion.button>
                <div className="relative rounded-xl overflow-hidden h-[200px] bg-[hsl(var(--muted))] p-4">
                  <AnimatedText text={item.modal} />
                  <noscript>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm p-4">{item.modal}</p>
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
          <Card gradient="from-[hsl(var(--secondary))/10] to-[hsl(var(--primary))/10]">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
                <Bot className="w-8 h-8 text-[hsl(var(--primary))] animate-pulse" /> Truth Panel
              </h3>
              <p className="text-lg text-[hsl(var(--muted-foreground))] text-center max-w-3xl mx-auto">
                Ask the AI-driven Truth Panel about Swytch, powered by protocol rules and DAO consensus.
              </p>
              <form onSubmit={handleTruthQuery} className="max-w-xl mx-auto space-y-4">
                <input
                  type="text"
                  value={truthQuery}
                  onChange={(e) => setTruthQuery(e.target.value)}
                  placeholder="Ask about Swytch, PETs, or the Protocol..."
                  className="w-full p-3 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                  aria-label="Truth Panel query"
                />
                <motion.button
                  type="submit"
                  className="w-full py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  Submit Query
                </motion.button>
              </form>
              {truthResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[hsl(var(--muted-foreground))] text-sm mt-4 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))]"
                >
                  {truthResponse}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Community Chat Room */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <MessageCircle className="text-[hsl(var(--primary))] w-8 h-8 animate-pulse" /> PET Chat Room
          </h3>
          <p className="text-lg text-[hsl(var(--muted-foreground))] text-center max-w-3xl mx-auto">
            Connect with the Swytch community to discuss the Petaverse and earn JEWELS.
          </p>
          <Card gradient="from-[hsl(var(--primary))/10] to-[hsl(var(--secondary))/10]">
            <div className="space-y-4">
              <div
                ref={chatRef}
                className="h-[300px] overflow-y-auto no-scrollbar p-4 bg-[hsl(var(--muted))] rounded-lg"
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
                        className="w-8 h-8 rounded-full border border-[hsl(var(--border))]"
                        onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
                      />
                      <div>
                        <p className="text-[hsl(var(--foreground))] font-semibold">{msg.user} <span className="text-[hsl(var(--muted-foreground))] text-xs ml-2">{msg.timestamp}</span></p>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm">{msg.message}</p>
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
                  className="flex-1 p-3 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                  aria-label="Chat message"
                />
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent))] rounded-md flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Send className="w-5 h-5" /> Send
                </motion.button>
              </form>
            </div>
          </Card>
        </motion.div>

        {/* Community Voting Form */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <Vote className="text-[hsl(var(--secondary))] w-8 h-8 animate-pulse" /> Submit a Proposal
          </h3>
          <p className="text-lg text-[hsl(var(--muted-foreground))] text-center max-w-3xl mx-auto">
            Propose changes to Swytch governance or ecosystem features.
          </p>
          <Card gradient="from-[hsl(var(--secondary))/10] to-[hsl(var(--primary))/10]">
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div>
                <label htmlFor="proposal-title" className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                  Proposal Title
                </label>
                <input
                  id="proposal-title"
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  placeholder="Enter proposal title"
                  className="w-full p-3 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:border-[hsl(var(--secondary))]"
                  required
                  aria-label="Proposal title"
                />
              </div>
              <div>
                <label htmlFor="proposal-description" className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                  Description
                </label>
                <textarea
                  id="proposal-description"
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  placeholder="Describe your proposal"
                  className="w-full p-3 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:border-[hsl(var(--secondary))] h-32 resize-y"
                  required
                  aria-label="Proposal description"
                />
              </div>
              <div>
                <label htmlFor="proposal-category" className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                  Category
                </label>
                <select
                  id="proposal-category"
                  value={proposalForm.category}
                  onChange={(e) => setProposalForm({ ...proposalForm, category: e.target.value })}
                  className="w-full p-3 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:border-[hsl(var(--secondary))]"
                  aria-label="Proposal category"
                >
                  <option value="Quests">Quests</option>
                  <option value="Planets">Planets</option>
                  <option value="Rewards">Rewards</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
              <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent))] rounded-md font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Vote className="w-5 h-5" /> Submit Proposal
              </motion.button>
            </form>
          </Card>
        </motion.div>

        {/* Community Rankings */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <Trophy className="text-[hsl(var(--accent))] w-8 h-8 animate-pulse" /> Community Rankings
          </h3>
          <p className="text-lg text-[hsl(var(--muted-foreground))] text-center max-w-3xl mx-auto">
            See top PETs shaping the Petaverse.
          </p>
          <Card gradient="from-[hsl(var(--accent))/10] to-[hsl(var(--primary))/10]">
            <div className="flex gap-2 mb-4">
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'all' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}}`}
                onClick={() => setRankFilter('all')}
                whileHover={{ scale: 1.05 }}
                aria-label="Filter by all"
              >
                All
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'jewels' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}}`}
                onClick={() => setRankFilter('jewels')}
                whileHover={{ scale: 1.05 }}
                aria-label="Filter by JEWELS"
              >
                Top JEWELS
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'level' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}}`}
                onClick={() => setRankFilter('level')}
                whileHover={{ scale: 1.05 }}
                aria-label="Filter by level"
              >
                Top Levels
              </motion.button>
            </div>
            <div className="space-y-4">
              {filteredRankings.map((pet) => (
                <motion.div
                  key={pet.rank}
                  className="flex items-center gap-4 bg-[hsl(var(--muted))] p-4 rounded-lg border border-[hsl(var(--border))]"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full border border-[hsl(var(--border))]"
                    onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
                  />
                  <div className="flex-1">
                    <p className="text-[hsl(var(--foreground))] font-bold">#{pet.rank} {pet.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{pet.level}</p>
                  </div>
                  <p className="text-[hsl(var(--primary))] font-semibold">{pet.jewels} JEWELS</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <motion.div variants={sectionVariants}>
          <Card gradient="from-[hsl(var(--primary))/10] to-[hsl(var(--secondary))/10]" className="text-center">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-4">
                <Sparkles className="w-10 h-10 text-[hsl(var(--primary))] animate-pulse" /> Join the Petaverse
              </h3>
              <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
                Become a PET, unlock your vault, and shape decentralized wealth.
              </p>
              <motion.button
                className="inline-flex items-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent))] rounded-full text-lg font-semibold group"
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
                <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed whitespace-pre-line">
                  {ecosystemSections.find((d) => d.title === activeModal)?.modal}
                </p>
                <div className="rounded-lg overflow-hidden h-[200px] bg-[hsl(var(--muted))] p-4">
                  <AnimatedText text={ecosystemSections.find((d) => d.title === activeModal)?.modal || ''} />
                  <noscript>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm p-4">{ecosystemSections.find((d) => d.title === activeModal)?.modal}</p>
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
                <motion.button
                  className="w-full p-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => alert('Connecting MetaMask...')}
                >
                  <Wallet className="w-5 h-5" /> Connect MetaMask
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => alert('Connecting WalletConnect...')}
                >
                  <Wallet className="w-5 h-5" /> Connect WalletConnect
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => alert('Generating new wallet...')}
                >
                  <Wallet className="w-5 h-5" /> Generate New Wallet
                </motion.button>
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
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnQzS2f8eAAAAAElFTkSuQmCC');
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