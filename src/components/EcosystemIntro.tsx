import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  X, Rocket, KeyRound, Terminal, ShieldCheck, Coins, Flame, Workflow, BadgeCheck, Eye, BarChart3, HelpCircle, UserCheck,
  Sparkles, Zap, Bot, ArrowRight,
  Wallet
} from 'lucide-react';
import visionImg from '/bg (123).jpg';
import onboardingImg from '/bg (107).jpg';
import vaultImg from '/bg (117).jpg';
import rebellionImg from '/bg (117).jpg';
import agentImg from '/bg (113).jpg';
import chartImg from '/bg (28).jpg';
import diagramImg from '/bg (109).jpg';

const ecosystemSections = [
  {
    title: "Your Vision: More Than a Game",
    description: "Swytch redefines gaming as a portal to education, empowerment, and decentralized wealth. Every action fuels your journey in the Petaverse.",
    icon: <Rocket className="text-cyan-400 w-6 h-6 animate-pulse" />,
    image: visionImg,
    modal: `Gaming transcends entertainment. Swytch turns players into income beneficiaries, with vaults unlocking identity, legacy, and crypto-backed rewards. This is the Petaverse.`,
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Random placeholder (Rickroll)
  },
  {
    title: "Reinventing Onboarding",
    description: "Onboarding is an awakening. PETs forge identities, narratives, and multi-chain access, seamlessly entering the Swytch ecosystem.",
    icon: <KeyRound className="text-yellow-400 w-6 h-6 animate-pulse" />,
    image: onboardingImg,
    modal: `Your PET identity is your legacy. Built on PMA principles, onboarding secures your rights under the U.S. Constitution and UDHR, connecting you to decentralized value.`,
    video: "https://www.youtube.com/embed/9bZkp7q19f0" // Random placeholder (Gangnam Style)
  },
  {
    title: "Narrative-Led Identity Creation",
    description: "Your PET isn’t just a character—it’s your destiny. Soul-bound identities evolve through quests, education, and trust-building.",
    icon: <Terminal className="text-pink-400 w-6 h-6 animate-pulse" />,
    image: agentImg,
    modal: `Every choice shapes your PET’s arc. Become an Oracle, Rebel, or Alchemist, unlocking exclusive NFTs, perks, and governance power in the Petaverse.`,
    video: "https://www.youtube.com/embed/ZDXX4M4XI2I" // Random placeholder (Gaming trailer)
  },
  {
    title: "The PET Omertà",
    description: "Swytch’s code of trust governs all. This self-sovereign system ensures PETs hold absolute control over their vaults and rewards.",
    icon: <ShieldCheck className="text-green-400 w-6 h-6 animate-pulse" />,
    image: chartImg,
    modal: `Beyond contracts, the PET Omertà offers private arbitration and PMA-backed rights. It’s a living protocol for decentralized freedom.`,
    video: "https://www.youtube.com/embed/7wtfhZwyrcc" // Random placeholder (Cyberpunk trailer)
  },
  {
    title: "Crypto Without Saying ‘Crypto’",
    description: "Gold, chests, keys = wealth. Swytch simplifies crypto with intuitive metaphors, onboarding billions to decentralized value.",
    icon: <Coins className="text-orange-400 w-6 h-6 animate-pulse" />,
    image: vaultImg,
    modal: `Forget jargon. Treasure chests and vault upgrades let players build wealth effortlessly, with full control over their crypto wallets.`,
    video: "https://www.youtube.com/embed/UvQ2ZxL4r6w" // Random placeholder (Crypto explainer)
  },
  {
    title: "A New Standard: The Swytch Protocol",
    description: "Swytch invites you to a new dimension of ownership, identity, and evolution, powered by the Swytch Protocol.",
    icon: <Flame className="text-red-400 w-6 h-6 animate-pulse" />,
    image: rebellionImg,
    modal: `The Swytch Protocol is a PMA-backed, education-driven, crypto-native trust. It blends law, rights, yield, and game theory for a revolutionary ecosystem.`,
    video: "https://www.youtube.com/embed/8cm1x4bC610" // Random placeholder (Web3 vision)
  },
  {
    title: "How It All Connects",
    description: "Navigate the Swytch lifecycle: from gameplay to vaults, tokens to PET identity, all orchestrated by AI and smart contracts.",
    icon: <Workflow className="text-blue-400 w-6 h-6 animate-pulse" />,
    image: diagramImg,
    modal: `Earn JEWELS, convert to SWYT, stake for levels, access vaults, collect yield—repeat. A DAO-powered engine for decentralized income.`,
    video: "https://www.youtube.com/embed/1O6Qstncpnc" // Random placeholder (Blockchain flow)
  },
  {
    title: "Vault Access",
    description: "$10 unlocks your Swytch Wallet, granting a PET ID and your first mission in the Petaverse.",
    icon: <BadgeCheck className="text-purple-400 w-6 h-6 animate-pulse" />,
    image: vaultImg,
    modal: `As a verified PET, you gain permanent access to vaults, quests, NFTs, and education—all while retaining full custody of your keys.`,
    video: "https://www.youtube.com/embed/0tZGqM6hEyo" // Random placeholder (NFT intro)
  },
  {
    title: "Support Spells",
    description: "Ads are optional and rewarding. Support Spells turn attention into tokens and PET yield boosts.",
    icon: <Eye className="text-teal-400 w-6 h-6 animate-pulse" />,
    image: visionImg,
    modal: `Ads become opt-in spells, transforming time into tokens. Trade or use them to amplify your vault earnings.`,
    video: "https://www.youtube.com/embed/3tNZV5_6ygU" // Random placeholder (Ad tech)
  },
  {
    title: "Ecosystem Metrics & Growth",
    description: "Track Swytch’s expansion: adoption, APY, DAO votes, and more, visualized in real-time.",
    icon: <BarChart3 className="text-lime-400 w-6 h-6 animate-pulse" />,
    image: chartImg,
    modal: `On-chain data fuels narrative progress. From energy flows to quest completions, metrics are transparent and PET-accessible.`,
    video: "https://www.youtube.com/embed/4rR4W0lK6zQ" // Random placeholder (Data analytics)
  },
  {
    title: "FAQ & Truth Panel",
    description: "The Truth Panel merges AI, human wisdom, and DAO knowledge to answer your questions transparently.",
    icon: <HelpCircle className="text-gray-300 w-6 h-6 animate-pulse" />,
    image: chartImg,
    modal: `Our AI NPC draws from trust law, protocol rules, and PET consensus. Ask anything—truth is our code.`,
    video: "https://www.youtube.com/embed/6Qv1bS3cF8Q" // Random placeholder (AI chatbot demo)
  },
  {
    title: "Sentinel Evolution",
    description: "Choose your path: Oracle, Rebel, Architect, Guardian. Your role shapes your rewards and evolution.",
    icon: <UserCheck className="text-cyan-300 w-6 h-6 animate-pulse" />,
    image: onboardingImg,
    modal: `Your class reflects your actions, upgrading vaults, yields, and perks as you evolve in the Petaverse.`,
    video: "https://www.youtube.com/embed/2jK1l1h6M4c" // Random placeholder (RPG character creation)
  }
];

