import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ChevronDown, Wallet, ArrowRight, X, Sparkles, Zap, Gift, ShieldCheck, BookOpen } from 'lucide-react';

const tokenData = [
  {
    icon: '/icon_energy.gif',
    title: 'JEWELS = Pure Energy',
    description: 'Earn JEWELS through deposits, education, and engagement. They’re your proof-of-purpose, unlocking the Swytch ecosystem’s full potential.'
  },
  {
    icon: '/icon_swap.gif',
    title: 'Stable Value, Zero Volatility',
    description: 'JSIT, FDMT, and SWYT tokens are pegged at $1, ensuring accessibility and shielding you from crypto market chaos.'
  },
  {
    icon: '/icon_reward.gif',
    title: '3.3% Monthly Yield',
    description: 'Earn up to 3.3% monthly yield based on your PET level and activity—no staking, no lock-ups, just pure rewards.'
  },
  {
    icon: '/icon_learning.gif',
    title: 'Knowledge Fuels Wealth',
    description: 'Master quests in the Raziel Library to boost your yield tier. Your learning becomes your stake in the Petaverse.'
  },
  {
    icon: '/icon_privacy.gif',
    title: 'Sovereign by Design',
    description: 'Swytch never touches your funds. Smart contracts ensure transparent rewards. Your keys, your vault, your freedom.'
  },
  {
    icon: '/icon_nft.gif',
    title: 'Identity as Power',
    description: 'Your on-chain PET identity reflects your contributions, unlocking exclusive perks, games, and narrative progression.'
  },
  {
    icon: '/icon_vault.gif',
    title: 'Private PET Vaults',
    description: 'Every user commands a smart contract-based PET Vault, securing and growing your Energy autonomously.'
  },
  {
    icon: '/icon_decentralized.gif',
    title: 'Code-Driven Economy',
    description: 'No central control. Every swap, yield, and transaction is governed by immutable smart contracts.'
  },
  {
    icon: '/icon_equalizer.gif',
    title: 'Wealth for All',
    description: 'No whales, no gatekeepers. Rewards are earned through merit and intent, redefining wealth by contribution.'
  },
  {
    icon: '/icon_freedom.gif',
    title: 'Energy is Freedom',
    description: 'Every action—play, learn, share—generates Energy, exchangeable for assets, missions, or real-world value.'
  }
];

const pieData = [
  { name: 'JEWELS Rewards Pool', value: 40 },
  { name: 'Platform Growth & Development', value: 35 },
  { name: 'Educational Incentives', value: 25 },
];

const COLORS = ['#00FFFF', '#38BDF8', '#6366F1'];

const barData = [
  { name: '2020', value: 159 },
  { name: '2021', value: 180 },
  { name: '2022', value: 198 },
  { name: '2023', value: 229 },
  { name: '2024', value: 265 },
];

const faqs = [
  {
    question: 'How do JEWELS differ from typical crypto tokens?',
    answer: 'JEWELS are earned through purposeful action—deposits, learning, and engagement—not speculation. They hold utility across the Swytch ecosystem and beyond.'
  },
  {
    question: 'What’s the monthly reward rate?',
    answer: 'Yields range from 1% to 3.3% monthly, scaling with your PET level and active participation.'
  },
  {
    question: 'Do I need to stake to earn rewards?',
    answer: 'No staking or lock-ups required. Rewards flow from your deposits, educational quests, and gaming activity.'
  },
  {
    question: 'Is Swytch’s tokenomics legally sound?',
    answer: 'Absolutely. Built on Private Ministerial Association (PMA) principles, Swytch operates under private trust law, outside public investment frameworks.'
  },
];

const testimonials = [
  {
    quote: 'Swytch turned my gaming hours into real rewards. In six months, I earned more than two years of HODLing!',
    author: 'Nina, Austin, TX'
  },
  {
    quote: 'Swytch’s focus on energy and sovereignty reshaped my financial mindset. It’s wealth with purpose.',
    author: 'Ravi, Mumbai'
  },
  {
    quote: 'From Web3 newbie to active earner, Swytch made it safe and rewarding to dive in.',
    author: 'Julia, Berlin'
  },
];

