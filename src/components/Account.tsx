// SwytchExperience.tsx — Petaverse Account Page
import { useState } from 'react';
import { X, Wallet, Send, ArrowRight, Repeat2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const heroImage = '/bg (59).jpg';

const AccountSections = [
  {
    title: '🧠 Psychological Awakening',
    content:
      'You are no longer a customer. Not a player. Not a cog in a broken economy. In Swytch, you are a Beneficiary. Your effort is proof of your existence — and that proof earns you value. You don’t chase worth — you generate it.'
  },
  {
    title: '🌐 Social Architecture',
    content:
      'Governance through participation. Reputation replaces hierarchy. The Community Panel connects all PETs — People of Energy & Truth. Here, you vote, bond, rise. No rulers. Only trusted contributors.'
  },
  {
    title: '💰 Economic Rebirth',
    content:
      'Your gameplay isn’t a pastime — it’s proof-of-energy. The more you engage, the more you earn. Your Energy converts to Swytch Stablecoin, tied to USDT. Withdraw it. Stack it. Live on your terms.'
  },
  {
    title: '🧾 Ethical & Legal Sanctuary',
    content:
 <p>
  We honor <strong>Energy</strong>. We protect <strong>Truth</strong>. We uphold the <strong>Freedom to Earn</strong>.
</p>
  },
  {
    title: '🔥 You Are PET',
    content:
      'Welcome to the Petaverse. A digital society. A gamified sanctuary. A system built for synergy. You’re no longer just alive — you’re aligned. Soul-synced. Future-bound. Today, we swytched.'
  }
];

const Modal = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
    <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-300">{title}</h2>
        <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
      </div>
      <form className="space-y-4">
        <input type="text" placeholder="Wallet Address" className="w-full p-3 bg-gray-800 text-white rounded-md" />
        <input type="number" placeholder="Amount in USDT" className="w-full p-3 bg-gray-800 text-white rounded-md" />
        <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white w-full">Confirm</button>
      </form>
    </div>
  </div>
);

