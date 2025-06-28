import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, Star, Globe, LockKeyhole, Users, BarChart3, Landmark, Flame, BookOpen,
  ShieldCheck, Scale, Trophy, Sparkles, DollarSign, Quote
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUser } from '@/hooks/useAuthUser';
import Confetti from 'react-confetti';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Interfaces
interface Tier {
  level: number;
  title: string;
  reward: string;
  deposit: string;
  image: string;
}

interface Feature {
  icon: any;
  title: string;
  description: string;
}

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  avatar: string;
}

const tiers: Tier[] = [
  { level: 1, title: 'Initiate', reward: '1.0%', deposit: '$100-$499', image: '/bg (29).jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', deposit: '$500-$999', image: '/bg (28).jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', deposit: '$1000-$2499', image: '/bg (22).jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', deposit: '$2500-$4999', image: '/bg (6).jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', deposit: '$5000-$9999', image: '/bg (8).jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', deposit: '$10000-$24999', image: '/bg (9).jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', deposit: '$25000-$49999', image: '/bg (10).jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', deposit: '$50000-$99999', image: '/bg (12).jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', deposit: '$100000+', image: '/bg (11).jpg' },
];

const features: Feature[] = [
  { icon: Star, title: 'Vision: Unmatched', description: 'Swytch fuses psychology, economy, governance, and tech. PETs are citizens of a new metaverse.' },
  { icon: Flame, title: 'Emotional Driver: Real AF', description: 'Swytch ignites hope and empowers rebels. It’s a movement that feels alive.' },
  { icon: Users, title: 'Scalable & Sustainable', description: 'Rewards effort, education, and community for a lasting ecosphere.' },
  { icon: LockKeyhole, title: 'Ethical Structure', description: 'PETs as beneficiaries ensure compliance and empowerment.' },
  { icon: Landmark, title: 'Private Energy Trust', description: 'Smart contract vault for autonomy, privacy, and rewards.' },
  { icon: BarChart3, title: 'Decentralized Rewards', description: 'Up to 3% monthly returns, plus 0.3% JEWELS via Raziel education.' },
  { icon: Globe, title: 'Raziel: The Executor', description: 'AI guardian manages assets with transparent logic.' },
  { icon: BookOpen, title: 'Know Your Freedom', description: 'Learn rights via UDHR, U.S. Constitution, and PMA charter.' },
  { icon: ShieldCheck, title: 'Membership & PMA Rights', description: 'Private contract protects under constitutional law.' },
  { icon: Scale, title: 'Self-Sovereign Control', description: 'You hold your keys, identity, and decisions.' },
];

const testimonials: Testimonial[] = [
  { id: 1, quote: 'Swytch changed my life! Earning JEWELS feels like a game with real rewards.', author: 'AstraRebel', avatar: '/avatar1.jpg' },
  { id: 2, quote: 'The Petaverse is freedom in action. I’m a Sage and proud!', author: 'QuantumSage', avatar: '/avatar2.jpg' },
  { id: 3, quote: 'Raziel’s education tab is a game-changer. Knowledge = power.', author: 'NovaGuardian', avatar: '/avatar3.jpg' },
];

// Chart.js Configuration
const chartConfig = {
  type: 'bar',
  data: {
    labels: ['Initiate', 'Apprentice', 'Seeker', 'Guardian', 'Sage', 'Archon', 'Alchemist', 'Elder', 'Mythic PET'],
    datasets: [
      {
        label: 'Monthly Reward (%)',
        data: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.3],
        backgroundColor: [
          'rgba(244, 63, 94, 0.6)', // Rose
          'rgba(244, 63, 94, 0.65)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(34, 211, 238, 0.6)', // Cyan
          'rgba(34, 211, 238, 0.65)',
          'rgba(34, 211, 238, 0.7)',
          'rgba(244, 63, 94, 0.6)', // Rose
          'rgba(244, 63, 94, 0.65)',
          'rgba(244, 63, 94, 0.7)',
        ],
        borderColor: [
          '#F43F5E', // Rose
          '#F43F5E',
          '#F43F5E',
          '#22D3EE', // Cyan
          '#22D3EE',
          '#22D3EE',
          '#F43F5E',
          '#F43F5E',
          '#F43F5E',
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Reward (%)', color: '#FFFFFF' }, // White
        ticks: { color: '#FFFFFF' },
        grid: { color: 'rgba(168, 85, 247, 0.2)' }, // Purple
      },
      x: {
        title: { display: true, text: 'Tier', color: '#FFFFFF' }, // White
        ticks: { color: '#FFFFFF' },
        grid: { color: 'rgba(168, 85, 247, 0.2)' },
      },
    },
    plugins: {
      legend: { labels: { color: '#FFFFFF' } }, // White
      title: {
        display: true,
        text: 'Reward Progression by Tier',
        color: '#FFFFFF',
        font: { size: 18 },
      },
    },
  },
};

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const infiniteScroll = {
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } },
};

