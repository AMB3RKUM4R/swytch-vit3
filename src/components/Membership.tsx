"use client";

import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Key, Users, Sparkles, Rocket, Trophy, Star, CircleDollarSign, TrendingUp,
  ScrollText, ShieldCheck, Brain, BarChart2, Flashlight, Heart, Zap, X, Wallet, Target
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { WagmiProvider, useAccount, useBalance, useConnect, useDisconnect, useContractWrite } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { wagmiConfig } from '../lib/wagmi'; // Adjust path to your wagmiConfig file

const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // Mainnet USDT
const ENERGY_TRUST_ADDRESS = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0'; // Provided Energy Trust address

const levels = [
  { level: 1, title: 'Initiate', reward: '1.0%', energyRequired: '100 SWYT', perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'], icon: <TrendingUp className="w-6 h-6 text-neon-green" />, image: '/bg (29).jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', energyRequired: '250 SWYT', perks: ['Chatbot Assistant', 'NFT Discounts'], icon: <Star className="w-6 h-6 text-neon-green" />, image: '/bg (28).jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', energyRequired: '500 SWYT', perks: ['Quest Expansion', 'PET ID Perks'], icon: <ScrollText className="w-6 h-6 text-neon-green" />, image: '/bg (22).jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', energyRequired: '1000 SWYT', perks: ['Vault Yield Boost', 'Private Vault Channels'], icon: <ShieldCheck className="w-6 h-6 text-neon-green" />, image: '/bg (6).jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', energyRequired: '3000 SWYT', perks: ['Beta Testing Rights', 'Voting Access'], icon: <Brain className="w-6 h-6 text-neon-green" />, image: '/bg (8).jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', energyRequired: '5000 SWYT', perks: ['Early Launch Drops', 'DAO Incentives'], icon: <BarChart2 className="w-6 h-6 text-neon-green" />, image: '/bg (9).jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', energyRequired: '7500 SWYT', perks: ['Smart Contract Access', 'NFT Mint Tools'], icon: <Flashlight className="w-6 h-6 text-neon-green" />, image: '/bg (10).jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', energyRequired: '9000 SWYT', perks: ['Legend Quests', 'Energy Bonus Boost'], icon: <Trophy className="w-6 h-6 text-neon-green" />, image: '/bg (12).jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', energyRequired: '10000 SWYT', perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'], icon: <CircleDollarSign className="w-6 h-6 text-neon-green" />, image: '/bg (11).jpg' }
];

const fadeUp: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const fadeLeft: Variants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const fadeRight: Variants = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const scaleUp: Variants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } };
const infiniteScroll: Variants = { animate: { x: ['0%', '-100%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } };
const flareVariants: Variants = { animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } } };
const rewardVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } }
};

interface ModalProps { title: string; content: string; onClose: () => void; children?: React.ReactNode; }

const Modal = ({ title, content, onClose, children }: ModalProps) => {
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
        className="bg-gray-900/80 p-8 rounded-2xl max-w-md w-full border border-neon-green/20 shadow-2xl backdrop-blur-md"
        tabIndex={-1}
      >
        <motion.button
          className="absolute top-4 right-4 text-neon-green hover:text-red-500"
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h3 className="text-2xl font-bold text-purple-500 font-poppins mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-neon-green animate-pulse" /> {title}
        </h3>
        <p className="text-gray-300 font-inter mb-6">{content}</p>
        {children}
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all font-poppins"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const metaMaskConnector = connectors.find((c) => c.id === 'metaMask');
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');

  return (
    <div className="space-y-4">
      <motion.button
        onClick={() => (isConnected ? disconnect() : metaMaskConnector && connect({ connector: metaMaskConnector }))}
        className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-500 hover:bg-purple-600'
        } text-white transition-all`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isConnected ? 'Disconnect MetaMask' : 'Connect MetaMask'}
        disabled={!metaMaskConnector}
      >
        <Wallet className="w-5 h-5 text-neon-green animate-pulse" />
        {isConnected ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connect MetaMask'}
      </motion.button>
      <motion.button
        onClick={() => (isConnected ? disconnect() : walletConnectConnector && connect({ connector: walletConnectConnector }))}
        className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-500 hover:bg-purple-600'
        } text-white transition-all`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isConnected ? 'Disconnect WalletConnect' : 'Connect WalletConnect'}
        disabled={!walletConnectConnector}
      >
        <Wallet className="w-5 h-5 text-neon-green animate-pulse" />
        {isConnected ? 'Disconnect' : 'Connect WalletConnect'}
      </motion.button>
    </div>
  );
};

