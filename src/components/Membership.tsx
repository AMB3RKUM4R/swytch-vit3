import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Users, Sparkles, Rocket, Trophy,
  BookOpen, Globe, Lock, Star, CircleDollarSign, TrendingUp,
  ScrollText, ShieldCheck, Brain, BarChart2, Flashlight, 
  Heart, Zap, X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const levels = [
  { level: 1, title: 'Initiate', reward: '1.0%', energyRequired: '100 SWYT', perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'], icon: <TrendingUp className="w-6 h-6 text-rose-400" />, image: '/bg (29).jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', energyRequired: '250 SWYT', perks: ['Chatbot Assistant', 'NFT Discounts'], icon: <Star className="w-6 h-6 text-pink-400" />, image: '/bg (28).jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', energyRequired: '500 SWYT', perks: ['Quest Expansion', 'PET ID Perks'], icon: <ScrollText className="w-6 h-6 text-amber-400" />, image: '/bg (22).jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', energyRequired: '1000 SWYT', perks: ['Vault Yield Boost', 'Private Vault Channels'], icon: <ShieldCheck className="w-6 h-6 text-orange-400" />, image: '/bg (6).jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', energyRequired: '3000 SWYT', perks: ['Beta Testing Rights', 'Voting Access'], icon: <Brain className="w-6 h-6 text-pink-400" />, image: '/bg (8).jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', energyRequired: '5000 SWYT', perks: ['Early Launch Drops', 'DAO Incentives'], icon: <BarChart2 className="w-6 h-6 text-yellow-400" />, image: '/bg (9).jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', energyRequired: '7500 SWYT', perks: ['Smart Contract Access', 'NFT Mint Tools'], icon: <Flashlight className="w-6 h-6 text-violet-400" />, image: '/bg (10).jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', energyRequired: '9000 SWYT', perks: ['Legend Quests', 'Energy Bonus Boost'], icon: <Trophy className="w-6 h-6 text-lime-400" />, image: '/bg (12).jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', energyRequired: '10000 SWYT', perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'], icon: <CircleDollarSign className="w-6 h-6 text-rose-400" />, image: '/bg (11).jpg' }
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const fadeLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const fadeRight = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const scaleUp = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } };
const infiniteScroll = { animate: { x: ['0%', '-100%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } };
const dustVariants = { animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } } };

interface ModalProps { title: string; content: string; onClose: () => void; }

const Modal = ({ title, content, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900 p-8 rounded-2xl max-w-md w-full border border-rose-500/20 shadow-2xl backdrop-blur-md"
        tabIndex={-1}
      >
        <motion.button
          className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 animate-pulse" /> {title}
        </h3>
        <p className="text-gray-300 mb-6">{content}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

const SwytchMembership: React.FC = () => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const extendedLevels = [...levels, ...levels];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-black text-gray-100 overflow-hidden">
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 192}px`, left: `${mousePosition.x - 192}px` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 128}px`, left: `${mousePosition.x - 128}px` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${mousePosition.y - 50 + Math.random() * 100}px`,
              left: `${mousePosition.x - 50 + Math.random() * 100}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 211, 238, 0.5)'
            }}
            variants={dustVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div className="relative z-20 max-w-7xl mx-auto space-y-32">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center space-y-8">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4">
            <Sparkles className="w-12 h-12 animate-pulse" /> Welcome to Swytch
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Swytch is a psychological awakening, a socio-economic rebellion, and a self-sustaining ecosystem governed by PETs: People of Energy & Truth. Join us to redefine wealth, identity, and freedom.
          </p>
          <motion.button
            className="px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal('Join PETverse')}
            aria-label="Join the PETverse"
          >
            Become a PET
          </motion.button>
        </motion.div>

        <motion.div variants={fadeLeft} initial="hidden" animate="visible" className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Brain className="text-rose-400 w-12 h-12 animate-pulse" /> Psychological Shift
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              In Swytch, you’re a Beneficiary, not a user. This validates your existence as worthy of wealth, empowering you to earn through value creation.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Star className="text-pink-400 w-6 h-6" /> Active creator, not passive player</li>
              <li className="flex items-start gap-3"><Heart className="text-rose-400 w-6 h-6" /> Validated for contribution</li>
              <li className="flex items-start gap-3"><Trophy className="text-yellow-400 w-6 h-6" /> Earn through participation</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-rose-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">“You are a PET, entitled to earn.”</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeRight} initial="hidden" animate="visible" className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-2xl" />
          <div className="relative space-y-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Users className="text-pink-400 w-12 h-12 animate-pulse" /> Social Architecture
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The Community Panel is Swytch’s digital heart, where PETs vote, propose, and earn reputation without hierarchy, guided by NPCs.
            </p>
            <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
              <svg viewBox="0 0 600 400" className="w-full h-auto">
                <defs>
                  <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="600" height="400" fill="url(#communityGradient)" opacity="0.1" rx="20" />
                <circle cx="300" cy="200" r="100" fill="none" stroke="#ec4899" strokeWidth="4" />
                <text x="300" y="200" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">Community Panel</text>
                {['Voting', 'Proposals', 'Reputation', 'Quests'].map((item, i) => (
                  <g key={i} transform={`rotate(${i * 90} 300 200) translate(300 100)`}>
                    <circle r="40" fill="#22d3ee" opacity="0.3" />
                    <text textAnchor="middle" y="5" fill="#fff" fontSize="14">{item}</text>
                  </g>
                ))}
              </svg>
              <p className="text-sm text-gray-400 mt-2">Diagram: Decentralized Community Panel for voting and reputation.</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={fadeLeft} initial="hidden" animate="visible" className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <CircleDollarSign className="text-rose-400 w-12 h-12 animate-pulse" /> Economic Flow
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Earn Energy through games, convert to Swytch Stablecoin (tied to USDT), and withdraw via swytchpet.io, fueling your financial freedom.
            </p>
            <motion.div variants={fadeUp}>
              <svg viewBox="0 0 600 400" className="w-full h-auto">
                <defs>
                  <linearGradient id="economicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="600" height="400" fill="url(#economicGradient)" opacity="0.1" rx="20" />
                <g>
                  <rect x="50" y="50" width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                  <text x="100" y="80" textAnchor="middle" fill="#fff" fontSize="14">Play Games</text>
                  <path d="M150 80 L200 80" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow)" />
                  <rect x="200" y="50" width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                  <text x="250" y="80" textAnchor="middle" fill="#fff" fontSize="14">Earn Energy</text>
                  <path d="M300 80 L350 80" fill="none" stroke="#ec4899" strokeWidth="2" markerEnd="url(#arrow)" />
                  <rect x="350" y="50" width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                  <text x="400" y="80" textAnchor="middle" fill="#fff" fontSize="14">Stablecoin</text>
                  <path d="M450 80 L500 80" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow)" />
                  <rect x="500" y="50" width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                  <text x="550" y="80" textAnchor="middle" fill="#fff" fontSize="14">Withdraw</text>
                </g>
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill="#fff" />
                  </marker>
                </defs>
              </svg>
              <p className="text-sm text-gray-400 mt-2">Diagram: Energy flow from gameplay to withdrawal.</p>
            </motion.div>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-rose-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">“Energy is your currency.”</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeRight} initial="hidden" animate="visible" className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl" />
          <div className="relative space-y-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Key className="text-rose-400 w-12 h-12 animate-pulse" /> Private Membership Association
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Swytch’s PMA protects members from external interference, offering a private financial ecosphere for $10 USDT.
            </p>
            <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
              <svg viewBox="0 0 600 400" className="w-full h-auto">
                <defs>
                  <linearGradient id="pmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="600" height="400" fill="url(#pmaGradient)" opacity="0.1" rx="20" />
                <circle cx="300" cy="200" r="100" fill="none" stroke="#ec4899" strokeWidth="4" />
                <text x="300" y="200" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">PMA</text>
                <g transform="translate(100 50)">
                  <rect width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                  <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Members</text>
                </g>
                <g transform="translate(400 50)">
                  <rect width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                  <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Arbitration</text>
                </g>
                <g transform="translate(100 290)">
                  <rect width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                  <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Rights</text>
                </g>
                <g transform="translate(400 290)">
                  <rect width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                  <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Freedom</text>
                </g>
              </svg>
              <p className="text-sm text-gray-400 mt-2">Diagram: PMA structure with members, rights, and arbitration.</p>
            </motion.div>
            <button
              className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all"
              onClick={() => setShowModal('Join PMA')}
            >
              Join PMA ($10 USDT)
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <Trophy className="text-rose-400 w-12 h-12 animate-pulse" /> Levels & Rewards
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Progress through 9 levels, earning up to 3.3% monthly yield and unlocking perks like voting and NFT minting.
          </p>
          <div className="relative overflow-hidden">
            <motion.div className="flex gap-6" variants={infiniteScroll} animate="animate">
              {extendedLevels.map((tier, i) => (
                <motion.div
                  key={`${tier.level}-${i}`}
                  className="bg-gray-900/60 border border-rose-500/20 rounded-xl p-6 backdrop-blur-md min-w-[300px] hover:scale-[1.02] transition-all"
                  whileHover={{ y: -10 }}
                >
                  <img src={tier.image} alt={tier.title} className="w-16 h-16 mb-4 rounded-lg border border-rose-500/20" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-500/10 rounded-full">{tier.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Level {tier.level}: {tier.title}</h3>
                      <p className="text-sm text-rose-300">+{tier.reward} Monthly Yield</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">Required: <span className="text-white font-semibold">{tier.energyRequired}</span></p>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    {tier.perks.map((perk, j) => <li key={j}>{perk}</li>)}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <button className="mt-6 px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all">
            Deposit Energy
          </button>
        </motion.div>

        <motion.div variants={fadeRight} initial="hidden" animate="visible" className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-rose-500/10 rounded-2xl" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <BookOpen className="text-cyan-400 w-12 h-12 animate-pulse" /> Know Your Freedom
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Explore your rights in the Raziel tab, earning up to 0.3% extra yield for education.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { article: 1, text: 'All human beings are born free and equal in dignity and rights.' },
                { article: 17, text: 'Everyone has the right to own property alone or with others.' },
                { article: 19, text: 'Everyone has the right to freedom of opinion and expression.' },
                { article: 20, text: 'Everyone has the right to freedom of peaceful assembly and association.' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="text-rose-400 w-6 h-6" /> Article {item.article}
                  </h3>
                  <p className="text-gray-300">{item.text}</p>
                </motion.div>
              ))}
            </div>
            <button
              className="px-6 py-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all"
              onClick={() => setShowModal('Know Your Freedom')}
            >
              Explore Rights
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeLeft} initial="hidden" animate="visible" className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Zap className="text-rose-400 w-12 h-12 animate-pulse" /> JEWELS Energy
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              JEWELS powers Swytch, converting gameplay Energy into Stablecoin for real-world value.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-pink-400 w-6 h-6" /> Fuels financial freedom</li>
              <li className="flex items-start gap-3"><Heart className="text-rose-400 w-6 h-6" /> Transforms participation</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-rose-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">“JEWELS: Your energy, your wealth.”</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeRight} initial="hidden" animate="visible" className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-cyan-500/10 rounded-2xl" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Globe className="text-rose-400 w-12 h-12 animate-pulse" /> Decentralization Benefits
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Swytch’s decentralized platform ensures security, privacy, and community ownership.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <ShieldCheck className="text-rose-400 w-8 h-8 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">Security</h3>
                <p className="text-gray-300">Distributed nodes prevent failures.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Lock className="text-pink-400 w-8 h-8 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">Privacy</h3>
                <p className="text-gray-300">Control your data anonymously.</p>
              </motion.div>
              <motion.div className="bg-gray-800/70 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Users className="text-cyan-400 w-8 h-8 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">Ownership</h3>
                <p className="text-gray-300">Shape Swytch with votes.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" className="text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <Rocket className="text-rose-400 w-12 h-12 animate-pulse" /> Join the Rebellion
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Pay $10 USDT to become a PET and build a future where energy is currency.
          </p>
          <motion.button
            className="px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold"
            onClick={() => setShowModal('Join PETverse')}
            aria-label="Join the PETverse"
          >
            Swytch Now
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showModal === 'Join PETverse' && (
            <Modal
              title="Join the PETverse"
              content="Pay $10 USDT to become a PET, unlocking Swytch with the Omertà: 'We honor Energy. We protect Truth. We uphold the Freedom to Earn.'"
              onClose={() => setShowModal('')}
            />
          )}
          {showModal === 'Join PMA' && (
            <Modal
              title="Join the PMA"
              content="For $10 USDT, join Swytch’s PMA, accessing a private financial ecosystem protected by constitutional rights."
              onClose={() => setShowModal('')}
            />
          )}
          {showModal === 'Know Your Freedom' && (
            <Modal
              title="Know Your Freedom"
              content="Explore the Universal Declaration of Human Rights in the Raziel tab to earn up to 0.3% extra yield."
              onClose={() => setShowModal('')}
            />
          )}
        </AnimatePresence>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .blur-3xl { filter: blur(64px); }
          .blur-2xl { filter: blur(32px); }
          .bg-[url('/noise.png')] {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAZZnQ1BAACxzwv8YQUAAAAJcEhZswAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSSSO4ro0Q0v/UQk4cZJnTf90EQBF3X9UIIH8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKkVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQzCC');
            background-repeat: repeat;
            background-size: 64px 64px;
          }
        `}</style>
      </motion.div>
    </section>
  );
};

export default SwytchMembership;