import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext'; // Keep useModal for context functions

// IMPORTANT: Import Tier and DepositCalculatorProps from lib/types.ts
import { DepositCalculatorProps as ImportedDepositCalculatorProps } from '../lib/types';


// Tier interface is now imported from lib/types.ts

// Use ImportedDepositCalculatorProps as the type for the FC
const DepositCalculator: React.FC<ImportedDepositCalculatorProps> = ({ userId, calculateReward }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const { setActiveModal, setShowMessage } = useModal(); // Correctly consuming context

  const handleDepositCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to calculate rewards!');
      return;
    }
    // No need for auth.currentUser check here if userId is the main source of truth for login.
    // If auth.currentUser is needed for very specific Firebase internal reasons, keep it.
    // For now, based on your current pattern, userId is sufficient.
    
    try {
      const result = calculateReward(depositAmount);
      if (result) {
        setShowMessage(`✅ Deposit: $${depositAmount}\nTier: ${result.tier.title}\nMonthly Reward: ${result.tier.reward} ($${result.monthlyReward})`);
        setActiveModal('payment'); // Trigger payment modal as intended
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
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
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
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 font-inter"
              min="100"
              required
              aria-label="Deposit amount"
              disabled={!userId} // Disable if no userId
            />
          </div>
          <motion.button
            type="submit"
            className="w-full py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!userId || parseFloat(depositAmount) < 100} // Disable if no userId or invalid amount
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