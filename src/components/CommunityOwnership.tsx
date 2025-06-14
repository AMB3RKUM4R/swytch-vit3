import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Vote, Sparkles, Wallet, ArrowRight, X, Trophy, Heart, MessageSquare, Globe2,
  Send, Star, Rocket, ShieldCheck
} from 'lucide-react';

const daoProposals = [
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

const leaderboard = [
  { rank: 1, name: 'AstraRebel', jewels: 15000, level: 'Mythic PET', avatar: '/avatar1.jpg' },
  { rank: 2, name: 'QuantumSage', jewels: 12000, level: 'Elder', avatar: '/avatar2.jpg' },
  { rank: 3, name: 'NovaGuardian', jewels: 9000, level: 'Alchemist', avatar: '/avatar3.jpg' },
  { rank: 4, name: 'CipherOracle', jewels: 7000, level: 'Archon', avatar: '/avatar4.jpg' },
  { rank: 5, name: 'LunarSeeker', jewels: 5000, level: 'Sage', avatar: '/avatar5.jpg' },
];

const testimonials = [
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

const CommunityOwnership = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null);
  const [showVideo, setShowVideo] = useState(false);

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

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
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

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
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
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/60 to-blue-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div
              className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-6 h-6 bg-teal-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
            />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Community Ownership
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              Swytch is your Petaverse. Shape its future through voting, proposals, and contributions. Every PET’s voice fuels our decentralized revolution.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Become a PET
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Governance Explainer Video */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6 text-center"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Rocket className="w-8 h-8 text-teal-400 animate-pulse" /> How Swytch Governance Works
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover how PETs drive the Petaverse through decentralized decision-making.
          </p>
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold"
            onClick={() => setShowVideo(true)}
            whileHover={{ scale: 1.05 }}
          >
            Watch Explainer
          </motion.button>
          <AnimatePresence>
            {showVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-12"
              >
                <motion.div
                  className="bg-gray-900 rounded-xl w-full max-w-4xl relative border border-cyan-500/20 shadow-2xl backdrop-blur-lg"
                >
                  <motion.button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                    whileHover={{ rotate: 90 }}
                  >
                    <X className="w-8 h-8" />
                  </motion.button>
                  <iframe
                    src="https://www.youtube.com/embed/8cm1x4bC610" // Placeholder Web3 governance video
                    title="Swytch Governance Explainer"
                    className="w-full h-[400px] rounded-t-xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* DAO Proposal Voting Simulator */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/60 p-8 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
          <div className="relative space-y-6">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Vote className="w-8 h-8 text-cyan-400 animate-pulse" /> Live DAO Proposals
            </h3>
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
              Try voting on real-time proposals to see how PETs shape Swytch’s future.
            </p>
            <div className="space-y-6">
              {daoProposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  className="bg-gray-900/80 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
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
                            : 'bg-cyan-600 hover:bg-cyan-700'
                        }`}
                        onClick={() => handleVote(proposal.id, 'for')}
                        whileHover={{ scale: 1.05 }}
                        disabled={selectedProposal === proposal.id}
                      >
                        Vote For
                      </motion.button>
                      <motion.button
                        className={`flex-1 py-2 rounded-md font-semibold ${
                          selectedProposal === proposal.id && voteChoice === 'against'
                            ? 'bg-red-600'
                            : 'bg-cyan-600 hover:bg-cyan-700'
                        }`}
                        onClick={() => handleVote(proposal.id, 'against')}
                        whileHover={{ scale: 1.05 }}
                        disabled={selectedProposal === proposal.id}
                      >
                        Vote Against
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* PET Contribution Leaderboard */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/60 p-8 rounded-xl shadow-xl border border-teal-500/20 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-xl" />
          <div className="relative space-y-6">
            <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-teal-400 animate-pulse" /> PET Leaderboard
            </h3>
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
              Celebrate the top PETs driving Swytch’s growth with their contributions.
            </p>
            <div className="space-y-4">
              {leaderboard.map((pet) => (
                <motion.div
                  key={pet.rank}
                  className="flex items-center gap-4 bg-gray-900/80 p-4 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full border border-cyan-500/20"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold">
                      #{pet.rank} {pet.name}
                    </p>
                    <p className="text-sm text-gray-400">{pet.level}</p>
                  </div>
                  <p className="text-cyan-400 font-semibold">{pet.jewels} JEWELS</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          variants={sectionVariants}
          className="relative space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-yellow-400 animate-pulse" /> PET Voices
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Hear from PETs shaping the Petaverse with their passion and vision.
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gray-900/60 p-6 rounded-xl border border-yellow-500/20 backdrop-blur-md max-w-2xl mx-auto text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl" />
              <div className="relative">
                <p className="text-gray-300 italic mb-2">"{testimonials[currentTestimonial].quote}"</p>
                <p className="text-yellow-400 font-bold">— {testimonials[currentTestimonial].author}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Key Community Features */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-cyan-400 animate-pulse" /> Why PETs Own Swytch
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Swytch’s community-driven model empowers every PET to shape the Petaverse.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
            {[
              {
                icon: <Vote className="w-6 h-6 text-cyan-400 animate-pulse" />,
                title: 'Decentralized Governance',
                description: 'Vote on proposals, from new features to yield adjustments, using your JEWELS.',
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-teal-400 animate-pulse" />,
                title: 'Proposal Creation',
                description: 'Submit ideas for quests, planets, or rewards—your vision drives Swytch.',
              },
              {
                icon: <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />,
                title: 'Contribution Rewards',
                description: 'Earn JEWELS for active participation, from voting to content creation.',
              },
              {
                icon: <Globe2 className="w-6 h-6 text-purple-400 animate-pulse" />,
                title: 'Global Community',
                description: 'Connect with PETs worldwide, forming factions and co-creating value.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-green-400 animate-pulse" />,
                title: 'Transparent Trust',
                description: 'All governance is on-chain, ensuring fairness and accountability.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="relative bg-gray-900/60 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-md shadow-xl hover:shadow-cyan-500/40 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.02, y: -10 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
                <div className="relative flex items-center mb-4 text-cyan-400">
                  {feature.icon}
                  <h4 className="ml-3 text-xl font-bold">{feature.title}</h4>
                </div>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join the DAO CTA */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" /> Join the PETverse DAO
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Sign up to become a PET, unlock your voice in the DAO, and shape the future of Swytch.
            </p>
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                Join Now <Send className="w-5 h-5" />
              </button>
            </form>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Connect Wallet
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-cyan-300 italic text-center max-w-xl mx-auto"
        >
          Swytch is yours. Every vote, every proposal, every JEWEL shapes our decentralized future. Join the PETverse and own the revolution.
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

        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </motion.div>
    </section>
  );
};

export default CommunityOwnership;