const flareVariants = {
  animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

// Throttle function
const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  return (...args: any[]) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Components
const Card = ({ children, gradient, className = '' }: { children: React.ReactNode; gradient: string; className?: string }) => (
  <motion.div
    className={`relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-500/30 transition-all bg-gradient-to-r ${gradient} ${className}`}
    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
  >
    {children}
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card gradient="from-rose-500/10 to-pink-500/10">
    <div className="flex items-start space-x-6">
      <div className="p-4 bg-rose-500/20 rounded-full shadow-lg">
        <Icon className="w-8 h-8 text-rose-500 animate-pulse" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-gray-100 mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  </Card>
);

const EnergyBreakdown: React.FC = () => {
  const { user, loading: authLoading } = useAuthUser();
  const { address, isConnected } = useAccount();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [depositAmount, setDepositAmount] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [jewels, setJewels] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // User ID (wallet address or Firebase UID)
  const userId = isConnected && address ? address : user?.uid;

  // Fetch JEWELS balance
  useEffect(() => {
    const fetchJewels = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
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
  }, [userId]);

  // Throttled mouse move for lens flares
  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }, 100);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate tier and reward
  const calculateReward = useCallback((amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 100) return null;
    let tier: Tier | undefined;
    if (num <= 499) tier = tiers[0];
    else if (num <= 999) tier = tiers[1];
    else if (num <= 2499) tier = tiers[2];
    else if (num <= 4999) tier = tiers[3];
    else if (num <= 9999) tier = tiers[4];
    else if (num <= 24999) tier = tiers[5];
    else if (num <= 49999) tier = tiers[6];
    else if (num <= 99999) tier = tiers[7];
    else tier = tiers[8];
    const rewardPercent = parseFloat(tier.reward) / 100;
    const monthlyReward = (num * rewardPercent).toFixed(2);
    return { tier, monthlyReward };
  }, []);

  const handleDepositCalculate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userId) {
        alert('Please connect your wallet or log in to calculate rewards.');
        setShowWalletModal(true);
        return;
      }
      try {
        const result = calculateReward(depositAmount);
        if (result) {
          const audio = new Audio('/audio/deposit.mp3');
          audio.play().catch((err) => console.error('Audio playback failed:', err));
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          alert(`Deposit: $${depositAmount}\nTier: ${result.tier.title}\nMonthly Reward: ${result.tier.reward} ($${result.monthlyReward})`);
        } else {
          alert('Please enter a valid deposit amount ($100 or more).');
        }
      } catch (error) {
        console.error('Error calculating reward:', error);
        alert('An error occurred. Please try again.');
      }
    },
    [depositAmount, calculateReward, userId]
  );

  const handleDepositNow = useCallback(
    async (tier: Tier) => {
      if (!userId) {
        alert('Please connect your wallet or log in to deposit.');
        setShowWalletModal(true);
        return;
      }
      const minDeposit = parseFloat(tier.deposit.split('-')[0].replace('$', '')) || parseFloat(tier.deposit.replace('$', '').replace('+', ''));
      const jewelCost = minDeposit * 10; // 1 INR = 10 JEWELS, assuming $1 = 100 INR for simplicity
      if (jewels < jewelCost) {
        alert(`You need at least ${jewelCost} JEWELS to deposit for ${tier.title} tier.`);
        return;
      }
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { jewels: jewels - jewelCost, WalletBalance: minDeposit, updatedAt: serverTimestamp() }, { merge: true });
        setJewels(jewels - jewelCost);
        const audio = new Audio('/audio/deposit.mp3');
        audio.play().catch((err) => console.error('Audio playback failed:', err));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        alert(`Deposited ${tier.deposit} for ${tier.title} tier! ${jewelCost} JEWELS deducted.`);
      } catch (err) {
        console.error('Deposit error:', err);
        alert('Failed to process deposit. Please try again.');
      }
    },
    [jewels, userId]
  );

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-gray-100 overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      {/* Lens Flare and Noise Overlay */}
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: `${50 + mousePosition.y * 50}%`, left: `${50 + mousePosition.x * 50}%` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 bg-repeat bg-[length:64px_64px]" />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(244, 63, 94, 0.5)' : 'rgba(34, 211, 238, 0.5)',
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
        {/* Hero Section */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 glass rounded-3xl p-12 border border-rose-500/20 shadow-2xl hover:shadow-rose-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/60 to-pink-500/60 rounded-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-rose-400 tracking-tight flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12 animate-pulse" /> The Petaverse
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A rebellion powered by Energy, governed by purpose, and built for PETs—People of Energy & Truth.
            </p>
            {userId && (
              <p className="text-gray-300 text-center">
                Your JEWELS: <span className="font-bold text-rose-400">{jewels} JEWELS</span>
              </p>
            )}
            <motion.button
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              whileHover={{ scale: 1.05 }}
            >
              Join the Rebellion
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        {/* Core Feature Cards */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </motion.div>

        {/* Deposit Calculator */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h2 className="text-4xl font-extrabold text-gray-100 text-center flex items-center justify-center gap-4">
            <DollarSign className="w-10 h-10 text-rose-500 animate-pulse" /> Calculate Your Rewards
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Enter your deposit amount to see your tier and monthly Energy rewards.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <form onSubmit={handleDepositCalculate} className="space-y-4 max-w-md mx-auto">
              <div>
                <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Deposit Amount ($)
                </label>
                <input
                  id="deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount (min $100)"
                  className="w-full p-3 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-rose-500"
                  min="100"
                  required
                  aria-label="Deposit amount"
                  disabled={authLoading}
                />
              </div>
              <motion.button
                type="submit"
                className="w-full py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                disabled={authLoading}
              >
                <DollarSign className="w-5 h-5" /> Calculate Reward
              </motion.button>
            </form>
          </Card>
        </motion.div>

        {/* Energy Gains Section */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-gray-100 text-center flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-rose-500 animate-pulse" /> Energy Gains ⚡
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Deposit JEWELS to earn up to 3.3% monthly Energy, plus education bonuses via Raziel.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...tiers, ...tiers].map((tier, i) => (
                <motion.div
                  key={`${tier.level}-${i}`}
                  className="flex-shrink-0 w-[300px] bg-gray-900/50 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/30 transition-all backdrop-blur-md"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img
                    src={tier.image}
                    alt={tier.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }}
                  />
                  <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2">
                    <Star className="w-5 h-5" /> Level {tier.level}: {tier.title}
                  </h3>
                  <p className="text-gray-100 mb-2">Reward: {tier.reward} Monthly</p>
                  <p className="text-gray-300 text-sm mb-4">Deposit: {tier.deposit}</p>
                  <motion.button
                    className="bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 rounded-lg w-full font-semibold"
                    onClick={() => handleDepositNow(tier)}
                    whileHover={{ scale: 1.05 }}
                    disabled={authLoading}
                  >
                    Deposit Now
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Tier Progression Visualizer */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h2 className="text-4xl font-extrabold text-gray-100 text-center flex items-center justify-center gap-4">
            <BarChart3 className="w-10 h-10 text-rose-500 animate-pulse" /> Tier Progression
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Track your journey from Initiate to Mythic PET with increasing rewards.
          </p>
          <Card gradient="from-pink-500/10 to-rose-500/10">
            <div className="p-4 h-96">
              <Bar data={chartConfig.data} options={chartConfig.options} />
            </div>
          </Card>
        </motion.div>

        {/* PET Testimonials */}
        <motion.div variants={sectionVariants} className="space-y-6">
          <h2 className="text-4xl font-extrabold text-gray-100 text-center flex items-center justify-center gap-4">
            <Quote className="w-10 h-10 text-rose-500 animate-pulse" /> PET Testimonials
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Hear from PETs shaping the Petaverse.
          </p>
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="relative h-[200px] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center p-6"
                >
                  <div className="text-center">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].author}
                      className="w-16 h-16 rounded-full mx-auto mb-4 border border-rose-500/20"
                      onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
                    />
                    <p className="text-gray-300 italic mb-2">"{testimonials[currentTestimonial].quote}"</p>
                    <p className="text-rose-400 font-semibold">{testimonials[currentTestimonial].author}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-3 h-3 rounded-full ${i === currentTestimonial ? 'bg-rose-600' : 'bg-gray-600'}`}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Final Call-to-Action */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center"
        >
          <Card gradient="from-rose-500/10 to-pink-500/10">
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-gray-100 flex items-center justify-center gap-4">
                <Globe className="w-10 h-10 text-rose-500 animate-pulse" /> Shape the Petaverse
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Become a PET and harness your Energy to build a decentralized future.
              </p>
              <motion.button
                onClick={() => setShowWalletModal(true)}
                className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
                whileHover={{ scale: 1.05 }}
              >
                Start Your Journey
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gray-900/50 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 id="modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 animate-pulse" /> Connect to Swytch
                  </h2>
                  <button onClick={() => setShowWalletModal(false)} aria-label="Close modal">
                    <text className="text-rose-400 hover:text-red-500 w-6 h-6" />
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
        .blur-2xl { filter: blur(32px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
        }
        input:focus, button:focus {
          outline: none;
          transition: border-color 0.3s ease, ring-color 0.3s ease;
        }
        [data-animate] {
          will-change: transform, opacity;
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

export default EnergyBreakdown;