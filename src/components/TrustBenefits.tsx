import { motion } from 'framer-motion';
import {
  ShieldCheck, Banknote, LockKeyhole, LibraryBig, Users, Globe2, PiggyBank, Gamepad2, Sparkles, AlertTriangle
} from 'lucide-react';
import {
  FaWallet, FaCoins, FaLock, FaGoogleWallet, FaDollarSign, FaChartPie, FaCogs
} from 'react-icons/fa';

const TrustBenefits = () => {
  const benefits = [
    {
      title: 'Increased Security',
      description: 'Data is distributed across multiple nodes, resistant to single-point failures or attacks.',
      icon: LockKeyhole,
    },
    {
      title: 'Privacy',
      description: 'Users retain control over their data, choosing to remain anonymous or share selectively.',
      icon: ShieldCheck,
    },
    {
      title: 'Transparency',
      description: 'Operates on a tamper-proof public ledger, ensuring accountability and trust.',
      icon: Banknote,
    },
    {
      title: 'Lower Costs',
      description: 'Eliminates intermediaries, reducing transaction fees and operational costs.',
      icon: PiggyBank,
    },
    {
      title: 'Community Ownership',
      description: 'A community-driven platform fosters engagement and loyalty among users.',
      icon: Users,
    },
    {
      title: 'Tax Advantages',
      description: 'Enjoy tax-deferred income, pass-through taxation, and potential capital gains treatment.',
      icon: Banknote,
    },
    {
      title: 'Energy as Currency',
      description: 'JEWELS represent earned Energy and are redeemable for services, games, NFTs, and more.',
      icon: Sparkles,
    },
    {
      title: 'Sovereign Membership',
      description: 'Members join via Private Ministerial Association (PMA), maintaining spiritual and legal sovereignty.',
      icon: ShieldCheck,
    },
    {
      title: 'Gamified Rewards System',
      description: 'Complete quests and activities to level up and increase your yield tier in the ecosystem.',
      icon: Gamepad2,
    },
    {
      title: 'Proof of Purpose',
      description: 'Energy rewards are earned through engagement, learning, and participation, not speculation.',
      icon: LibraryBig,
    },
    {
      title: 'Decentralized Vaults',
      description: 'Funds are self-custodied via smart contracts — no admin wallets, no human override.',
      icon: LockKeyhole,
    },
    {
      title: 'Smart Contracts Govern Everything',
      description: 'Swytch logic is enforced on-chain from login to distribution — code is law.',
      icon: ShieldCheck,
    },
    {
      title: 'P2P Enabled Payments',
      description: 'Use your earned crypto energy for real-world payments, services, or send to others instantly.',
      icon: Banknote,
    },
    {
      title: 'Multi-Network & Cross-Chain Ready',
      description: 'PET protocol is compatible across chains, making your identity and assets transportable.',
      icon: Globe2,
    },
  ];

  const businessModel = [
    { icon: FaDollarSign, title: 'NFT & Games Ecosystem', description: 'Market, play, and trade Swytch NFTs and P2E items with lifetime royalties and tokenized ownership.' },
    { icon: FaChartPie, title: 'Energy Rewards Engine', description: 'Earn up to 36% APY energy via yield, quizzes, and wisdom levels. Powered by JEWELS and smart contract logic.' },
    { icon: FaCogs, title: 'Trust Vault Operations', description: 'Staking, crypto swapping, DAO governance, and Web3 identity — gamified and secured with on-chain autonomy.' },
  ];

  const donts = [
    {
      title: 'Don’t Share Your Keys',
      description: 'Never share your private keys or recovery phrase. Anyone with it can steal your funds.',
    },
    {
      title: 'Avoid Unknown DApps',
      description: 'Connecting to untrusted dApps can drain your wallet through malicious contracts.',
    },
    {
      title: 'Watch for Phishing',
      description: 'Always double-check URLs and never sign messages unless you’re certain of the source.',
    },
    {
      title: 'Don’t Invest Emotionally',
      description: 'Avoid FOMO and hype cycles — always research and understand the utility of tokens.',
    },
    {
      title: 'Skip Centralized Custody',
      description: 'Holding funds in centralized exchanges can result in frozen assets or loss during hacks.',
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

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <>
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-center relative overflow-hidden">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-16"
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          Why Join Swytch’s Private Energy Trust?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/60 border border-cyan-500/10 p-6 rounded-2xl text-left shadow-xl hover:shadow-cyan-500/10 transition duration-300"
              variants={variants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <benefit.icon className="w-6 h-6 text-cyan-400 mr-3" />
                <h3 className="text-xl font-bold text-cyan-300">{benefit.title}</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Swytch Ecosphere (Business Model) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950 text-center">
        <h3 className="text-3xl sm:text-4xl font-bold text-cyan-300 mb-12">Swytch Ecosphere</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {businessModel.map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/70 p-6 rounded-xl shadow-lg border border-cyan-500/10 text-white text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={variants}
              transition={{ delay: index * 0.1 }}
            >
              <item.icon className="w-6 h-6 text-cyan-400 mb-3" />
              <h4 className="text-xl font-bold text-cyan-200 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What NOT to do section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950 text-center">
        <h3 className="text-3xl sm:text-4xl font-bold text-red-400 mb-12">What NOT to do with Crypto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {donts.map((item, idx) => (
            <div key={idx} className="bg-gray-900/70 border border-red-500/20 rounded-xl p-6 text-left shadow-md">
              <div className="flex items-center mb-4 text-red-300">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <h4 className="text-lg font-semibold">{item.title}</h4>
              </div>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Wallets & Tokens */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-center">
        <h3 className="text-4xl font-bold text-cyan-300 mb-10">Supported Wallets & Tokens (via WAGMI)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-16">
          {wallets.map((wallet, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold border border-cyan-500/10">
              <wallet.icon className="w-5 h-5 text-cyan-400" /> {wallet.name}
            </div>
          ))}
        </div>
        <h4 className="text-xl text-cyan-400 font-semibold mb-4">Tokens You Can Use</h4>
        <div className="flex flex-wrap justify-center gap-4">
          {tokens.map((token, i) => (
            <span key={i} className="bg-cyan-800/30 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-full text-sm">
              {token}
            </span>
          ))}
        </div>
      </section>
    </>
  );
};

export default TrustBenefits;
