import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Vote, Sparkles, Wallet, ArrowRight, X, Trophy, Heart, MessageSquare, Globe2,
  Send, Star, Rocket, ShieldCheck, MessageCircle} from 'lucide-react';

// Interfaces
interface DAOProposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Ended';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  jewels: number;
  level: string;
  avatar: string;
}

interface Testimonial {
  quote: string;
  author: string;
}

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
}

// Data
const daoProposals: DAOProposal[] = [
  {
    id: 1,
    title: 'Expand Raziel Library Quests',
    description: 'Add 10 new educational quests to the Raziel Library, rewarding JEWELS for completion.',
    votesFor: 1200,
    votesAgainst: 300,
    status: 'Active',
  },
  {
    id: 2,
    title: 'Launch New PETverse Planet',
    description: 'Introduce a new planet with unique NFTs and multiplayer missions.',
    votesFor: 800,
    votesAgainst: 150,
    status: 'Active',
  },
  {
    id: 3,
    title: 'Increase Yield Boost for Level 9 PETs',
    description: 'Propose a 0.2% yield increase for Mythic PETs to reward long-term loyalty.',
    votesFor: 500,
    votesAgainst: 400,
    status: 'Ended',
  },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'AstraRebel', jewels: 15000, level: 'Mythic PET', avatar: '/avatar1.jpg' },
  { rank: 2, name: 'QuantumSage', jewels: 12000, level: 'Elder', avatar: '/avatar2.jpg' },
  { rank: 3, name: 'NovaGuardian', jewels: 9000, level: 'Alchemist', avatar: '/avatar3.jpg' },
  { rank: 4, name: 'CipherOracle', jewels: 7000, level: 'Archon', avatar: '/avatar4.jpg' },
  { rank: 5, name: 'LunarSeeker', jewels: 5000, level: 'Sage', avatar: '/avatar5.jpg' },
];

const testimonials: Testimonial[] = [
  {
    quote: 'Swytch’s DAO let me propose a new quest that’s now live! I’ve never felt so empowered in a community.',
    author: 'Zara, Mythic PET, London',
  },
  {
    quote: 'Voting on Swytch’s future feels like shaping a digital nation. My voice matters here.',
    author: 'Kai, Elder, Tokyo',
  },
  {
    quote: 'Earning JEWELS for governance contributions is a game-changer. This is true ownership.',
    author: 'Luna, Guardian, Nairobi',
  },
];

const chatMessages: ChatMessage[] = [
  { id: 1, user: 'AstraRebel', avatar: '/avatar1.jpg', message: 'Who’s joining the new planet mission?', timestamp: '10:15 AM' },
  { id: 2, user: 'NovaGuardian', avatar: '/avatar3.jpg', message: 'Count me in! Need JEWELS for gear?', timestamp: '10:18 AM' },
  { id: 3, user: 'QuantumSage', avatar: '/avatar2.jpg', message: 'Just voted for the Raziel Quests. Thoughts?', timestamp: '10:20 AM' },
];

// Animation variants
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

const flareVariants = { animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } } };
const particleVariants = { animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } } };

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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50"
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

