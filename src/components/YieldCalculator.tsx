import { motion } from 'framer-motion';
import { FileText, Coins } from 'lucide-react';
import { useState } from 'react';
import { YieldForm, YieldResult, YieldCalculatorProps } from '../lib/types';

const TIER_RATES = [
  { minDeposit: 100000, rate: 0.033, tier: 'Mythic PET' },
  { minDeposit: 50000, rate: 0.031, tier: 'Elder' },
  { minDeposit: 25000, rate: 0.028, tier: 'Alchemist' },
  { minDeposit: 10000, rate: 0.025, tier: 'Archon' },
  { minDeposit: 5000, rate: 0.022, tier: 'Sage' },
  { minDeposit: 2500, rate: 0.019, tier: 'Guardian' },
  { minDeposit: 1000, rate: 0.016, tier: 'Seeker' },
  { minDeposit: 500, rate: 0.013, tier: 'Apprentice' },
  { minDeposit: 0, rate: 0.01, tier: 'Initiate' },
].sort((a, b) => b.minDeposit - a.minDeposit);

const QUEST_BONUS_RATE_PER_QUEST = 0.0003;
const COMPOUNDING_PERIODS = 60;

const YieldCalculator: React.FC<YieldCalculatorProps> = ({ userId, handleCalculateYield, setShowMessage, setActiveModal }) => {
  const [yieldForm, setYieldForm] = useState<YieldForm>({ deposit: '', quests: '0', network: 'Avalanche', withdraw: '', token: 'USDT' });
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to calculate yield!');
      setActiveModal('auth');
      return;
    }
    
    const deposit = parseFloat(yieldForm.deposit);
    const quests = parseInt(yieldForm.quests);

    if (isNaN(deposit) || deposit < 100) {
      setShowMessage('⚠️ Please enter a valid deposit amount (minimum $100).');
      return;
    }
    if (isNaN(quests) || quests < 0 || quests > 10) {
      setShowMessage('⚠️ Quests must be between 0 and 10.');
      return;
    }

    try {
      const tierData = TIER_RATES.find(t => deposit >= t.minDeposit);
      const baseMonthlyRate = tierData ? tierData.rate : TIER_RATES[TIER_RATES.length - 1].rate;
      const tierName = tierData ? tierData.tier : 'Initiate';

      const bonusMonthlyRate = quests * QUEST_BONUS_RATE_PER_QUEST;
      const effectiveMonthlyRate = baseMonthlyRate + bonusMonthlyRate;

      const totalValueAfter5Years = deposit * Math.pow(1 + effectiveMonthlyRate, COMPOUNDING_PERIODS);
      const totalROIAfter5Years = totalValueAfter5Years - deposit;
      const averageMonthlyROIAfter5Years = totalROIAfter5Years / COMPOUNDING_PERIODS;

      const baseMonthlyYield = deposit * baseMonthlyRate;
      const bonusMonthlyYield = deposit * bonusMonthlyRate;
      const totalMonthlyYieldStart = baseMonthlyYield + bonusMonthlyYield;
      
      const result: YieldResult = {
        baseMonthlyYield,
        bonusMonthlyYield,
        totalMonthlyYieldStart,
        totalValueAfter5Years,
        totalROIAfter5Years,
        averageMonthlyROIAfter5Years,
        tier: tierName,
      };

      setYieldResult(result);

      await handleCalculateYield(e); // Use the prop passed from Vault.tsx

      setShowMessage(`✅ Calculation for ${yieldForm.deposit} USDT and ${yieldForm.quests} quests!`);
    } catch (err) {
      console.error('Yield calculation error:', err);
      setShowMessage('⚠️ Failed to calculate yield. Please try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-6"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <FileText className="w-8 h-8 text-rose-400 animate-pulse" /> Yield Calculator
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Estimate your monthly JEWELS yield based on deposit and education quests.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-1">
              Deposit Amount (USDT)
            </label>
            <input
              id="deposit-amount"
              type="number"
              value={yieldForm.deposit}
              onChange={(e) => setYieldForm({ ...yieldForm, deposit: e.target.value })}
              placeholder="Enter deposit amount (min $100)"
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
              min="0"
              required
              aria-label="Deposit amount"
              disabled={!userId}
            />
          </div>
          <div>
            <label htmlFor="quests-completed" className="block text-sm font-medium text-gray-300 mb-1">
              Quests Completed (0–10)
            </label>
            <input
              id="quests-completed"
              type="number"
              value={yieldForm.quests}
              onChange={(e) => setYieldForm({ ...yieldForm, quests: e.target.value })}
              placeholder="Number of quests"
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
              min="0"
              max="10"
              required
              aria-label="Quests completed"
              disabled={!userId}
            />
          </div>
          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-md font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Calculate Yield"
            disabled={!userId || parseFloat(yieldForm.deposit) < 100 || parseInt(yieldForm.quests) < 0 || parseInt(yieldForm.quests) > 10}
          >
            <Coins className="w-5 h-5" /> Calculate Yield
          </motion.button>
        </form>
        {yieldResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-800 rounded-lg border border-rose-500/20"
          >
            <p className="text-white font-semibold font-inter">Tier: {yieldResult.tier}</p>
            <p className="text-gray-300 font-inter">Base Monthly Yield: ${yieldResult.baseMonthlyYield.toFixed(2)}</p>
            <p className="text-gray-300 font-inter">Bonus Monthly Yield: ${yieldResult.bonusMonthlyYield.toFixed(2)}</p>
            <p className="text-rose-400 font-bold font-inter">Total ROI (5 Years): ${yieldResult.totalROIAfter5Years.toFixed(2)}</p>
            <p className="text-rose-400 font-bold font-inter">Average Monthly ROI: ${yieldResult.averageMonthlyROIAfter5Years.toFixed(2)}</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default YieldCalculator;