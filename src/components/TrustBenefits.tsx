import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Banknote, LockKeyhole, LibraryBig, Users, Globe2, PiggyBank, Gamepad2, Sparkles, AlertTriangle, Wallet, ArrowRight, X
} from 'lucide-react';
import {
  FaWallet, FaCoins, FaLock, FaGoogleWallet, FaDollarSign, FaChartPie, FaCogs
} from 'react-icons/fa';

// Data
const benefits = [
  {
    title: 'Unbreakable Security',
    description: 'Your assets live on a decentralized network of nodes, immune to hacks, outages, or centralized failures. Smart contracts enforce rules without human interference.',
    details: 'Swytch PET leverages blockchain’s immutability and Avalanche’s high-throughput consensus to ensure your JEWELS and SWYT are safe. No single point of failure can compromise your Energy Vault.',
    icon: LockKeyhole,
  },
  {
    title: 'Absolute Privacy',
    description: 'You hold the keys to your data, choosing full anonymity or selective sharing. No third party can access your identity or transactions without your consent.',
    details: 'Using zero-knowledge proofs and self-custodial wallets, Swytch PET ensures your financial and spiritual journey remains private. Share only what you want, when you want, via WAGMI-integrated DApps.',
    icon: ShieldCheck,
  },
  {
    title: 'Crystal Transparency',
    description: 'Every transaction, quest, and reward is logged on a public ledger, verifiable by anyone, ensuring trust without reliance on intermediaries.',
    details: 'The Avalanche blockchain records all Swytch PET actions—swaps, stakes, or JEWELS claims—in real time. Explore the ledger to see how your Energy fuels the Petaverse’s 3.3% monthly yield.',
    icon: Banknote,
  },
  {
    title: 'Minimal Costs',
    description: 'By cutting out middlemen, Swytch PET offers low gas fees and operational costs, maximizing your Energy’s value.',
    details: 'Avalanche’s low-cost transactions and optimized smart contracts keep fees under $0.01 for most actions. Your JEWELS and SWYT go further, whether trading NFTs or staking in the Energy Vault.',
    icon: PiggyBank,
  },
  {
    title: 'Community Power',
    description: 'A DAO-driven ecosystem lets PETs vote on features, rewards, and growth, fostering loyalty and shared ownership.',
    details: 'Stake SWYT to join the Swytch DAO, where your vote shapes quests, yield tiers, and partnerships. The Petaverse thrives on collective wisdom, not top-down control.',
    icon: Users,
  },
  {
    title: 'Tax Efficiency',
    description: 'Enjoy tax-deferred income, pass-through taxation, and potential capital gains through tokenized Energy assets.',
    details: 'JEWELS and SWYT are structured as utility tokens, potentially reducing tax burdens in compliant jurisdictions. Consult a tax advisor to optimize your Petaverse earnings.',
    icon: Banknote,
  },
  {
    title: 'Energy as Wealth',
    description: 'JEWELS represent your earned Energy, redeemable for NFTs, games, services, or real-world value in the Petaverse.',
    details: 'Earn JEWELS through quests, check-ins, or staking in the Energy Vault. Redeem them for exclusive NFTs, game boosts, or P2P payments, turning your effort into tangible wealth.',
    icon: Sparkles,
  },
  {
    title: 'Sovereign Identity',
    description: 'Join via a Private Member Association (PMA), securing your autonomy outside traditional systems while protecting your spiritual and legal rights.',
    details: 'Swytch PET’s PMA framework lets you operate as a sovereign PET, free from centralized oversight. Your wallet is your passport to the Petaverse’s decentralized future.',
    icon: ShieldCheck,
  },
  {
    title: 'Gamified Growth',
    description: 'Level up through quests, achievements, and wisdom tiers to unlock higher yields and exclusive Petaverse rewards.',
    details: 'Complete daily quests like “View Transactions” or “Share Referral” to earn JEWELS and XP. Higher wisdom levels boost your Energy Vault yield, up to 36% APY at Mythic PET status.',
    icon: Gamepad2,
  },
  {
    title: 'Purpose-Driven Rewards',
    description: 'Earn Energy through learning, contribution, and engagement, not speculation or luck, aligning wealth with wisdom.',
    details: 'Swytch PET rewards active PETs with JEWELS for completing educational quests or contributing to the DAO. Your growth in the Petaverse reflects your real-world impact.',
    icon: LibraryBig,
  },
  {
    title: 'Self-Custodied Vaults',
    description: 'Your funds are locked in audited smart contracts, inaccessible to admins or external actors, ensuring true ownership.',
    details: 'The Energy Vault uses multi-signature contracts audited by top firms. Only your wallet can withdraw JEWELS or SWYT, giving you full control over your Energy.',
    icon: LockKeyhole,
  },
  {
    title: 'Code as Law',
    description: 'Smart contracts govern every action—logins, payouts, quests—enforcing fairness and eliminating trust in humans.',
    details: 'Swytch PET’s contracts, written in Solidity, automate yields, referrals, and governance. Verified on Etherscan, they ensure every PET gets their fair share, no exceptions.',
    icon: ShieldCheck,
  },
  {
    title: 'P2P Freedom',
    description: 'Use JEWELS or SWYT for instant payments, peer-to-peer transfers, or real-world purchases within the Petaverse ecosystem.',
    details: 'Pay for services, trade NFTs, or send SWYT to friends with near-zero fees. Swytch PET integrates with DeFi protocols for seamless, borderless transactions.',
    icon: Banknote,
  },
  {
    title: 'Cross-Chain Freedom',
    description: 'The PET protocol spans EVM chains, letting you move assets and identity across Avalanche, Polygon, and more.',
    details: 'WAGMI integration ensures your wallet and JEWELS work on multiple chains. Bridge SWYT to Polygon for NFT trades or stake on Optimism for extra yield, all while keeping your PET identity.',
    icon: Globe2,
  },
];

