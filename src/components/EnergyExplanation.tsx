import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Bolt, ShieldCheck, BookOpen, Landmark, Scale, Zap, FileText, Wallet, Sparkles, Trophy, Star, ArrowRight } from 'lucide-react';
import throttle from 'lodash.throttle';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Confetti from 'react-confetti';

// Interfaces
interface RewardTier {
  id: number;
  title: string;
  reward: string;
  requirement: string;
  image: string;
}

const rewardTiers: RewardTier[] = [
  { id: 1, title: 'Initiate', reward: '1.0% Monthly', requirement: 'Basic Activity', image: '/bg (29).jpg' },
  { id: 2, title: 'Apprentice', reward: '1.3% Monthly', requirement: '$500 Deposit', image: '/bg (28).jpg' },
  { id: 3, title: 'Seeker', reward: '1.6% Monthly', requirement: '$1000 Deposit', image: '/bg (22).jpg' },
  { id: 4, title: 'Guardian', reward: '1.9% Monthly', requirement: '$2500 Deposit', image: '/bg (6).jpg' },
  { id: 5, title: 'Sage', reward: '2.2% Monthly', requirement: '$5000 Deposit + Raziel Quests', image: '/bg (8).jpg' },
  { id: 6, title: 'Archon', reward: '2.5% Monthly', requirement: '$10000 Deposit + Full Raziel', image: '/bg (9).jpg' },
  { id: 7, title: 'Alchemist', reward: '2.8% Monthly', requirement: '$25000 Deposit', image: '/bg (10).jpg' },
  { id: 8, title: 'Elder', reward: '3.1% Monthly', requirement: '$50000 Deposit', image: '/bg (12).jpg' },
  { id: 9, title: 'Mythic PET', reward: '3.3% Monthly', requirement: '$100000 Deposit + Full Raziel', image: '/bg (11).jpg' },
];

