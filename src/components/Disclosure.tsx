import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Shield, Wallet, Key, AlertTriangle, Lock, Globe, FileText, Users, Zap, EyeOff,
  Server, Database, Scale, Gavel, Rocket, Sparkles, Code, Link, UserX, Cpu,
  MessageCircle, Vote, Trophy, Send
} from 'lucide-react';

// Interfaces
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

// Mock Data
const chatMessages: ChatMessage[] = [
  { id: 1, user: 'AstraRebel', avatar: '/avatar1.jpg', message: 'Just reviewed the DSPET terms—any questions?', timestamp: '10:15 AM' },
  { id: 2, user: 'NovaGuardian', avatar: '/avatar3.jpg', message: 'What’s the deal with gas fees?', timestamp: '10:18 AM' },
  { id: 3, user: 'QuantumSage', avatar: '/avatar2.jpg', message: 'Smart contracts look solid. Audits?', timestamp: '10:20 AM' },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'AstraRebel', jewels: 15000, level: 'Mythic PET', avatar: '/avatar1.jpg' },
  { rank: 2, name: 'QuantumSage', jewels: 12000, level: 'Elder', avatar: '/avatar2.jpg' },
  { rank: 3, name: 'NovaGuardian', jewels: 9000, level: 'Alchemist', avatar: '/avatar3.jpg' },
  { rank: 4, name: 'CipherOracle', jewels: 7000, level: 'Archon', avatar: '/avatar4.jpg' },
  { rank: 5, name: 'LunarSeeker', jewels: 5000, level: 'Sage', avatar: '/avatar5.jpg' },
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

// Components
const Card = ({ children, gradient, className = '' }: { children: React.ReactNode; gradient: string; className?: string }) => (
  <motion.div
    className={`relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-500/30 transition-all bg-gradient-to-r ${gradient} ${className}`}
    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
  >
    {children}
  </motion.div>
);


