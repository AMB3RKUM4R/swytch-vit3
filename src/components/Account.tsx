import { useState, useEffect } from 'react';
import { X, Wallet, Send, ArrowRight, Repeat2, Gamepad, ShoppingBag, BarChart2, User, Code, Newspaper, Sparkles, Star, Shield, Globe, CircleDollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const heroImage = '/bg (59).jpg';

// Updated Account Sections with enhanced styling
const AccountSections = [
  {
    title: '🧠 Psychological Awakening',
    content: 'You are no longer a customer. Not a player. Not a cog in a broken economy. In Swytch, you are a Beneficiary. Your effort is proof of your existence — and that proof earns you value. You don’t chase worth — you generate it.',
    icon: <Star className="w-8 h-8 text-cyan-400 animate-pulse" />,
    gradient: 'from-cyan-500/10 to-blue-500/10'
  },
  {
    title: '🌐 Social Architecture',
    content: 'Governance through participation. Reputation replaces hierarchy. The Community Panel connects all PETs — People of Energy & Truth. Here, you vote, bond, rise. No rulers. Only trusted contributors.',
    icon: <Globe className="w-8 h-8 text-purple-400 animate-pulse" />,
    gradient: 'from-purple-500/10 to-pink-500/10'
  },
  {
    title: '💰 Economic Rebirth',
    content: 'Your gameplay isn’t a pastime — it’s proof-of-energy. The more you engage, the more you earn. Your Energy converts to Swytch Stablecoin, tied to USDT. Withdraw it. Stack it. Live on your terms.',
    icon: <CircleDollarSign className="w-8 h-8 text-teal-400 animate-pulse" />,
    gradient: 'from-teal-500/10 to-green-500/10'
  },
  {
    title: '🧾 Ethical & Legal Sanctuary',
    content: (
      <p>
        We honor <strong>Energy</strong>. We protect <strong>Truth</strong>. We uphold the <strong>Freedom to Earn</strong>.
      </p>
    ),
    icon: <Shield className="w-8 h-8 text-yellow-400 animate-pulse" />,
    gradient: 'from-yellow-500/10 to-orange-500/10'
  },
  {
    title: '🔥 You Are PET',
    content: 'Welcome to the Petaverse. A digital society. A gamified sanctuary. A system built for synergy. You’re no longer just alive — you’re aligned. Soul-synced. Future-bound. Today, we swytched.',
    icon: <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />,
    gradient: 'from-pink-500/10 to-purple-500/10'
  }
];

// Game data for infinite scroll
const games = [
  { id: 1, title: 'Dungeon of Echoes', description: 'A dungeon-crawler with proof-of-energy mechanics.', image: '/game1.jpg', action: 'Play Now' },
  { id: 2, title: 'PET Racer X', description: 'High-speed races with SwytchCoin rewards.', image: '/game2.jpg', action: 'Download' },
  { id: 3, title: 'Ascend: PET Reign', description: 'A sci-fantasy RPG shaped by DAO votes.', image: '/game3.jpg', action: 'Watch Trailer' },
  { id: 4, title: 'Dungeon of Echoes', description: 'A dungeon-crawler with proof-of-energy mechanics.', image: '/game1.jpg', action: 'Play Now' }, // Duplicated for infinite scroll
  { id: 5, title: 'PET Racer X', description: 'High-speed races with SwytchCoin rewards.', image: '/game2.jpg', action: 'Download' },
  { id: 6, title: 'Ascend: PET Reign', description: 'A sci-fantasy RPG shaped by DAO votes.', image: '/game3.jpg', action: 'Watch Trailer' }
];

// Animation variants
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const fadeLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const fadeRight = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const infiniteScroll = {
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 15, ease: 'linear' } } }
};

const Modal = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      className="bg-gray-900 border border-cyan-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-300">{title}</h2>
        <button onClick={onClose}><X className="text-gray-400 hover:text-white w-6 h-6" /></button>
      </div>
      <form className="space-y-6">
        <input type="text" placeholder="Wallet Address" className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500" />
        <input type="number" placeholder="Amount in USDT" className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500" />
        <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg text-white w-full font-semibold">Confirm</button>
      </form>
    </motion.div>
  </motion.div>
);