const EnergyExplanation: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(true);
  const [jewels, setJewels] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const orbitVariants = {
    animate: { rotate: 360, transition: { duration: 15, repeat: Infinity, ease: 'linear' } },
  };

  const infiniteScroll = {
    animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } },
  };

  const particleVariants = {
    animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  };

  // Throttled Parallax effect
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Fetch JEWELS balance
  useEffect(() => {
    const fetchJewels = async () => {
      if (isConnected && address) {
        try {
          const userRef = doc(db, 'users', address);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setJewels(userSnap.data().jewels || 0);
          } else {
            await setDoc(userRef, { jewels: 0, WalletBalance: 0, updatedAt: serverTimestamp() }, { merge: true });
            setJewels(0);
          }
        } catch (err) {
          console.error('Failed to fetch JEWELS:', err);
        }
      }
    };
    fetchJewels();
  }, [address, isConnected]);

  // Infinite scroll with pause on hover
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !isScrolling) return;

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
  }, [isScrolling]);

  // Handle tier unlock
  const handleUnlockTier = useCallback(
    async (tier: RewardTier) => {
      if (!isConnected || !address) {
        alert('Please connect your wallet to unlock a tier.');
        setWalletModalOpen(true);
        return;
      }
      const minDeposit = tier.requirement.includes('Deposit')
        ? parseFloat(tier.requirement.match(/\$([\d,]+)/)?.[1].replace(',', '') || '0')
        : 0;
      const jewelCost = minDeposit * 10; // 1 INR = 10 JEWELS, assuming $1 = 100 INR
      if (jewels < jewelCost) {
        alert(`You need at least ${jewelCost} JEWELS to unlock ${tier.title} tier.`);
        return;
      }
      try {
        const userRef = doc(db, 'users', address);
        await setDoc(userRef, { jewels: jewels - jewelCost, WalletBalance: minDeposit, updatedAt: serverTimestamp() }, { merge: true });
        setJewels(jewels - jewelCost);
        const audio = new Audio('/audio/unlock.mp3');
        audio.play().catch((err) => console.error('Audio playback failed:', err));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        alert(`Unlocked ${tier.title} tier! ${jewelCost} JEWELS deducted.`);
      } catch (err) {
        console.error('Unlock error:', err);
        alert('Failed to unlock tier. Please try again.');
      }
    },
    [address, isConnected, jewels]
  );

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      {/* Lens Flare and Noise Overlay */}
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 bg-repeat bg-[length:64px_64px]" />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 211, 238, 0.5)',
            }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div
        className="relative z-20 max-w-7xl mx-auto space-y-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Parallax and Orbiting Particles */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div
              className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50"
              animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
            />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-rose-400 tracking-tight flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" aria-hidden="true" /> What is Energy?
            </motion.h2>
            <motion.p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              In Swytch, Energy is your sovereign signal—a bridge between effort and value. Measured in JEWELS, it powers your digital existence, tracks your contributions, and honors your time.
            </motion.p>
            {isConnected && (
              <p className="text-gray-300 text-center">
                Your JEWELS: <span className="font-bold text-rose-400">{jewels} JEWELS</span>
              </p>
            )}
            <motion.button
              onClick={() => setWalletModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group focus:outline-none focus:ring-2 focus:ring-rose-500"
              whileHover={{ scale: 1.05 }}
              aria-label="Explore Your Freedom"
            >
              Explore Your Freedom
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Sections */}
        <motion.div
          variants={sectionVariants}
          className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto"
        >
          {/* How Energy Works */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-rose-500/20 shadow-xl hover:shadow-rose-500/40 transition-all"
            whileHover={{ scale: 1.05, y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center mb-4 text-rose-400">
                <Bolt className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
                <h3 className="text-3xl font-bold">How Energy Works</h3>
              </div>
              <p className="text-lg text-gray-300">
                Energy is your proof-of-action in Swytch. Earn it through play, learning, and growth. Stored in your Private Energy Trust, it grows up to 3.3% monthly—no staking, just contribution.
              </p>
              <img src="/bg (57).jpg" alt="Swytch Energy Cycle" className="rounded-xl border border-rose-500/20 shadow-md w-full" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
            </div>
          </motion.div>

          {/* Your Vault, Your Rules */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all"
            whileHover={{ scale: 1.05, y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-rose-500/10 rounded-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center mb-4 text-cyan-400">
                <Wallet className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
                <h3 className="text-3xl font-bold">Your Vault, Your Rules</h3>
              </div>
              <p className="text-lg text-gray-300">
                Swytch never touches your wallet. Connect a self-custodial wallet, and you retain full control. Your keys, your JEWELS, your sovereignty.
              </p>
              <img src="/bg (79).jpg" alt="JEWELS Growth Chart" className="rounded-xl border border-cyan-500/20 shadow-md w-full" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
            </div>
          </motion.div>

          {/* Private Energy Trust */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-pink-500/20 shadow-xl hover:shadow-pink-500/40 transition-all md:col-span-2"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center mb-4 text-pink-400">
                <Landmark className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
                <h3 className="text-3xl font-bold">What is a Private Energy Trust?</h3>
              </div>
              <p className="text-lg text-gray-300">
                The Swytch Private Energy Trust (PMA) operates outside public jurisdiction, protected by U.S. Constitutional law and UDHR. As a member, you’re a Beneficiary, not a user, with sovereign rights.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <ShieldCheck className="text-pink-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
                  <p className="text-gray-300">Protected by contract law and natural rights, free from government oversight.</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <BookOpen className="text-pink-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
                  <p className="text-gray-300">Full legal rights to share, learn, earn, and evolve in the Swytch ecosphere.</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <Scale className="text-pink-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
                  <p className="text-gray-300">Disputes resolved via private arbitration, not public courts.</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <FileText className="text-pink-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
                  <p className="text-gray-300">Rights enshrined in UDHR and Amendments: 1st, 5th, 9th, 10th, 14th.</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Energy = Freedom */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-rose-500/20 shadow-xl hover:shadow-rose-500/40 transition-all md:col-span-2"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center mb-4 text-rose-400">
                <Zap className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
                <h3 className="text-3xl font-bold">Energy = Freedom</h3>
              </div>
              <p className="text-lg text-gray-300">
                Energy is your right to earn, hold, and use value on your terms. JEWELS empower you to shape your Petaverse journey.
              </p>
              <ul className="text-rose-300 list-disc pl-6 space-y-2 text-lg">
                <motion.li whileHover={{ x: 5 }}>Convert Energy to Stablecoin (1:1 with USDT)</motion.li>
                <motion.li whileHover={{ x: 5 }}>Access higher tier bonuses with monthly returns</motion.li>
                <motion.li whileHover={{ x: 5 }}>Grow rewards via Raziel Archive learning</motion.li>
                <motion.li whileHover={{ x: 5 }}>Use JEWELS to unlock realms, missions, and items</motion.li>
              </ul>
              <img src="/bg (123).jpg" alt="Self-Sovereign Energy" className="mt-6 rounded-xl border border-rose-500/20 shadow-md w-full sm:max-w-lg mx-auto" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Reward Tiers Section with Infinite Scroll */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8 max-w-7xl mx-auto"
          onMouseEnter={() => setIsScrolling(false)}
          onMouseLeave={() => setIsScrolling(true)}
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-rose-400 animate-pulse" aria-hidden="true" /> Energy Reward Tiers
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Climb the ranks of the Petaverse by earning JEWELS. Each tier unlocks higher monthly rewards and exclusive benefits.
          </p>
          <div className="relative overflow-hidden no-scrollbar">
            <motion.div
              ref={scrollRef}
              className="flex gap-6"
              variants={infiniteScroll}
              animate={isScrolling ? 'animate' : undefined}
            >
              {[...rewardTiers, ...rewardTiers].map((tier, i) => (
                <motion.div
                  key={`${tier.id}-${i}`}
                  className="flex-shrink-0 w-[280px] bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/40 transition-all backdrop-blur-md"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img src={tier.image} alt={`${tier.title} Tier`} className="w-full h-36 object-cover rounded-lg mb-4" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
                  <h3 className="text-xl font-bold text-rose-300 flex items-center gap-2">
                    <Star className="w-5 h-5 animate-pulse" aria-hidden="true" /> {tier.title}
                  </h3>
                  <p className="text-gray-200 mb-2">Reward: {tier.reward}</p>
                  <p className="text-gray-300 text-sm mb-4">Requirement: {tier.requirement}</p>
                  <motion.button
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg w-full font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleUnlockTier(tier)}
                    aria-label={`Unlock ${tier.title} Tier`}
                  >
                    Unlock Tier
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Final Call-to-Action */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-pink-500/20 shadow-2xl hover:shadow-pink-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-pink-400 animate-pulse" aria-hidden="true" /> Ignite Your Energy
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Join the Swytch Petaverse and harness your Energy to shape a decentralized future. Your journey to sovereignty starts now.
            </p>
            <motion.button
              onClick={() => setWalletModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group focus:outline-none focus:ring-2 focus:ring-pink-500"
              whileHover={{ scale: 1.05 }}
              aria-label="Start Your Journey"
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Disclosure Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                className="bg-gray-900 max-w-4xl w-full rounded-2xl p-8 relative border border-rose-500/20 shadow-2xl backdrop-blur-lg overflow-y-auto max-h-[90vh] text-left"
                animate={{ y: [0, -10, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <motion.button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 text-rose-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  whileHover={{ rotate: 90 }}
                  aria-label="Close Disclosure Modal"
                >
                  <X className="w-8 h-8" />
                </motion.button>
                <h3 className="text-4xl font-bold text-rose-400 mb-6 flex items-center gap-4">
                  <FileText className="w-10 h-10 animate-pulse" aria-hidden="true" /> Swytch Legal & Trust Disclosure
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  The Swytch Private Energy Trust operates as a Private Ministerial Association (PMA), safeguarded by U.S. Constitutional law and the Universal Declaration of Human Rights. Full details on PMA structure, UDHR articles, arbitration terms, and decentralized trust protocols are available in the "Know Your Freedom" section. Membership signifies consent, with the freedom to exit at any time. You are sovereign by design.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <motion.a
                    href="#freedom"
                    className="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    whileHover={{ scale: 1.05 }}
                    aria-label="View Freedom Documents"
                  >
                    <BookOpen className="w-5 h-5" /> View Freedom Docs
                  </motion.a>
                  <motion.button
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setModalOpen(false)}
                    aria-label="Close Disclosure"
                  >
                    <ShieldCheck className="w-5 h-5" /> Close Disclosure
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {walletModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wallet-modal-title"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gray-900/50 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 id="wallet-modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 animate-pulse" /> Connect to Swytch
                  </h2>
                  <button onClick={() => setWalletModalOpen(false)} aria-label="Close wallet modal">
                    <X className="text-rose-400 hover:text-red-500 w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <ConnectButton />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .blur-3xl { filter: blur(64px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
        }
        input:focus, button:focus, a:focus {
          transition: border-color 0.3s ease, ring-color 0.3s ease;
        }
        @media (prefers-reduced-motion) {
          .animate-pulse, .animate-bounce, [data-animate] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default EnergyExplanation;