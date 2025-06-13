// SwytchExperience.tsx
import { useState } from 'react';
import {
  ArrowRight, Wallet, Send, Repeat2, Star, Search, Filter, Info, Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

const allGames = [
  { title: 'RAZIEL QUEST', image: '/bg (28).jpg', genre: 'Strategy' },
  { title: 'PET RUSH', image: '/bg (11).jpg', genre: 'Arcade' },
  { title: 'VAULT RUNNERS', image: '/bg (102).jpg', genre: 'Adventure' },
  { title: 'CITY OF TRUTH', image: '/bg (29).jpg', genre: 'RPG' },
  { title: 'ENERGY WAR', image: '/bg (8).jpg', genre: 'Shooter' },
  { title: 'GHOST BLOCKADE', image: '/bg (17).jpg', genre: 'Shooter' },
  { title: 'STRATEGEM', image: '/bg (59).jpg', genre: 'Strategy' },
  { title: 'CYBER CARNIVAL', image: '/bg (61).jpg', genre: 'Arcade' },
  { title: 'CRYPT CRAWLER', image: '/bg (62).jpg', genre: 'Adventure' },
  { title: 'TRUTH WARDENS', image: '/bg (63).jpg', genre: 'RPG' },
  { title: 'PIXEL FURY', image: '/bg (68).jpg', genre: 'Arcade' },
  { title: 'SENTINEL ZONE', image: '/bg (72).jpg', genre: 'Shooter' },
  { title: 'PET LEGENDS', image: '/bg (73).jpg', genre: 'RPG' },
  { title: 'NEON NEXUS', image: '/bg (74).jpg', genre: 'Adventure' },
  { title: 'ARENA PRISM', image: '/bg (79).jpg', genre: 'Strategy' },
  { title: 'ECLIPSE RIFT', image: '/bg (87).jpg', genre: 'RPG' },
  { title: 'MYTHIC STORM', image: '/bg (88).jpg', genre: 'Adventure' },
  { title: 'VOID CHESS', image: '/bg (97).jpg', genre: 'Strategy' },
  { title: 'ANIMA SOULS', image: '/bg (98).jpg', genre: 'Arcade' },
  { title: 'LUX RUNNERS', image: '/bg (99).jpg', genre: 'Shooter' }
];

const genres = ['Strategy', 'Arcade', 'Adventure', 'RPG', 'Shooter'];

const gameStoreSections = [
  { title: '🔥 Trending Now', icon: <Flame className="w-5 h-5 text-red-500" /> },
  { title: '🌟 Editor’s Choice', icon: <Star className="w-5 h-5 text-yellow-400" /> },
  { title: '📈 Top Grossing', icon: <ArrowRight className="w-5 h-5 text-green-400" /> },
  { title: '🆕 New Releases', icon: <Info className="w-5 h-5 text-cyan-300" /> }
];

const SwytchExperience = () => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const filteredGames = allGames.filter(g =>
    (!selectedGenre || g.genre === selectedGenre) &&
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-black to-gray-950 text-white p-6 sm:p-12 space-y-24 overflow-x-hidden relative bg-glow">
      {/* Hero Section */}
      <motion.div
        className="w-full h-64 bg-gradient-to-r from-cyan-800 to-blue-900 rounded-xl flex items-center justify-center text-center shadow-xl mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <h1 className="text-5xl font-extrabold text-white drop-shadow-xl animate-pulse">⚡ Dive Into The PET Grid</h1>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-cyan-400 drop-shadow">🕹 Explore the Swytch Game Grid</h2>
        <p className="text-gray-400 mt-2">20+ experiences. One ecosystem. No scrollbars. No limits.</p>
        <p className="text-sm text-cyan-200 mt-2">Play to Earn. Subscribe to Rise. Trade to Reign.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur py-4 px-2 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-300 animate-pulse" />
          <input
            type="text"
            placeholder="Search games..."
            className="bg-gray-800 text-white px-3 py-2 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
          <Filter className="w-5 h-5 text-cyan-300 animate-spin" />
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-sm border transition-all duration-300 ${selectedGenre === g ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-cyan-700 hover:text-white'}`}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredGames.map((game, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-transform hover:scale-105 duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 80 }}
          >
            <img src={game.image} alt={game.title} className="w-full h-48 object-cover" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-1">{game.title}</h3>
                <p className="text-sm text-gray-400 mb-4">Genre: {game.genre}</p>
                <p className="text-xs text-gray-500">Earn Energy ⚡ | Collect Drops 🎁 | Level Up 📈</p>
              </div>
              <div className="flex gap-2 mt-auto">
                <button className="bg-cyan-600 hover:bg-cyan-500 animate-glow px-3 py-2 rounded-lg text-sm w-full text-white">
                  Play Now
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm w-full">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {gameStoreSections.map((section, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/10 rounded-2xl p-6 text-center shadow-md">
            <div className="mb-2 flex justify-center">{section.icon}</div>
            <h4 className="text-lg font-bold text-white mb-1">{section.title}</h4>
            <p className="text-sm text-gray-400">Featured games curated for ultimate engagement.</p>
          </div>
        ))}
      </div>

      {/* Wallet Info */}
      <div className="bg-cyan-900/10 p-6 rounded-2xl border border-cyan-500/20 text-center shadow-inner mt-12">
        <h2 className="text-4xl font-bold text-cyan-300 mb-2">Your PET Balance</h2>
        <p className="text-xl text-gray-300">Energy: 4200 ⚡ | Estimated Monthly SWYT: ~138</p>
        <p className="text-md text-cyan-200 mt-4">@3.3% APY, your Energy earns passive crypto — no staking required.</p>
      </div>

      {/* Wallet Actions */}
      <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
        <form className="bg-gray-900 border border-cyan-500/20 p-6 rounded-xl space-y-4">
          <h3 className="text-cyan-300 font-bold text-xl">Your Wallet</h3>
          <input type="text" placeholder="Wallet Address" className="w-full p-3 bg-gray-800 text-white rounded-md" />
          <input type="number" placeholder="Amount in USDT" className="w-full p-3 bg-gray-800 text-white rounded-md" />
          <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 animate-bounce" /> Connect Wallet
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4">
          <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2">
            <Send className="w-5 h-5 animate-pulse" /> Send Crypto
          </button>
          <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2">
            <ArrowRight className="w-5 h-5 animate-pulse" /> Receive Crypto
          </button>
          <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2">
            <Repeat2 className="w-5 h-5 animate-pulse" /> Swap
          </button>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-center text-sm text-gray-400 mt-12 space-y-2"
      >
        <p className="italic">“We honor Energy. We protect Truth. We uphold the Freedom to Earn.”</p>
        <p className="text-cyan-400 font-semibold">Welcome to Swytch — you’re not a user, you’re PET. 💠</p>
        <p className="text-xs text-gray-600">Swytch is a gamified society. A rebellion. A rebirth. A proof-of-purpose universe.</p>
      </motion.div>
    </div>
  );
};

export default SwytchExperience;