const metricsData = [
  { label: 'Active PETs', value: '1,234', icon: <UserCheck className="w-6 h-6 text-cyan-400" /> },
  { label: 'Vault Yields', value: '3.3% APY', icon: <Coins className="w-6 h-6 text-yellow-400" /> },
  { label: 'DAO Votes', value: '567', icon: <BarChart3 className="w-6 h-6 text-lime-400" /> },
  { label: 'JEWELS Earned', value: '89,012', icon: <Sparkles className="w-6 h-6 text-pink-400" /> },
];

const EcosystemIntro = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [truthQuery, setTruthQuery] = useState('');
  const [truthResponse, setTruthResponse] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation variants
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

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulated AI Truth Panel response
  const handleTruthQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setTruthResponse(`AI Response: Your query "${truthQuery}" is being processed by the Truth Panel. Based on Swytch Protocol, PMA principles, and DAO consensus, here's a placeholder answer: Keep exploring the Petaverse!`);
    setTruthQuery('');
  };

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto space-y-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/60 to-blue-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-teal-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Command Hub
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              The AI-orchestrated heart of the Petaverse, where education, identity, and decentralized wealth converge.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Enter the Petaverse
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Metrics Dashboard */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
          <div className="relative space-y-6">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <BarChart3 className="w-8 h-8 text-teal-400 animate-pulse" /> Ecosystem Metrics
            </h3>
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
              Real-time insights into Swytch’s growth, powered by on-chain data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricsData.map((metric, i) => (
                <motion.div
                  key={i}
                  className="relative bg-gray-900/80 p-4 rounded-lg border border-cyan-500/20 backdrop-blur-sm flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="p-2 bg-cyan-500/10 rounded-full">{metric.icon}</div>
                  <div>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                    <p className="text-lg font-bold text-white">{metric.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Ecosystem Sections */}
        <motion.div
          variants={sectionVariants}
          className="space-y-16"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> The Swytch Ecosystem
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
                <div className="flex items-center gap-3 text-cyan-400">
                  {item.icon}
                  <span className="text-lg font-semibold text-white">{item.title}</span>
                </div>
                <p className="text-gray-300 text-lg">{item.description}</p>
                <button
                  onClick={() => setActiveModal(item.title)}
                  className="text-cyan-400 hover:text-cyan-300 mt-4 underline text-sm"
                >
                  Learn More
                </button>
                <div className="relative rounded-xl overflow-hidden max-h-[200px]">
                  <iframe
                    src={item.video}
                    title={item.title}
                    className="w-full h-[200px]"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <motion.img
                src={item.image}
                alt={item.title}
                className="rounded-xl shadow-lg w-full max-h-[300px] object-cover"
                whileHover={{ scale: 1.05 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Truth Panel Chatbot */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/60 p-6 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
          <div className="relative space-y-6">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Bot className="w-8 h-8 text-cyan-400 animate-pulse" /> Truth Panel
            </h3>
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
              Ask the AI-driven Truth Panel anything about Swytch. Powered by protocol rules and DAO consensus.
            </p>
            <form onSubmit={handleTruthQuery} className="max-w-xl mx-auto space-y-4">
              <input
                type="text"
                value={truthQuery}
                onChange={(e) => setTruthQuery(e.target.value)}
                placeholder="Ask about Swytch, PETs, or the Protocol..."
                className="w-full p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
              >
                Submit Query
              </button>
            </form>
            {truthResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-300 text-sm mt-4 p-4 bg-gray-800 rounded-lg border border-cyan-500/20"
              >
                {truthResponse}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" /> Join the Petaverse
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Become a PET, unlock your vault, and shape the future of decentralized wealth.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Get Started
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Modal for Learn More */}
        <AnimatePresence>
          {activeModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-12"
            >
              <motion.div
                className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-2xl relative border border-cyan-500/20 backdrop-blur-lg"
                animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <motion.button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-400"
                  whileHover={{ rotate: 90 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">{activeModal}</h3>
                <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                  {ecosystemSections.find((d) => d.title === activeModal)?.modal}
                </p>
                <div className="mt-4">
                  <iframe
                    src={ecosystemSections.find((d) => d.title === activeModal)?.video}
                    title={activeModal}
                    className="w-full h-[200px] rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-cyan-500/20 shadow-2xl backdrop-blur-lg"
                animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <motion.button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                >
                  <X className="w-8 h-8" />
                </motion.button>
                <h3 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
                  <Wallet className="w-8 h-8 animate-pulse" /> Connect to Swytch
                </h3>
                <div className="space-y-4">
                  <motion.button
                    className="w-full p-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Wallet className="w-5 h-5" /> Connect MetaMask
                  </motion.button>
                  <motion.button
                    className="w-full p-3 bg-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
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
              </motion.div>
            </motion.div>
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
      `}</style>
    </section>
  );
};

export default EcosystemIntro;