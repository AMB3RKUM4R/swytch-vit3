import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface Tier {
  level: number;
  title: string;
  reward: string;
  deposit: string;
  image: string;
}

interface DepositCalculatorProps {
  userId: string | null;
  calculateReward: (amount: string) => { tier: Tier; monthlyReward: string } | null;
}

const tiers: Tier[] = [
  { level: 1, title: 'Initiate', reward: '1.0%', deposit: '$100-$499', image: '/bg.jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', deposit: '$500-$999', image: '/bg.jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', deposit: '$1000-$2499', image: '/bg.jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', deposit: '$2500-$4999', image: '/bg.jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', deposit: '$5000-$9999', image: '/bg.jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', deposit: '$10000-$24999', image: '/bg.jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', deposit: '$25000-$49999', image: '/bg.jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', deposit: '$50000-$99999', image: '/bg.jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', deposit: '$100000+', image: '/bg.jpg' },
];

const DepositCalculator: React.FC<DepositCalculatorProps> = ({ userId, calculateReward }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const { setActiveModal, setShowMessage } = useModal();

  const handleDepositCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to calculate rewards!');
      return;
    }
    try {
      const result = calculateReward(depositAmount);
      if (result) {
        setShowMessage(`✅ Deposit: $${depositAmount}\nTier: ${result.tier.title}\nMonthly Reward: ${result.tier.reward} ($${result.monthlyReward})`);
        setActiveModal('payment'); // Prompt deposit to confirm
      } else {
        setShowMessage('⚠️ Please enter a valid deposit amount ($100 or more).');
        setActiveModal('error');
      }
    } catch (err) {
      console.error('Error calculating reward:', err);
      setShowMessage('⚠️ Failed to calculate reward. Please try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-6 relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <Zap className="w-10 h-10 text-cyan-400 animate-pulse" /> Calculate Your Rewards
      </h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Enter your deposit amount to see your tier and monthly Energy rewards.
      </p>
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
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
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              min="100"
              required
              aria-label="Deposit amount"
              disabled={!userId}
            />
          </div>
          <motion.button
            type="submit"
            className="w-full py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!userId || parseFloat(depositAmount) < 100}
            aria-label="Calculate Reward"
          >
            <Zap className="w-5 h-5" /> Calculate Reward
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DepositCalculator;