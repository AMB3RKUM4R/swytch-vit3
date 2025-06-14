import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Wallet, Send, Repeat2, Star, Search, Filter, Info, Flame, Sparkles, Trophy, Zap, X,
} from 'lucide-react';

const allGames = [
  { title: 'RAZIEL QUEST', image: '/bg (28).jpg', genre: 'Strategy', description: 'Embark on a quest for ancient knowledge.' },
  { title: 'PET RUSH', image: '/bg (11).jpg', genre: 'Arcade', description: 'Dash through vibrant PET worlds.' },
  { title: 'VAULT RUNNERS', image: '/bg (102).jpg', genre: 'Adventure', description: 'Explore hidden vaults for treasures.' },
  { title: 'CITY OF TRUTH', image: '/bg (29).jpg', genre: 'RPG', description: 'Build a rebellion in a dystopian city.' },
  { title: 'ENERGY WAR', image: '/bg (8).jpg', genre: 'Shooter', description: 'Battle for control of Energy nodes.' },
  { title: 'GHOST BLOCKADE', image: '/bg (17).jpg', genre: 'Shooter', description: 'Defend against spectral invaders.' },
  { title: 'STRATEGEM', image: '/bg (59).jpg', genre: 'Strategy', description: 'Outwit foes in tactical showdowns.' },
  { title: 'CYBER CARNIVAL', image: '/bg (61).jpg', genre: 'Arcade', description: 'Neon-fueled chaos and rewards.' },
  { title: 'CRYPT CRAWLER', image: '/bg (62).jpg', genre: 'Adventure', description: 'Navigate treacherous crypto dungeons.' },
  { title: 'TRUTH WARDENS', image: '/bg (63).jpg', genre: 'RPG', description: 'Protect truth in a fractured world.' },
  { title: 'PIXEL FURY', image: '/bg (68).jpg', genre: 'Arcade', description: 'Retro chaos with modern rewards.' },
  { title: 'SENTINEL ZONE', image: '/bg (72).jpg', genre: 'Shooter', description: 'Guard the frontier against chaos.' },
  { title: 'PET LEGENDS', image: '/bg (73).jpg', genre: 'RPG', description: 'Forge your legend as a PET.' },
  { title: 'NEON NEXUS', image: '/bg (74).jpg', genre: 'Adventure', description: 'Explore a glowing cyber-realm.' },
  { title: 'ARENA PRISM', image: '/bg (79).jpg', genre: 'Strategy', description: 'Compete in prismatic battlegrounds.' },
  { title: 'ECLIPSE RIFT', image: '/bg (87).jpg', genre: 'RPG', description: 'Bridge worlds in cosmic conflicts.' },
  { title: 'MYTHIC STORM', image: '/bg (88).jpg', genre: 'Adventure', description: 'Tame storms for epic loot.' },
  { title: 'VOID CHESS', image: '/bg (97).jpg', genre: 'Strategy', description: 'Master strategy in a cosmic board.' },
  { title: 'ANIMA SOULS', image: '/bg (98).jpg', genre: 'Arcade', description: 'Unleash your soul in fast-paced battles.' },
  { title: 'LUX RUNNERS', image: '/bg (99).jpg', genre: 'Shooter', description: 'Run and gun through radiant ruins.' },
];

const genres = ['Strategy', 'Arcade', 'Adventure', 'RPG', 'Shooter'];

const gameStoreSections = [
  { title: '🔥 Trending Now', icon: <Flame className="w-6 h-6 text-red-500 animate-pulse" />, games: ['RAZIEL QUEST', 'PET RUSH', 'ENERGY WAR'] },
  { title: '🌟 Editor’s Choice', icon: <Star className="w-6 h-6 text-yellow-400 animate-spin-slow" />, games: ['CITY OF TRUTH', 'STRATEGEM', 'NEON NEXUS'] },
  { title: '📈 Top Grossing', icon: <ArrowRight className="w-6 h-6 text-green-400 animate-bounce" />, games: ['VAULT RUNNERS', 'CRYPT CRAWLER', 'PET LEGENDS'] },
  { title: '🆕 New Releases', icon: <Info className="w-6 h-6 text-cyan-300 animate-pulse" />, games: ['ECLIPSE RIFT', 'MYTHIC STORM', 'LUX RUNNERS'] },
];