const SwytchMembership: React.FC = () => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMember, setIsMember] = useState(false);
  const [showReward, setShowReward] = useState<string | null>(null);
  const extendedLevels = [...levels, ...levels];
  const { address, isConnected, chain } = useAccount();
  const { data: usdtBalance } = useBalance({ address, token: USDT_ADDRESS, chainId: wagmiConfig.chains[0].id });
  const { writeContract, isPending, isSuccess, error } = useContractWrite();

  // Local Storage for Membership Status
  useEffect(() => {
    const storedMembership = localStorage.getItem('swytch_membership');
    if (storedMembership) {
      setIsMember(JSON.parse(storedMembership).isMember || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('swytch_membership', JSON.stringify({ isMember }));
  }, [isMember]);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-dismiss Reward Popup
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  // Handle Membership Payment
  const payMembership = async () => {
    if (!isConnected) {
      setShowModal('Connect Wallet');
      return;
    }
    if (chain?.id !== wagmiConfig.chains[0].id) {
      alert('Please switch to Ethereum Mainnet.');
      return;
    }
    if (usdtBalance && Number(formatUnits(usdtBalance.value, usdtBalance.decimals)) < 10) {
      alert('Insufficient USDT balance. You need at least 10 USDT.');
      return;
    }

    try {
      await writeContract({
        address: USDT_ADDRESS,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: '_to', type: 'address' },
              { name: '_value', type: 'uint256' }
            ],
            outputs: [{ type: 'bool' }],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'transfer',
        args: [ENERGY_TRUST_ADDRESS, parseUnits('10', 6)]
      });
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  // Handle Payment Success
  useEffect(() => {
    if (isSuccess) {
      setIsMember(true);
      setShowReward('Swytch PET Purchased! Welcome to the PETverse.');
      setShowModal(null);
    }
  }, [isSuccess]);

  // Handle Payment Error
  useEffect(() => {
    if (error) {
      alert(`Payment error: ${error.message}`);
    }
  }, [error]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-dark-gray via-purple-500/20 to-black text-white overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={flareVariants}
          animate="animate"
        >
          <div className="absolute w-96 h-96 bg-gradient-to-br from-neon-green/50 via-purple-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl" style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }} />
          <div className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-purple-500/30 to-neon-green/20 rounded-full opacity-20 blur-2xl" style={{ top: `${50 + mousePosition.y * 50}%`, left: `${50 + mousePosition.x * 50}%` }} />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-24"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
        >
          {/* Hero Section */}
          <motion.div variants={fadeUp} className="text-center">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-purple-500 font-poppins mb-6 flex items-center justify-center gap-4">
              <Rocket className="w-12 h-12 text-neon-green animate-pulse" /> Swytch PET Membership
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
              Join the Swytch Energy Trust as a PET to unlock AI-driven yields, exclusive gameplay rewards, and governance in our decentralized ecosystem.
            </p>
            <motion.button
              className={`mt-8 px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isMember ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
              onClick={isMember ? undefined : payMembership}
              disabled={isMember || isPending}
              whileHover={{ scale: isMember || isPending ? 1 : 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
              whileTap={{ scale: isMember || isPending ? 1 : 0.95 }}
              aria-label={isMember ? 'Already a PET' : isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT'}
            >
              {isMember ? 'PET Member' : isPending ? 'Processing...' : 'Buy Swytch PET for $10 USDT'}
            </motion.button>
          </motion.div>

          {/* Gameplay Rewards */}
          <motion.div variants={fadeUp}>
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-neon-green/20 shadow-2xl hover:shadow-neon-green/40 transition-all">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3 mb-6 font-poppins">
                <Target className="w-8 h-8 text-neon-green animate-pulse" /> Gameplay Rewards
              </h3>
              <p className="text-lg text-gray-300 mb-6 font-inter">
                Earn JEWELS through daily quests, Energy Vault interactions, and referrals. Convert JEWELS to SWYT, our stablecoin, to fuel your decentralized financial journey or swap for USDT.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-neon-green/20">
                  <p className="text-white font-semibold font-poppins">Daily Quests</p>
                  <p className="text-sm text-gray-400 font-inter">Complete tasks like viewing transactions or sharing referrals to earn JEWELS and XP.</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-neon-green/20">
                  <p className="text-white font-semibold font-poppins">Energy Vault</p>
                  <p className="text-sm text-gray-400 font-inter">Click the vault daily to collect JEWELS, powering your PET progression.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Membership Levels */}
          <motion.div variants={fadeLeft}>
            <h3 className="text-3xl font-bold text-white flex items-center gap-3 mb-6 font-poppins">
              <Trophy className="w-8 h-8 text-neon-green animate-pulse" /> Membership Levels
            </h3>
            <p className="text-lg text-gray-300 mb-6 font-inter">
              Progress through PET levels by earning SWYT via gameplay and arbitrage, unlocking higher yields and exclusive perks.
            </p>
            <div className="relative overflow-hidden">
              <motion.div
                className="flex space-x-6"
                variants={infiniteScroll}
                animate="animate"
              >
                {extendedLevels.map((level, index) => (
                  <motion.div
                    key={`${level.level}-${index}`}
                    className="min-w-[250px] bg-gray-900/50 p-6 rounded-lg border border-neon-green/20 hover:shadow-neon-green/30 transition-all backdrop-blur-md"
                    style={{ backgroundImage: `url(${level.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-gray/80 rounded-lg" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        {level.icon}
                        <h4 className="text-xl font-bold text-white font-poppins">{level.title}</h4>
                      </div>
                      <p className="text-neon-green font-semibold font-poppins">{level.reward} Monthly Yield</p>
                      <p className="text-gray-400 text-sm font-inter">{level.energyRequired} Required</p>
                      <ul className="mt-4 space-y-2 text-gray-300 text-sm font-inter">
                        {level.perks.map((perk, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-neon-green" /> {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={fadeRight}>
            <h3 className="text-3xl font-bold text-white flex items-center gap-3 mb-6 font-poppins">
              <Heart className="w-8 h-8 text-neon-green animate-pulse" /> PET Benefits
            </h3>
            <p className="text-lg text-gray-300 mb-6 font-inter">
              As a Swytch PET, you gain access to exclusive rewards, voting rights, and a vibrant community driving decentralized finance and gaming.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Key className="w-6 h-6 text-neon-green" />, title: 'Exclusive Access', desc: 'Unlock private channels, beta features, and premium content.' },
                { icon: <Users className="w-6 h-6 text-neon-green" />, title: 'Community Governance', desc: 'Vote on platform upgrades and shape the Swytch ecosystem.' },
                { icon: <Zap className="w-6 h-6 text-neon-green" />, title: 'AI-Driven Yields', desc: 'Earn up to 3.3% monthly yield through AI-powered arbitrage.' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-gray-900/50 rounded-lg border border-neon-green/20 hover:shadow-neon-green/30 transition-all backdrop-blur-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {benefit.icon}
                    <p className="text-white font-semibold font-poppins">{benefit.title}</p>
                  </div>
                  <p className="text-gray-400 text-sm font-inter">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Wallet Info */}
          <motion.div variants={fadeUp} className="text-center text-sm text-neon-green italic font-mono">
            <p>
              🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
              🔗 Network: {chain?.name || 'Unknown'} | 
              💼 Status: {isMember ? 'PET Member' : 'Non-Member'}
            </p>
          </motion.div>

          {/* Final CTA */}
          <motion.div variants={scaleUp} className="text-center">
            <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 mb-6 font-poppins">
              <Sparkles className="w-10 h-10 text-neon-green animate-pulse" /> Join the PETverse
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 font-inter">
              Become a Swytch PET for just $10 USDT (₹830) to access exclusive gameplay, earn JEWELS, and power your decentralized financial journey.
            </p>
            <motion.button
              className={`px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isMember ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
              onClick={isMember ? undefined : payMembership}
              disabled={isMember || isPending}
              whileHover={{ scale: isMember || isPending ? 1 : 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
              whileTap={{ scale: isMember || isPending ? 1 : 0.95 }}
              aria-label={isMember ? 'Already a PET' : isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT'}
            >
              {isMember ? 'PET Member' : isPending ? 'Processing...' : 'Buy Swytch PET for $10 USDT'}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showModal === 'Connect Wallet' && (
            <Modal
              title="Connect to the Vault"
              content="Connect your wallet to join the Swytch Energy Trust and start earning rewards."
              onClose={() => setShowModal(null)}
            >
              <ConnectWalletButton />
            </Modal>
          )}
          {showModal === 'Learn More' && (
            <Modal
              title="About Swytch PET"
              content="Swytch PET Membership grants access to AI-driven yields, exclusive gameplay, and governance in our decentralized ecosystem. Earn JEWELS through quests and vault interactions, and convert to SWYT for trading or USDT."
              onClose={() => setShowModal(null)}
            />
          )}
        </AnimatePresence>

        {/* Reward Popup */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              variants={rewardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-20 right-4 max-w-sm w-full bg-gray-900 border border-neon-green/20 rounded-xl shadow-2xl p-4 backdrop-blur-lg z-50"
            >
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-neon-green animate-pulse" />
                <div>
                  <p className="text-white font-bold font-poppins">{showReward}</p>
                  <p className="text-sm text-gray-300 font-inter">Welcome to the Swytch Energy Trust!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

       
      </section>
    </WagmiProvider>
  );
};

export default SwytchMembership;