const businessModel = [
  {
    icon: FaDollarSign,
    title: 'NFT & Game Marketplace',
    description: 'Trade exclusive Swytch NFTs and play-to-earn (P2E) items, with royalties and lifetime value tokenized for creators and PETs.',
    details: 'Mint Vault Guardian NFTs to boost your Energy Vault yield or trade them on the Swytch marketplace. P2E games like “PET Quest” reward JEWELS for skill, not chance, with royalties paid in SWYT.',
  },
  {
    icon: FaChartPie,
    title: 'Energy Yield System',
    description: 'Earn up to 36% APY on JEWELS through gamified quests, wisdom levels, and AI-driven staking rewards in the Energy Vault.',
    details: 'Stake SWYT in the Energy Vault to earn JEWELS, with yields tied to your PET level (e.g., 3.3% monthly at Mythic). AI-powered arbitrage across Uniswap, SushiSwap, and Curve maximizes returns.',
    
  },
  {
    icon: FaCogs,
    title: 'Decentralized Operations',
    description: 'From staking to DAO governance, every Swytch PET action is on-chain, gamified, and secured by smart contracts.',
    details: 'Vote on new quests or yield tiers in the Swytch DAO using SWYT. Swap tokens, stake assets, or manage your Web3 identity via WAGMI, all powered by Avalanche’s Subnet architecture.',
    
  },
];

const donts = [
  {
    title: 'Never Share Keys',
    description: 'Your private keys or recovery phrase are your vault’s only access. Sharing them risks losing all JEWELS, SWYT, and NFTs forever.',
    details: 'Use a hardware wallet like Ledger to store keys offline. Never enter your seed phrase on websites, even if they mimic MetaMask or Swytch PET.',
  },
  {
    title: 'Avoid Shady DApps',
    description: 'Malicious DApps can trick you into signing contracts that drain your wallet or steal your Energy.',
    details: 'Check DApp permissions before connecting your wallet. Use trusted platforms like Swytch PET, verified by the community, and revoke approvals via Etherscan if unsure.',
  },
  {
    title: 'Beware Phishing Scams',
    description: 'Fake websites or messages can mimic Swytch PET to steal your keys or funds. Always verify URLs and signatures.',
    details: 'Bookmark swytch.io and check for HTTPS. Never sign wallet prompts from unsolicited DMs or emails, even if they claim to be Swytch support.',
  },
  {
    title: 'Stay Rational',
    description: 'Hype and FOMO can lead to bad investments. Research token utility and project fundamentals before committing Energy.',
    details: 'Swytch PET’s JEWELS and SWYT have clear utility (quests, NFTs, yields). Avoid tokens with no use case or projects promising unrealistic gains.',
  },
  {
    title: 'Ditch Centralized Custody',
    description: 'Exchanges like Coinbase or Binance can freeze or lose your funds during hacks, outages, or regulatory actions.',
    details: 'Move JEWELS and SWYT to a self-custodial wallet like MetaMask or Trust Wallet. Swytch PET’s smart contracts ensure you, not a CEO, control your Energy.',
  },
];