export default function SwytchExperience() {
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-b from-black to-gray-950 text-white px-4 py-16 sm:p-12 space-y-20 overflow-x-hidden">
      <section className="space-y-12">
  {/* 1. Game Library */}
  <div className="bg-gray-900 rounded-xl p-8 border border-cyan-500/20 shadow-lg">
    <h2 className="text-2xl font-bold text-cyan-400 mb-4">🎮 Game Library</h2>
    <p className="text-gray-300 mb-4">Launch, review, or install PET-powered games you’ve unlocked. Browse your collection and play right from your dashboard.</p>
    {/* Placeholder for future component */}
    <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-400">Your unlocked games will appear here...</div>
  </div>

  {/* 2. PET Marketplace */}
  <div className="bg-gray-900 rounded-xl p-8 border border-cyan-500/20 shadow-lg">
    <h2 className="text-2xl font-bold text-cyan-400 mb-4">🏪 PET Marketplace</h2>
    <p className="text-gray-300 mb-4">Buy, sell, or trade in-game assets using Swytch stablecoin. Verified for Energy integrity.</p>
    <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-white rounded-md">Explore Marketplace</button>
  </div>

  {/* 3. Energy & Earnings Dashboard */}
  <div className="bg-gray-900 rounded-xl p-8 border border-cyan-500/20 shadow-lg">
    <h2 className="text-2xl font-bold text-cyan-400 mb-4">📈 Energy Dashboard</h2>
    <p className="text-gray-300">Track how much Energy you've generated and how it translates to Swytch Stablecoin. Your effort, visualized.</p>
    {/* Hook into backend for energy/token stats */}
    <div className="mt-4 bg-gray-800 p-4 rounded-lg text-gray-400">Energy: 1245 | Earnings: 32.15 USDT</div>
  </div>

  {/* 4. PET Identity & Badges */}
  <div className="bg-gray-900 rounded-xl p-8 border border-cyan-500/20 shadow-lg">
    <h2 className="text-2xl font-bold text-cyan-400 mb-4">👤 Your PET Identity</h2>
    <p className="text-gray-300">Earn badges through service, gameplay, and social impact. PET score increases trust, visibility, and governance rights.</p>
    <div className="flex gap-4 mt-4">
      <div className="bg-cyan-700 text-white px-4 py-2 rounded-full">Verified PET</div>
      <div className="bg-yellow-600 text-white px-4 py-2 rounded-full">Founder</div>
    </div>
  </div>

  {/* 5. Modding & Creator Hub */}
  <div className="bg-gray-900 rounded-xl p-8 border border-cyan-500/20 shadow-lg">
    <h2 className="text-2xl font-bold text-cyan-400 mb-4">🧩 Creator Hub</h2>
    <p className="text-gray-300">Upload games or mods, verify Proof-of-Energy, or propose a PET Challenge.</p>
    <div className="space-x-2 mt-4">
      <button className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded-md">Upload Game</button>
      <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-white rounded-md">Propose Challenge</button>
    </div>
  </div>

  {/* 6. Social Feed & DAO */}
  <div className="bg-gray-900 rounded-xl p-8 border border-cyan-500/20 shadow-lg">
    <h2 className="text-2xl font-bold text-cyan-400 mb-4">📰 PET Feed & DAO Updates</h2>
    <p className="text-gray-300">Stay in sync with the PETaverse. DAO voting alerts, social posts, and global energy stats.</p>
    <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-400">🚨 Vote #42: Should Energy-to-USDT be uncapped? 🗳️</div>
  </div>

  
</section>

 <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-extrabold text-cyan-300 mb-6">🎮 Swytch Game Library</h2>
    <p className="mb-8 text-gray-300 text-lg">
      This is where purpose meets play. The PET Game Library showcases all the titles where Energy can be earned, truth validated, and stories lived. You’re not just picking a game — you’re choosing how you generate your value.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500/20 hover:shadow-cyan-500/30">
        <img src="/game1.jpg" alt="Game 1" className="rounded-md mb-4" />
        <h3 className="text-xl font-bold text-cyan-300">Dungeon of Echoes</h3>
        <p className="text-gray-400 text-sm">A dungeon-crawler where every action generates proof-of-energy. PET-exclusive drops, PvE raids, and quantum loot mechanics await.</p>
        <button className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full">Play Now</button>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500/20 hover:shadow-cyan-500/30">
        <img src="/game2.jpg" alt="Game 2" className="rounded-md mb-4" />
        <h3 className="text-xl font-bold text-cyan-300">PET Racer X</h3>
        <p className="text-gray-400 text-sm">High-speed, high-stakes. Win races to stack SwytchCoin. Real-time betting, track ownership, and community-hosted leagues included.</p>
        <button className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full">Download</button>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500/20 hover:shadow-cyan-500/30">
        <img src="/game3.jpg" alt="Game 3" className="rounded-md mb-4" />
        <h3 className="text-xl font-bold text-cyan-300">Ascend: PET Reign</h3>
        <p className="text-gray-400 text-sm">A sci-fantasy RPG where your votes shape the lore. Storylines are decided by DAO, and PET contributors become in-game legends.</p>
        <button className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full">Watch Trailer</button>
      </div>
    </div>
  </div>

      
      <motion.div
        className="w-full h-64 rounded-xl flex items-center justify-center text-center shadow-xl relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-800 to-blue-900 opacity-70"></div>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg animate-pulse z-10 max-w-2xl">⚡ Welcome to Swytch — The Petaverse of Purpose, Power & Proof</h1>
      </motion.div>

      <section className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-xl italic text-cyan-400">“Purpose is service. And service brings freedom.”</p>
        <p className="text-gray-300">Everything from ants to stars serves a function. Swytch is designed the same way — a system built to reward contribution, not consumption. We don't exploit effort. We convert it into evolution.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {AccountSections.map((section, index) => (
          <motion.div
            key={index}
            className="bg-gray-900 border border-cyan-500/20 p-6 rounded-2xl space-y-4 shadow-md hover:shadow-cyan-500/30 transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <h3 className="text-xl font-bold text-cyan-300">{section.title}</h3>
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{section.content}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <form className="bg-gray-900 border border-cyan-500/20 p-6 rounded-xl space-y-4">
          <h3 className="text-cyan-300 font-bold text-xl">Your Wallet</h3>
          <input type="text" placeholder="Wallet Address" className="w-full p-3 bg-gray-800 text-white rounded-md" />
          <input type="number" placeholder="Amount in USDT" className="w-full p-3 bg-gray-800 text-white rounded-md" />
          <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 animate-bounce" /> Connect Wallet
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setModal('Send')} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2">
            <Send className="w-5 h-5 animate-pulse" /> Send Crypto
          </button>
          <button onClick={() => setModal('Receive')} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2">
            <ArrowRight className="w-5 h-5 animate-pulse" /> Receive Crypto
          </button>
          <button onClick={() => setModal('Swap')} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2">
            <Repeat2 className="w-5 h-5 animate-pulse" /> Swap
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modal && <Modal title={`${modal} Crypto`} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}