const CommunityOwnership: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', category: 'Quests' });
  const [rankFilter, setRankFilter] = useState<'all' | 'jewels' | 'level'>('all');
  const chatRef = useRef<HTMLDivElement>(null);

  // Throttled mouse move
  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }, 100);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle email signup
  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    alert('Welcome to the PETverse! Check your inbox for DAO onboarding details.');
  };

  // Handle voting simulation
  const handleVote = (proposalId: number, choice: 'for' | 'against') => {
    setSelectedProposal(proposalId);
    setVoteChoice(choice);
    setTimeout(() => {
      alert(`Your vote "${choice}" for "${daoProposals.find(p => p.id === proposalId)?.title}" has been recorded!`);
      setSelectedProposal(null);
      setVoteChoice(null);
    }, 1000);
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
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden">
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
          className="relative text-center"
        >
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <motion.div
              className="relative rounded-3xl p-12"
              style={{
                backgroundImage: `url(/bg (59).jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
              <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
                <motion.div
                  className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50"
                  animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50"
                  animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
                />
              </motion.div>
              <div className="relative space-y-6">
                <motion.h2
                  className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
                  animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
                >
                  <Sparkles className="w-12 h-12 animate-pulse" /> Community Ownership
                </motion.h2>
                <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Swytch is your Petaverse. Shape its future through voting, proposals, and contributions. Every PET’s voice fuels our decentralized revolution.
                </p>
                <motion.button
                  className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
                  onClick={() => setShowWalletModal(true)}
                  whileHover={{ scale: 1.05 }}
                >
                  Become a PET
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                </motion.button>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Governance Explainer Video */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6 text-center"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Rocket className="w-8 h-8 text-pink-400 animate-pulse" /> How Swytch Governance Works
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover how PETs drive the Petaverse through decentralized decision-making.
          </p>
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold"
            onClick={() => setShowVideo(true)}
            whileHover={{ scale: 1.05 }}
          >
            Watch Explainer
          </motion.button>
          <AnimatePresence>
            {showVideo && (
              <Modal title="Governance Explainer" onClose={() => setShowVideo(false)}>
                <iframe
                  src="https://www.youtube.com/embed/8cm1x4bC610"
                  title="Swytch Governance Explainer"
                  className="w-full h-[300px] rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Modal>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Community Chat Room */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <MessageCircle className="w-8 h-8 text-rose-400 animate-pulse" /> PET Chat Room
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Connect with PETs worldwide, discuss missions, and share ideas.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-4">
              <div
                ref={chatRef}
                className="h-[300px] overflow-y-auto no-scrollbar p-4 bg-gray-900/80 rounded-lg"
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
                      />
                      <div>
                        <p className="text-white font-semibold">{msg.user} <span className="text-gray-400 text-xs ml-2">{msg.timestamp}</span></p>
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
                  className="flex-1 p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
                  aria-label="Chat message"
                />
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-md flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Send className="w-5 h-5" /> Send
                </motion.button>
              </form>
            </div>
          </Card>
        </motion.div>

        {/* Community Voting Form */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Vote className="w-8 h-8 text-cyan-400 animate-pulse" /> Submit a Proposal
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Propose new ideas for the Petaverse and let the community vote.
          </p>
          <Card gradient="from-cyan-500/10 to-blue-500/10">
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
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500"
                  required
                  aria-label="Proposal title"
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
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500 h-32 resize-y"
                  required
                  aria-label="Proposal description"
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
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500"
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
                className="w-full px-6 py-3 bg-cyan-600 text-white hover:bg-cyan-700 rounded-md font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Vote className="w-5 h-5" /> Submit Proposal
              </motion.button>
            </form>
          </Card>
        </motion.div>

        {/* DAO Proposal Voting Simulator */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Vote className="w-8 h-8 text-rose-400 animate-pulse" /> Live DAO Proposals
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Vote on proposals to shape Swytch’s future.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-6">
              {daoProposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  className="bg-gray-900/80 p-6 rounded-lg border border-rose-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-xl font-bold text-white mb-2">{proposal.title}</h4>
                  <p className="text-gray-300 text-sm mb-4">{proposal.description}</p>
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>Votes For: {proposal.votesFor}</span>
                    <span>Votes Against: {proposal.votesAgainst}</span>
                    <span>Status: {proposal.status}</span>
                  </div>
                  {proposal.status === 'Active' && (
                    <div className="flex gap-4">
                      <motion.button
                        className={`flex-1 py-2 rounded-md font-semibold ${
                          selectedProposal === proposal.id && voteChoice === 'for'
                            ? 'bg-green-600'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                        onClick={() => handleVote(proposal.id, 'for')}
                        whileHover={{ scale: 1.05 }}
                        disabled={selectedProposal === proposal.id}
                        aria-label={`Vote for ${proposal.title}`}
                      >
                        Vote For
                      </motion.button>
                      <motion.button
                        className={`flex-1 py-2 rounded-md font-semibold ${
                          selectedProposal === proposal.id && voteChoice === 'against'
                            ? 'bg-red-600'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                        onClick={() => handleVote(proposal.id, 'against')}
                        whileHover={{ scale: 1.05 }}
                        disabled={selectedProposal === proposal.id}
                        aria-label={`Vote against ${proposal.title}`}
                      >
                        Vote Against
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Community Rankings */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-pink-400 animate-pulse" /> Community Rankings
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            See who’s leading the Petaverse with their contributions.
          </p>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="flex gap-2 mb-4">
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onClick={() => setRankFilter('all')}
                whileHover={{ scale: 1.05 }}
              >
                All
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'jewels' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onClick={() => setRankFilter('jewels')}
                whileHover={{ scale: 1.05 }}
              >
                Top JEWELS
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded-md font-semibold ${rankFilter === 'level' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onClick={() => setRankFilter('level')}
                whileHover={{ scale: 1.05 }}
              >
                Top Levels
              </motion.button>
            </div>
            <div className="space-y-4">
              {filteredRankings.map((pet) => (
                <motion.div
                  key={pet.rank}
                  className="flex items-center gap-4 bg-gray-900/80 p-4 rounded-lg border border-rose-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full border border-rose-500/20"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold">#{pet.rank} {pet.name}</p>
                    <p className="text-sm text-gray-400">{pet.level}</p>
                  </div>
                  <p className="text-rose-400 font-semibold">{pet.jewels} JEWELS</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* PET Contribution Leaderboard */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-rose-400 animate-pulse" /> PET Leaderboard
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Celebrate the top PETs driving Swytch’s growth.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-4">
              {leaderboard.map((pet) => (
                <motion.div
                  key={pet.rank}
                  className="flex items-center gap-4 bg-gray-900/80 p-4 rounded-lg border border-rose-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full border border-rose-500/20"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold">#{pet.rank} {pet.name}</p>
                    <p className="text-sm text-gray-400">{pet.level}</p>
                  </div>
                  <p className="text-rose-400 font-semibold">{pet.jewels} JEWELS</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-pink-400 animate-pulse" /> PET Voices
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Hear from PETs shaping the Petaverse.
          </p>
          <Card gradient="from-pink-500/10 to-rose-500/10" className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center p-6"
              >
                <p className="text-gray-300 italic mb-2">"{testimonials[currentTestimonial].quote}"</p>
                <p className="text-pink-400 font-bold">— {testimonials[currentTestimonial].author}</p>
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Key Community Features */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-rose-400 animate-pulse" /> Why PETs Own Swytch
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Swytch empowers every PET to shape the Petaverse.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Vote className="w-6 h-6 text-rose-400 animate-pulse" />,
                title: 'Decentralized Governance',
                description: 'Vote on proposals using your JEWELS.',
                gradient: 'from-rose-500/10 to-pink-500/10',
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-pink-400 animate-pulse" />,
                title: 'Proposal Creation',
                description: 'Submit ideas to drive Swytch forward.',
                gradient: 'from-pink-500/10 to-rose-500/10',
              },
              {
                icon: <Trophy className="w-6 h-6 text-cyan-400 animate-pulse" />,
                title: 'Contribution Rewards',
                description: 'Earn JEWELS for participation.',
                gradient: 'from-cyan-500/10 to-blue-500/10',
              },
              {
                icon: <Globe2 className="w-6 h-6 text-rose-400 animate-pulse" />,
                title: 'Global Community',
                description: 'Connect with PETs worldwide.',
                gradient: 'from-rose-500/10 to-cyan-500/10',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-pink-400 animate-pulse" />,
                title: 'Transparent Trust',
                description: 'On-chain governance for fairness.',
                gradient: 'from-pink-500/10 to-rose-500/10',
              },
            ].map((feature, i) => (
              <Card key={i} gradient={feature.gradient}>
                <motion.div
                  variants={sectionVariants}
                  whileHover={{ scale: 1.02, y: -10 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h4 className="ml-3 text-xl font-bold text-white">{feature.title}</h4>
                  </div>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </motion.div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Join the DAO CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6 text-center"
        >
          <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
            <Sparkles className="w-10 h-10 text-rose-400 animate-pulse" /> Join the PETverse DAO
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Become a PET and shape the future of Swytch.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 p-3 bg-gray-800 text-white rounded-md border border-rose-500/20 focus:border-rose-500"
                required
                aria-label="Email for DAO signup"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-md font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                Join Now <Send className="w-5 h-5" />
              </motion.button>
            </form>
            <motion.button
              className="mt-4 inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
            >
              Connect Wallet
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-rose-300 italic text-center max-w-xl mx-auto"
        >
          Swytch is yours. Every vote, every proposal, every JEWEL shapes our decentralized future. Join the PETverse and own the revolution.
        </motion.div>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <Modal title="Connect to Swytch" onClose={() => setShowWalletModal(false)}>
              <div className="space-y-4">
                <motion.button
                  className="w-full p-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Wallet className="w-5 h-5" /> Connect MetaMask
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-pink-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
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
            </Modal>
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
      </motion.div>
    </section>
  );
};

export default CommunityOwnership;