export default function SwytchExperience() {
  const [modal, setModal] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect for hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white px-6 py-24 sm:px-12 space-y-32 overflow-hidden">
      {/* Hero Section with Parallax */}
      <motion.div
        className="relative w-full h-96 rounded-2xl flex items-center justify-center text-center shadow-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/70 to-blue-900/70" />
        <motion.h1
          className="relative text-4xl sm:text-6xl font-extrabold text-white drop-shadow-2xl z-10 max-w-3xl leading-tight"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          ⚡ Welcome to the Petaverse — Where Purpose Fuels Power
        </motion.h1>
      </motion.div>

      {/* Intro Section */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto space-y-6"
      >
        <p className="text-2xl italic text-cyan-400">“Purpose is service. Service is freedom.”</p>
        <p className="text-lg text-gray-300 leading-relaxed">
          In the Petaverse, every action counts. Swytch transforms your effort into Energy, your Energy into Stablecoin, and your Stablecoin into a life of autonomy. This isn’t a game—it’s a revolution.
        </p>
      </motion.section>

      {/* Account Dashboard Sections */}
      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="space-y-12 max-w-7xl mx-auto">
        {/* 1. Game Library */}
        <motion.div
          variants={fadeLeft}
          className="relative bg-gray-900/50 p-8 rounded-2xl border border-cyan-500/20 shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
                <Gamepad className="w-8 h-8 animate-pulse" /> Game Library
              </h2>
              <p className="text-gray-300 text-lg">
                Dive into your collection of PET-powered games. Launch, review, or install titles directly from your dashboard and start generating Energy.
              </p>
              <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg text-white font-semibold">Browse Games</button>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-lg text-gray-400 text-center">
              Your unlocked games will appear here...
            </div>
          </div>
        </motion.div>

        {/* 2. PET Marketplace */}
        <motion.div
          variants={fadeRight}
          className="relative bg-gray-900/50 p-8 rounded-2xl border border-teal-500/20 shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-2xl" />
          <div className="relative space-y-4 text-center">
            <h2 className="text-3xl font-bold text-teal-400 flex items-center justify-center gap-3">
              <ShoppingBag className="w-8 h-8 animate-pulse" /> PET Marketplace
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Trade in-game assets with Swytch Stablecoin. Every transaction is verified for Energy integrity, ensuring trust in the Petaverse.
            </p>
            <button className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg text-white font-semibold">Explore Marketplace</button>
          </div>
        </motion.div>

        {/* 3. Energy & Earnings Dashboard */}
        <motion.div
          variants={fadeLeft}
          className="relative bg-gray-900/50 p-8 rounded-2xl border border-purple-500/20 shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-purple-400 flex items-center gap-3">
                <BarChart2 className="w-8 h-8 animate-pulse" /> Energy Dashboard
              </h2>
              <p className="text-gray-300 text-lg">
                Visualize your proof-of-energy. Track your generated Energy and its conversion to Swytch Stablecoin, tied to USDT.
              </p>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-lg text-gray-200 text-center">
              <p className="text-xl font-bold">Energy: 1245</p>
              <p className="text-xl font-bold">Earnings: 32.15 USDT</p>
            </div>
          </div>
        </motion.div>

        {/* 4. PET Identity & Badges */}
        <motion.div
          variants={fadeRight}
          className="relative bg-gray-900/50 p-8 rounded-2xl border border-yellow-500/20 shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl" />
          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
              <User className="w-8 h-8 animate-pulse" /> Your PET Identity
            </h2>
            <p className="text-gray-300 text-lg">
              Earn badges through gameplay, service, and social impact. Your PET score boosts trust, visibility, and governance rights in the Petaverse.
            </p>
            <div className="flex gap-4 mt-4">
              <div className="bg-cyan-700 text-white px-4 py-2 rounded-full">Verified PET</div>
              <div className="bg-yellow-600 text-white px-4 py-2 rounded-full">Founder</div>
            </div>
          </div>
        </motion.div>

        {/* 5. Modding & Creator Hub */}
        <motion.div
          variants={fadeLeft}
          className="relative bg-gray-900/50 p-8 rounded-2xl border border-green-500/20 shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl" />
          <div className="relative space-y-4 text-center">
            <h2 className="text-3xl font-bold text-green-400 flex items-center justify-center gap-3">
              <Code className="w-8 h-8 animate-pulse" /> Creator Hub
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Shape the Petaverse. Upload games, mods, or propose PET Challenges, all verified by proof-of-energy.
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-semibold">Upload Game</button>
              <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg text-white font-semibold">Propose Challenge</button>
            </div>
          </div>
        </motion.div>

        {/* 6. Social Feed & DAO */}
        <motion.div
          variants={fadeRight}
          className="relative bg-gray-900/50 p-8 rounded-2xl border border-pink-500/20 shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl" />
          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold text-pink-400 flex items-center gap-3">
              <Newspaper className="w-8 h-8 animate-pulse" /> PET Feed & DAO Updates
            </h2>
            <p className="text-gray-300 text-lg">
              Stay connected with the Petaverse. Get DAO voting alerts, social posts, and global energy stats to fuel your journey.
            </p>
            <div className="bg-gray-800/50 p-6 rounded-lg text-gray-200">
              🚨 Vote #42: Should Energy-to-USDT be uncapped? 🗳️
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Game Library Section with Infinite Scroll */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        <h2 className="text-4xl font-extrabold text-cyan-300 flex items-center gap-4">
          <Gamepad className="w-10 h-10 animate-pulse" /> Swytch Game Library
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl">
          Choose your path to value. The PET Game Library is where play meets purpose, with every action generating Energy, truth, and rewards.
        </p>
        <div className="relative overflow-hidden">
          <motion.div className="flex gap-6" variants={infiniteScroll} animate="animate">
            {games.map((game) => (
              <motion.div
                key={game.id}
                className="bg-gray-900/60 border border-cyan-500/20 rounded-xl p-6 min-w-[300px] backdrop-blur-md hover:shadow-cyan-500/30 transition-all"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <img src={game.image} alt={game.title} className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-bold text-cyan-300">{game.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full">{game.action}</button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Account Sections */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto"
      >
        {AccountSections.map((section, index) => (
          <motion.div
            key={index}
            className={`relative bg-gray-900/50 border border-cyan-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/30 transition-all bg-gradient-to-r ${section.gradient}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {section.icon}
              <h3 className="text-xl font-bold text-cyan-300">{section.title}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{section.content}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Wallet & Actions */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        <motion.form
          variants={fadeLeft}
          className="relative bg-gray-900/50 border border-cyan-500/20 p-8 rounded-2xl shadow-xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl" />
          <div className="relative space-y-6">
            <h3 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
              <Wallet className="w-6 h-6 animate-bounce" /> Your Wallet
            </h3>
            <input type="text" placeholder="Wallet Address" className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500" />
            <input type="number" placeholder="Amount in USDT" className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500" />
            <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg text-white flex items-center gap-2 font-semibold w-full justify-center">
              <Wallet className="w-5 h-5 animate-bounce" /> Connect Wallet
            </button>
          </div>
        </motion.form>

        <motion.div variants={fadeRight} className="grid grid-cols-1 gap-4">
          <button onClick={() => setModal('Send')} className="bg-cyan-600 hover:bg-cyan-700 px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 font-semibold">
            <Send className="w-5 h-5 animate-pulse" /> Send Crypto
          </button>
          <button onClick={() => setModal('Receive')} className="bg-teal-600 hover:bg-teal-700 px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 font-semibold">
            <ArrowRight className="w-5 h-5 animate-pulse" /> Receive Crypto
          </button>
          <button onClick={() => setModal('Swap')} className="bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 font-semibold">
            <Repeat2 className="w-5 h-5 animate-pulse" /> Swap
          </button>
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {modal && <Modal title={`${modal} Crypto`} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}