const earningsYearly = 100 * (1 + 0.033) ** 12;

const Tokenomics = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Tokenomics
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              A sustainable economy powered by purpose, not speculation. Your contributions fuel rewards, secured by smart contracts.
            </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
            >
              Join the Economy
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Tokenomics Features */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left"
        >
          {tokenData.map((token, i) => (
            <motion.div
              key={i}
              className="relative bg-gray-900/60 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-md shadow-xl hover:shadow-cyan-500/40 transition-all"
              variants={sectionVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
              <div className="relative flex items-center mb-4 text-cyan-400">
                <img src={token.icon} alt="icon" className="w-8 h-8 mr-3 rounded-md animate-pulse" />
                <h3 className="text-xl font-bold">{token.title}</h3>
              </div>
              <p className="text-gray-300 text-sm">{token.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Token Allocation Chart */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Token Allocation
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Transparent distribution fuels rewards, growth, and education in the Swytch ecosystem.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#ccc' }}
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #00FFFF', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Global Gaming Industry Growth Chart */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Gift className="w-8 h-8 text-teal-400 animate-pulse" /> Gaming Industry Growth ($B)
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Swytch taps into the booming global gaming market, projected to grow exponentially.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #00FFFF', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#00FFFF" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400 animate-pulse" /> Real Impact Stories
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            PETs worldwide are transforming their financial futures with Swytch.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="relative bg-gray-900/60 p-6 rounded-xl border border-yellow-500/20 backdrop-blur-md shadow-xl hover:shadow-yellow-500/40 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl" />
                <div className="relative">
                  <p className="text-gray-300 italic mb-2">"{testimonial.quote}"</p>
                  <p className="text-yellow-400 font-bold">— {testimonial.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-400 animate-pulse" /> Tokenomics FAQ
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Get answers to the most common questions about Swytch’s economic model.
          </p>
          <div className="max-w-3xl mx-auto text-left space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  className="w-full flex justify-between items-center text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <h4 className="text-lg text-cyan-300 font-semibold">Q: {faq.question}</h4>
                  <ChevronDown className={`w-6 h-6 text-cyan-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-gray-300 mt-2"
                    >
                      A: {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Donation & Investment */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Gift className="w-8 h-8 text-teal-400 animate-pulse" /> Back the Petaverse
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Support Swytch’s decentralized future and unlock early backer rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              <img src="/qr_donation.png" alt="Donate to Swytch" className="w-40 h-40 rounded-lg border border-cyan-500/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-lg" />
            </motion.div>
            <motion.form
              className="relative bg-gray-900/60 p-6 max-w-xl w-full rounded-xl border border-cyan-500/20 backdrop-blur-md space-y-4"
              whileHover={{ scale: 1.03 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl" />
              <div className="relative">
                <h4 className="text-cyan-400 font-bold text-xl mb-2">Invest in Swytch</h4>
                <input
                  type="text"
                  placeholder="Your Wallet Address"
                  className="w-full p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Amount in USDT"
                  className="w-full p-3 mt-3 bg-gray-900 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500"
                />
                <button
                  className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
                  onClick={(e) => { e.preventDefault(); setShowWalletModal(true); }}
                >
                  Submit Investment
                </button>
              </div>
            </motion.form>
          </div>
        </motion.div>

        {/* Earnings Projection */}
        <motion.div
          variants={sectionVariants}
          className="space-y-6 text-center"
        >
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Your Potential
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Deposit <span className="text-cyan-400 font-semibold">$100</span> at <span className="text-cyan-400 font-semibold">3.3% monthly</span>...
          </p>
          <p className="text-2xl font-bold text-cyan-300">
            Grow to ≈ ${earningsYearly.toFixed(2)} by year’s end!
          </p>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={sectionVariants}
          className="text-sm text-cyan-300 italic text-center max-w-xl mx-auto"
        >
          Note: Swytch’s tokenomics align with PMA principles and decentralized trust. Always self-custody. Always opt-in.
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
    </section>
  );
};

export default Tokenomics;