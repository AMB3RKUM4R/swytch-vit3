import { useState, useEffect, useRef } from 'react';
import { X, Wallet, Send, ArrowRight, Repeat2, Gamepad, ShoppingBag, BarChart2, User, Code, Newspaper, Sparkles, Shield, Globe, CircleDollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

// Mock Web3 provider
const mockWeb3 = {
  connect: async () => ({ address: '0x1234...5678', balance: '100 USDT' }),
};

// Interfaces
interface AccountSection {
  title: string;
  content: string | JSX.Element;
  icon: JSX.Element;
  gradient: string;
}

interface DashboardTab {
  id: string;
  title: string;
  icon: JSX.Element;
  content: JSX.Element;
  gradient: string; // Added to fix TS2339
}

// Data
const heroImage = '/bg-59.webp';

const AccountSections: AccountSection[] = [
  {
    title: '🧠 Psychological Awakening',
    content: 'You are no longer a customer. Not a player. Not a cog in a broken economy. In Swytch, you are a Beneficiary. Your effort is proof of your existence — and that proof earns you value.',
    icon: <Sparkles className="w-6 h-6 text-rose-400 animate-pulse" />,
    gradient: 'from-rose-500/10 to-pink-500/10'
  },
  {
    title: '🌐 Social Architecture',
    content: 'Governance through participation. Reputation replaces hierarchy. The Community Panel connects all PETs — People of Energy & Truth. Here, you vote, bond, rise.',
    icon: <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />,
    gradient: 'from-cyan-500/10 to-blue-500/10'
  },
  {
    title: '💰 Economic Rebirth',
    content: 'Your gameplay isn’t a pastime — it’s proof-of-energy. The more you engage, the more you earn. Your Energy converts to Swytch Stablecoin, tied to USDT.',
    icon: <CircleDollarSign className="w-6 h-6 text-pink-400 animate-pulse" />,
    gradient: 'from-pink-500/10 to-rose-500/10'
  },
  {
    title: '🧾 Ethical & Legal Sanctuary',
    content: (
      <p>
        We honor <strong>Energy</strong>. We protect <strong>Truth</strong>. We uphold the <strong>Freedom to Earn</strong>.
      </p>
    ),
    icon: <Shield className="w-6 h-6 text-rose-400 animate-pulse" />,
    gradient: 'from-rose-500/10 to-cyan-500/10'
  },
  {
    title: '🔥 You Are PET',
    content: 'Welcome to the Petaverse. A digital society. A gamified sanctuary. A system built for synergy. You’re no longer just alive — you’re aligned. Soul-synced. Future-bound.',
    icon: <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />,
    gradient: 'from-cyan-500/10 to-pink-500/10'
  }
];

// Animation variants
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const fadeLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
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
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
  <div className="relative group">
    {children}
    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap">
      {text}
    </div>
  </div>
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

const Card = ({ children, gradient, className = '' }: { children: React.ReactNode; gradient: string; className?: string }) => (
  <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
    <motion.div
      className={`relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-500/30 transition-all bg-gradient-to-r ${gradient} ${className}`}
      whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
    >
      {children}
    </motion.div>
  </Tilt>
);

const Account: React.FC = () => {
  const [modal, setModal] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('games');
  const [energyInput, setEnergyInput] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Throttled mouse move
  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }, 100);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Dashboard tabs
  const dashboardTabs: DashboardTab[] = [
    {
      id: 'games',
      title: 'Game Library',
      icon: <Gamepad className="w-5 h-5 animate-pulse" />,
      content: (
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 space-y-4">
            <p className="text-gray-300 text-lg">
              Dive into your collection of PET-powered games. Launch, review, or install titles directly from your dashboard.
            </p>
            <button className="bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-lg text-white font-semibold">Browse Games</button>
          </div>
          <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-lg text-gray-400 text-center">
            Your unlocked games will appear here...
          </div>
        </div>
      ),
      gradient: 'from-rose-500/10 to-pink-500/10' // Added
    },
    {
      id: 'marketplace',
      title: 'PET Marketplace',
      icon: <ShoppingBag className="w-5 h-5 animate-pulse" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Trade in-game assets with Swytch Stablecoin. Every transaction is verified for Energy integrity.
          </p>
          <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg text-white font-semibold">Explore Marketplace</button>
        </div>
      ),
      gradient: 'from-pink-500/10 to-rose-500/10' // Added
    },
    {
      id: 'energy',
      title: 'Energy Dashboard',
      icon: <BarChart2 className="w-5 h-5 animate-pulse" />,
      content: (
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 space-y-4">
            <p className="text-gray-300 text-lg">
              Track your proof-of-energy. Convert Energy to Swytch Stablecoin (1 Energy = 0.0258 USDT).
            </p>
            <div className="space-y-2">
              <input
                type="number"
                value={energyInput}
                onChange={(e) => setEnergyInput(Number(e.target.value))}
                placeholder="Enter Energy"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
                aria-label="Enter Energy amount"
              />
              <p className="text-rose-400 font-bold">
                {energyInput ? `${(energyInput * 0.0258).toFixed(2)} USDT` : 'Enter Energy to calculate'}
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-lg text-gray-200 text-center space-y-2">
            <p className="text-xl font-bold">Energy: 1245</p>
            <p className="text-xl font-bold">Earnings: 32.15 USDT</p>
          </div>
        </div>
      ),
      gradient: 'from-cyan-500/10 to-blue-500/10' // Added
    },
    {
      id: 'identity',
      title: 'PET Identity',
      icon: <User className="w-5 h-5 animate-pulse" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-lg">
            Earn badges through gameplay, service, and social impact. Boost your PET score for governance rights.
          </p>
          <div className="flex gap-4 mt-4">
            <Tooltip text="Verified PET Member">
              <motion.div
                className="bg-rose-700 text-white px-4 py-2 rounded-full"
                whileHover={{ scale: 1.1 }}
              >
                Verified PET
              </motion.div>
            </Tooltip>
            <Tooltip text="Early Adopter">
              <motion.div
                className="bg-pink-600 text-white px-4 py-2 rounded-full"
                whileHover={{ scale: 1.1 }}
              >
                Founder
              </motion.div>
            </Tooltip>
          </div>
        </div>
      ),
      gradient: 'from-rose-500/10 to-cyan-500/10' // Added
    },
    {
      id: 'creator',
      title: 'Creator Hub',
      icon: <Code className="w-5 h-5 animate-pulse" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Shape the Petaverse. Upload games, mods, or propose PET Challenges, verified by proof-of-energy.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <button className="bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-lg text-white font-semibold">Upload Game</button>
            <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg text-white font-semibold">Propose Challenge</button>
          </div>
        </div>
      ),
      gradient: 'from-cyan-500/10 to-pink-500/10' // Added
    },
    {
      id: 'feed',
      title: 'PET Feed & DAO',
      icon: <Newspaper className="w-5 h-5 animate-pulse" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-lg">
            Stay connected with DAO voting alerts, social posts, and global energy stats.
          </p>
          <div className="bg-gray-800/50 p-6 rounded-lg text-gray-200">
            🚨 Vote #42: Should Energy-to-USDT be uncapped? 🗳️
          </div>
        </div>
      ),
      gradient: 'from-pink-500/10 to-rose-500/10' // Added
    }
  ];

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const { address } = await mockWeb3.connect();
      alert(`Connected: ${address}`);
    } catch {
      alert('Failed to connect wallet');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white px-6 py-24 sm:px-12 lg:px-24 space-y-32 overflow-hidden">
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

      {/* Hero Section */}
      <motion.section
        className="relative z-20 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.div
          className="relative w-full h-[400px] rounded-3xl flex items-center justify-center text-center shadow-2xl overflow-hidden"
          animate={{ scale: [1, 1.05, 1], transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' } }}
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/70 to-pink-900/70" />
          <motion.h1
            className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold text-rose-400 drop-shadow-2xl z-10 max-w-4xl leading-tight flex items-center gap-4"
            animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <Sparkles className="w-10 h-10 animate-pulse" />
            Your PET Dashboard
          </motion.h1>
        </motion.div>
      </motion.section>

      {/* Dashboard Section */}
      <motion.section
        className="relative z-20 max-w-7xl mx-auto space-y-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        ref={sectionRef}
      >
        <motion.h2
          className="text-4xl font-extrabold text-rose-400 flex items-center gap-4"
          variants={fadeLeft}
        >
          <BarChart2 className="w-10 h-10 animate-pulse" /> Manage Your Petaverse
        </motion.h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {dashboardTabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeTab === tab.id ? 'true' : 'false'}
            >
              {tab.icon} {tab.title}
            </motion.button>
          ))}
        </div>
        <Card gradient={dashboardTabs.find((tab) => tab.id === activeTab)?.gradient || 'from-rose-500/10 to-pink-500/10'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {dashboardTabs.find((tab) => tab.id === activeTab)?.content}
            </motion.div>
          </AnimatePresence>
        </Card>
      </motion.section>

      {/* Wallet & Actions Section */}
      <motion.section
        className="relative z-20 max-w-5xl mx-auto space-y-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-4xl font-extrabold text-rose-400 flex items-center gap-4"
          variants={fadeLeft}
        >
          <Wallet className="w-10 h-10 animate-pulse" /> Wallet Actions
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleConnectWallet(); }}>
              <h3 className="text-2xl font-bold text-rose-400 flex items-center gap-3">
                <Wallet className="w-6 h-6 animate-bounce" /> Connect Wallet
              </h3>
              <input
                type="text"
                placeholder="Wallet Address"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
                disabled
                value="0x1234...5678"
                aria-label="Wallet Address"
              />
              <input
                type="number"
                placeholder="Amount in USDT"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
                aria-label="Amount in USDT"
              />
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-lg text-white flex items-center gap-2 font-semibold w-full justify-center"
              >
                <Wallet className="w-5 h-5 animate-bounce" /> Connect
              </button>
            </form>
          </Card>
          <Card gradient="from-pink-500/10 to-rose-500/10" className="flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-rose-400 flex items-center gap-3">
                <ArrowRight className="w-6 h-6 animate-pulse" /> Crypto Actions
              </h3>
              <button
                onClick={() => setModal('Send')}
                className="bg-rose-600 hover:bg-rose-700 px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 font-semibold w-full"
              >
                <Send className="w-5 h-5 animate-pulse" /> Send Crypto
              </button>
              <button
                onClick={() => setModal('Receive')}
                className="bg-pink-600 hover:bg-pink-700 px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 font-semibold w-full"
              >
                <ArrowRight className="w-5 h-5 animate-pulse" /> Receive Crypto
              </button>
              <button
                onClick={() => setModal('Swap')}
                className="bg-cyan-600 hover:bg-cyan-700 px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 font-semibold w-full"
              >
                <Repeat2 className="w-5 h-5 animate-pulse" /> Swap
              </button>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* PET Principles Section */}
      <motion.section
        className="relative z-20 max-w-4xl mx-auto space-y-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-4xl font-extrabold text-rose-400 flex items-center gap-3"
          variants={fadeLeft}
        >
          <Shield className="w-10 h-10 animate-pulse" /> PET Principles
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {AccountSections.map((section, index) => (
            <Card key={index} gradient={section.gradient}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {section.icon}
                  <h3 className="text-xl font-bold text-rose-400">{section.title}</h3>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </motion.div>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'connect' && (
          <Modal title="Connect Wallet" onClose={() => setModal(null)}>
            <div className="space-y-6">
              <button
                className="bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-lg text-white w-full font-semibold flex items-center justify-center gap-2"
                onClick={handleConnectWallet}
              >
                <Wallet className="w-5 h-5 animate-bounce" /> Connect MetaMask
              </button>
            </div>
          </Modal>
        )}
        {['Send', 'Receive', 'Swap'].includes(modal || '') && (
          <Modal title={`${modal} Crypto`} onClose={() => setModal(null)}>
            <form className="space-y-6">
              <input
                type="text"
                placeholder="Wallet Address"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
                aria-label="Wallet Address"
              />
              <input
                type="number"
                placeholder="Amount in USDT"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
                aria-label="Amount in USDT"
              />
              <button className="bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-lg text-white w-full font-semibold">
                Confirm
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <style>{`
        .blur-3xl { filter: blur(64px); }
        .blur-2xl { filter: blur(32px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
        }
        input:focus {
          transition: border-color 0.3s ease, ring-color 0.3s ease;
        }
        @media (prefers-reduced-motion) {
          .animate-pulse, .animate-bounce, [data-animate] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Account;