const SwytchDisclosure: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [chatMessage, setChatMessage] = useState('');
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', category: 'Quests' });
  const [rankFilter, setRankFilter] = useState<'all' | 'jewels' | 'level'>('all');
  const chatRef = useRef<HTMLDivElement>(null);

  // Throttled mouse move for lens flares
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
    <section className="relative py-32 px-6 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-gray-100 text-left overflow-hidden">
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
        className="relative z-20 max-w-7xl mx-auto space-y-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section 1: Terms of Use */}
        <motion.div variants={fadeUp} className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <FileText className="text-rose-400 w-12 h-12 animate-pulse" /> Terms of Use
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              To interact with the Swytch Private Energy Trust Protocol, connect via your self-custodial wallet, governed by third-party terms.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Wallet className="text-pink-400 w-6 h-6" /> Review wallet terms for fees and risks.</li>
              <li className="flex items-start gap-3"><Shield className="text-cyan-400 w-6 h-6" /> Swytch is not an intermediary or custodian.</li>
              <li className="flex items-start gap-3"><Zap className="text-rose-400 w-6 h-6" /> Gas fees are non-refundable.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <Card gradient="from-rose-500/10 to-pink-500/10">
              <p className="text-lg text-gray-200 italic">Your wallet, your responsibility—comply with its terms.</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Section 2: Assumption of Risk */}
        <motion.div variants={fadeRight}>
          <Card gradient="from-red-500/10 to-orange-500/10">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <AlertTriangle className="text-red-400 w-12 h-12 animate-pulse" /> Assumption of Risk
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Engaging with experimental blockchain technology carries inherent risks.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg text-gray-300">
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Code className="text-orange-400 w-6 h-6" /> Bugs or cyberattacks may disrupt operations.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Link className="text-yellow-400 w-6 h-6" /> Forks may lead to total loss.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Lock className="text-red-400 w-6 h-6" /> Swytch assumes no liability.
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
                  <Server className="text-purple-400 w-6 h-6" /> Third-party services are not Swytch’s responsibility.
                </li>
              </ul>
              <p className="text-xl text-orange-300 italic">Avoid blockchain if uncomfortable with risks.</p>
            </div>
          </Card>
        </motion.div>

        {/* Section 3: Smart Contract Transactions */}
        <motion.div variants={fadeLeft} className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Cpu className="text-pink-400 w-12 h-12 animate-pulse" /> Smart Contract Transactions
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Transactions are processed via smart contracts, dictating fund distribution and ownership.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-cyan-400 w-6 h-6" /> Transactions are irreversible.</li>
              <li className="flex items-start gap-3"><Key className="text-rose-400 w-6 h-6" /> Evaluate risks before transacting.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <Card gradient="from-pink-500/10 to-rose-500/10">
              <p className="text-lg text-gray-200 italic">Smart contracts ensure trustless execution.</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Section 4: Wallet Security */}
        <motion.div variants={fadeUp}>
          <Card gradient="from-rose-500/10 to-cyan-500/10" className="text-center">
            <div className="space-y-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <Key className="text-rose-400 w-12 h-12 animate-pulse" /> Wallet Security
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                You are responsible for securing your self-custodial wallet’s private keys.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Lock className="text-red-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-lg text-gray-200">Swytch cannot recover lost keys.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <UserX className="text-purple-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-lg text-gray-200">You manage wallet security.</p>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Section 5: Service Accessibility */}
        <motion.div variants={fadeRight} className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Server className="text-cyan-400 w-12 h-12 animate-pulse" /> Service Accessibility
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Swytch does not guarantee service quality or accessibility. Conduct due diligence.
            </p>
            <p className="text-xl text-cyan-300 italic">Use Swytch if suitable for your finances.</p>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <Card gradient="from-cyan-500/10 to-rose-500/10">
              <p className="text-lg text-gray-200 italic">Due diligence is critical—services may face disruptions.</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Section 6: Taxes */}
        <motion.div variants={fadeLeft}>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <Scale className="text-pink-400 w-12 h-12 animate-pulse" /> Taxes
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                You are responsible for all taxes related to Swytch services or assets.
              </p>
              <ul className="list-none space-y-4 text-lg text-gray-300">
                <li className="flex items-start gap-3"><Database className="text-cyan-400 w-6 h-6" /> Tax treatment is uncertain.</li>
                <li className="flex items-start gap-3"><Sparkles className="text-rose-400 w-6 h-6" /> See “Know Your Freedom” for tax education.</li>
              </ul>
              <p className="text-xl text-pink-300 italic">All tax obligations are yours.</p>
            </div>
          </Card>
        </motion.div>

        {/* Section 7: Prohibited Content */}
        <motion.div variants={fadeUp} className="text-center">
          <Card gradient="from-red-500/10 to-rose-500/10">
            <div className="space-y-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <Gavel className="text-red-400 w-12 h-12 animate-pulse" /> Prohibited Content
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Comply with Swytch’s Agreement and laws. Prohibited conduct includes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <UserX className="text-red-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-sm text-gray-200">Illegal activities.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Code className="text-orange-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-sm text-gray-200">Malicious code.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Link className="text-purple-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-sm text-gray-200">Unauthorized commercial use.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Cpu className="text-cyan-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-sm text-gray-200">Security interference.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Users className="text-rose-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-sm text-gray-200">Anticompetitive behavior.</p>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Section 8: DSPET Disclosure */}
        <motion.div variants={fadeRight} className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Globe className="text-rose-400 w-12 h-12 animate-pulse" /> DSPET Disclosure
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              DSPET enables secure, private energy exchange via blockchain.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-pink-400 w-6 h-6" /> Trustless energy exchange (JEWELS).</li>
              <li className="flex items-start gap-3"><Users className="text-cyan-400 w-6 h-6" /> Governed by SWYTCH token holders.</li>
              <li className="flex items-start gap-3"><Shield className="text-rose-400 w-6 h-6" /> Audited smart contracts.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <Card gradient="from-rose-500/10 to-pink-500/10">
              <p className="text-lg text-gray-200 italic">DSPET revolutionizes energy exchange.</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Section 9: DSPET Privacy Statement */}
        <motion.div variants={fadeLeft} className="text-center">
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <EyeOff className="text-rose-400 w-12 h-12 animate-pulse" /> DSPET Privacy Statement
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                DSPET safeguards privacy, collecting no user data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Database className="text-pink-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-lg text-gray-200">No data used for operations.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Users className="text-rose-400 w-8 h-8 mx-auto mb-4" />
                  <p className="text-lg text-gray-200">Encrypted, pseudonymous data.</p>
                </motion.div>
              </div>
              <p className="text-xl text-rose-300 italic">Consent to DSPET’s privacy practices.</p>
            </div>
          </Card>
        </motion.div>

        {/* Community Chat Room */}
        <motion.div variants={fadeUp} className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <MessageCircle className="text-rose-400 w-12 h-12 animate-pulse" /> PET Chat Room
          </h2>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
            Discuss DSPET terms and connect with the Swytch community.
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
        <motion.div variants={fadeUp} className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <Vote className="text-cyan-400 w-12 h-12 animate-pulse" /> Submit a Proposal
          </h2>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
            Propose changes to DSPET governance or services.
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

        {/* Community Rankings */}
        <motion.div variants={fadeUp} className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <Trophy className="text-pink-400 w-12 h-12 animate-pulse" /> Community Rankings
          </h2>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
            See top PETs contributing to DSPET.
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

export default SwytchDisclosure;