const SwytchExp = () => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredGames = allGames.filter(g =>
    (!selectedGenre || g.genre === selectedGenre) &&
    g.title.toLowerCase().includes(search.toLowerCase())
  );

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

  const infiniteScroll = {
    animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 25, ease: 'linear' } } }
  };

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let frameId: number;
    const scroll = () => {
      scrollContainer.scrollLeft += 1;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      }
      frameId = requestAnimationFrame(scroll);
    };
    frameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white p-6 sm:p-12 lg:p-24 space-y-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={sectionVariants}
          className="relative h-[400px] bg-gray-900/50 backdrop-blur-lg rounded-3xl flex items-center justify-center text-center border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all overflow-hidden"
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
            <motion.h1
              className="text-5xl sm:text-7xl font-extrabold text-cyan-400 drop-shadow-xl flex items-center gap-4 justify-center"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> The PET Grid
            </motion.h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              A rebellion of 20+ games. Play to earn JEWELS, subscribe to rise, trade to reign. Your Energy shapes the Petaverse.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Enter the Grid
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Game Filters */}
        <motion.div
          variants={sectionVariants}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-gray-950/80 backdrop-blur-lg py-6 px-4 border-b border-cyan-500/20 rounded-b-xl"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Search className="w-6 h-6 text-cyan-300 animate-pulse" />
            <input
              type="text"
              placeholder="Search games..."
              className="bg-gray-900 text-white px-4 py-3 rounded-lg w-full sm:w-64 border border-gray-700 focus:border-cyan-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            <Filter className="w-6 h-6 text-cyan-300 animate-spin-slow" />
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedGenre === g ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-gray-900 text-gray-300 hover:bg-cyan-700 hover:text-white border-gray-700'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Game Cards */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredGames.map((game, i) => (
            <motion.div
              key={game.title}
              className="relative bg-gray-900/60 border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl flex flex-col transition-all backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 80 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
              <img src={game.image} alt={game.title} className="w-full h-48 object-cover" />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-cyan-300 mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">Genre: {game.genre}</p>
                  <p className="text-xs text-gray-300 mb-4">{game.description}</p>
                  <p className="text-xs text-cyan-200 flex items-center gap-1">
                    <Zap className="w-4 h-4 animate-pulse" /> Earn Energy | Collect Drops | Level Up
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-sm font-semibold text-white flex-1">
                    Play Now
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold text-white flex-1">
                    Subscribe
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Game Store Sections */}
        {gameStoreSections.map((section, index) => (
          <motion.div
            key={index}
            variants={sectionVariants}
            className="space-y-6 mt-12"
          >
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              {section.icon} {section.title}
            </h3>
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-6"
                variants={infiniteScroll}
                animate="animate"
                ref={index === 0 ? scrollRef : null}
              >
                {[...allGames.filter(g => section.games.includes(g.title)), ...allGames.filter(g => section.games.includes(g.title))].map((game, i) => (
                  <motion.div
                    key={`${game.title}-${i}`}
                    className="flex-shrink-0 w-[280px] bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all backdrop-blur-md"
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <img src={game.image} alt={game.title} className="w-full h-36 object-cover rounded-lg mb-4" />
                    <h4 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                      <Star className="w-5 h-5 animate-pulse" /> {game.title}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">Genre: {game.genre}</p>
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full font-semibold">Play Now</button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ))}

        {/* PET Balance */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Trophy className="w-10 h-10 text-teal-400 animate-pulse" /> Your PET Balance
            </h2>
            <p className="text-2xl text-gray-300">Energy: 4200 ⚡ | Monthly SWYT: ~138</p>
            <p className="text-lg text-teal-300">
              At 3.3% APY, your Energy generates passive crypto rewards—no staking, pure sovereignty.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Manage Wallet
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Wallet Actions */}
        <motion.div
          variants={sectionVariants}
          className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          <motion.form
            className="relative bg-gray-900/60 border border-cyan-500/20 p-8 rounded-xl space-y-6 backdrop-blur-md"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
                <Wallet className="w-6 h-6 animate-pulse" /> Connect Your Wallet
              </h3>
              <input
                type="text"
                placeholder="Wallet Address (0x...)"
                className="w-full p-3 mt-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-cyan-500"
              />
              <input
                type="number"
                placeholder="Amount in USDT"
                className="w-full p-3 mt-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-cyan-500"
              />
              <button
                className="mt-4 w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                onClick={(e) => { e.preventDefault(); setShowWalletModal(true); }}
              >
                <Wallet className="w-5 h-5 animate-bounce" /> Connect Wallet
              </button>
            </div>
          </motion.form>

          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
          >
            <motion.button
              className="bg-teal-600 hover:bg-teal-700 px-4 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Send className="w-5 h-5 animate-pulse" /> Send Crypto
            </motion.button>
            <motion.button
              className="bg-teal-600 hover:bg-teal-700 px-4 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowRight className="w-5 h-5 animate-pulse" /> Receive Crypto
            </motion.button>
            <motion.button
              className="bg-teal-600 hover:bg-teal-700 px-4 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Repeat2 className="w-5 h-5 animate-pulse" /> Swap
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={sectionVariants}
          className="text-center space-y-4 mt-12"
        >
          <p className="text-lg italic text-gray-300">
            “We honor Energy. We protect Truth. We uphold the Freedom to Earn.”
          </p>
          <p className="text-2xl font-bold text-cyan-400">
            Welcome to Swytch — You’re not a user, you’re a PET. 💠
          </p>
          <p className="text-sm text-gray-400">
            A gamified rebellion. A proof-of-purpose universe. Your Energy shapes the future.
          </p>
        </motion.div>
      </motion.div>

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
                <Wallet className="w-8 h-8 animate-pulse" /> Connect to the Grid
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SwytchExp;