const wallets = [
  { name: 'MetaMask', icon: FaWallet },
  { name: 'Rainbow', icon: FaGoogleWallet },
  { name: 'Trust Wallet', icon: FaWallet },
  { name: 'Coinbase Wallet', icon: FaCoins },
  { name: 'Ledger', icon: FaLock },
  { name: 'Safe (Gnosis)', icon: FaLock },
  { name: 'WalletConnect', icon: FaWallet },
  { name: 'Taho', icon: FaWallet },
  { name: 'Zerion', icon: FaWallet },
  { name: 'OKX Wallet', icon: FaWallet },
];

const tokens = [
  'ETH', 'USDT', 'DAI', 'MATIC', 'BNB', 'AVAX', 'OP', 'ARB', 'FTM', 'JEWELS', 'FDMT', 'SWYT'
];

// Component
const TrustBenefits: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Animation Variants
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
    animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } } }
  };

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Infinite Scroll Effect
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

  // Modal Accessibility
  useEffect(() => {
    if (showWalletModal && modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowWalletModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showWalletModal]);

  // Toggle Expanded Benefit
  const toggleBenefit = (title: string) => {
    setExpandedBenefit(expandedBenefit === title ? null : title);
  };

  // Wallet Connect Handler
  const handleWalletConnect = (wallet: string) => {
    alert(`Connecting ${wallet}...`);
    setShowWalletModal(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.08)_0%,_transparent_70%)] pointer-events-none" />
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-8">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> Why Swytch PET?
            </motion.h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              The Swytch Private Energy Trust (PET) is your path to financial and spiritual sovereignty. Harness decentralized technology, earn JEWELS through gamified quests, and shape a future where your Energy is your wealth.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built on Avalanche, Swytch PET combines AI-driven yields, NFT marketplaces, and DAO governance to empower PETs—Private Energy Traders—in a trustless, transparent Petaverse.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
              aria-label="Join the Swytch Private Energy Trust"
            >
              Join the Petaverse
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section with Infinite Scroll */}
      <section className="relative py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <ShieldCheck className="w-10 h-10 text-rose-400 animate-pulse" /> PET Benefits
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Swytch PET redefines wealth by aligning your Energy—your time, effort, and wisdom—with decentralized freedom. Explore the pillars that make the Petaverse a sovereign ecosystem.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...benefits, ...benefits].map((benefit, i) => (
                <motion.div
                  key={`${benefit.title}-${i}`}
                  className="flex-shrink-0 w-[320px] bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/40 transition-all backdrop-blur-md cursor-pointer"
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => toggleBenefit(benefit.title)}
                  role="button"
                  aria-expanded={expandedBenefit === benefit.title}
                  aria-label={`Toggle details for ${benefit.title}`}
                >
                  <div className="flex items-center mb-4 text-rose-400">
                    <benefit.icon className="w-8 h-8 mr-3 animate-pulse" />
                    <h4 className="text-xl font-bold">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{benefit.description}</p>
                  <AnimatePresence>
                    {expandedBenefit === benefit.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-gray-400"
                      >
                        {benefit.details}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Swytch Ecosphere (Business Model) */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gradient-to-b from-gray-950 to-black text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <FaCogs className="w-10 h-10 text-pink-400 animate-spin-slow" /> Swytch Ecosphere
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            The Petaverse is a decentralized universe where NFTs, yields, and governance converge. Your Energy fuels a self-sustaining economy, powered by Avalanche and WAGMI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {businessModel.map((item, index) => (
              <motion.div
                key={index}
                className="relative bg-gray-900/60 p-8 rounded-xl shadow-xl border border-pink-500/20 backdrop-blur-md"
                variants={sectionVariants}
                whileHover={{ scale: 1.03 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl" />
                <div className="relative space-y-4">
                  <item.icon className="w-8 h-8 text-pink-400 animate-pulse" />
                  <h4 className="text-xl font-bold text-pink-300">{item.title}</h4>
                  <p className="text-sm text-gray-300">{item.description}</p>
                  <p className="text-sm text-gray-400">{item.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* What NOT to do Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-red-400 flex items-center justify-center gap-4">
            <AlertTriangle className="w-10 h-10 animate-pulse" /> Crypto Pitfalls to Avoid
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            The Petaverse empowers you, but crypto’s wild west has traps. Learn these pitfalls to protect your JEWELS, SWYT, and sovereignty.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {donts.map((item, idx) => (
              <motion.div
                key={idx}
                className="relative bg-gray-900/60 border border-red-500/20 rounded-xl p-6 shadow-xl backdrop-blur-md"
                variants={sectionVariants}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center text-red-300">
                    <AlertTriangle className="w-6 h-6 mr-3 animate-pulse" />
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                  </div>
                  <p className="text-sm text-gray-300">{item.description}</p>
                  <p className="text-sm text-gray-400">{item.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Supported Wallets & Tokens */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gradient-to-b from-black to-gray-950 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-12"
        >
          <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <Wallet className="w-10 h-10 text-rose-400 animate-pulse" /> Supported Wallets & Tokens
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Swytch PET integrates with WAGMI for seamless wallet connections and supports a range of tokens across EVM chains. Your Energy, your choice.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {wallets.map((wallet, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 p-4 rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold border border-rose-500/20 backdrop-blur-md"
                whileHover={{ scale: 1.05 }}
              >
                <wallet.icon className="w-6 h-6 text-rose-400 animate-pulse" /> {wallet.name}
              </motion.div>
            ))}
          </div>
          <h4 className="text-xl font-semibold text-rose-400 mb-4">Supported Tokens</h4>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-6">
            Use native tokens like JEWELS and SWYT for Petaverse actions, or bridge stablecoins and EVM tokens for flexibility.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {tokens.map((token, i) => (
              <motion.span
                key={i}
                className="bg-rose-800/50 border border-rose-400 text-rose-200 px-4 py-2 rounded-full text-sm"
                whileHover={{ scale: 1.1 }}
              >
                {token}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 bg-gray-950 text-center">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-pink-500/20 shadow-2xl hover:shadow-pink-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl" />
          <div className="relative space-y-8">
            <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-pink-400 animate-pulse" /> Ignite Your Sovereignty
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              The Swytch Private Energy Trust is more than a platform—it’s a rebellion against centralized control. Earn JEWELS, govern the Petaverse, and build wealth on your terms.
            </p>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Start today. Connect your wallet, claim your first quest, and become a PET in a decentralized future where your Energy is your power.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group"
              onClick={() => setShowWalletModal(true)}
              whileHover={{ scale: 1.05 }}
              aria-label="Join the Swytch Private Energy Trust"
            >
              Become a PET
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-rose-500/20 shadow-2xl backdrop-blur-lg"
              tabIndex={-1}
            >
              <motion.button
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
                whileHover={{ rotate: 90 }}
                aria-label="Close modal"
              >
                <X className="w-8 h-8" />
              </motion.button>
              <h3 id="modal-title" className="text-3xl font-bold text-rose-400 mb-6 flex items-center gap-3">
                <Wallet className="w-8 h-8 animate-pulse" /> Connect to Swytch
              </h3>
              <div className="space-y-4">
                <motion.button
                  className="w-full p-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWalletConnect('MetaMask')}
                >
                  <FaWallet className="w-5 h-5" /> Connect MetaMask
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-pink-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWalletConnect('WalletConnect')}
                >
                  <FaWallet className="w-5 h-5" /> Connect WalletConnect
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWalletConnect('New Wallet')}
                >
                  <FaWallet className="w-5 h-5" /> Create New Wallet
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
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
          button:focus, .cursor-pointer:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
          }
          @media (prefers-reduced-motion) {
            .animate-pulse, .animate-spin-slow, [data-animate] {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default TrustBenefits;