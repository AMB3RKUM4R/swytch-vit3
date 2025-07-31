// src/components/vault/YieldCalculator.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Zap, TrendingUp } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { YieldCalculatorProps } from '@/lib/types'; // Import YieldCalculatorProps

interface Tier {
  level: number;
  title: string;
  minDeposit: number;
  monthlyYieldRate: number; // e.g., 0.01 for 1%
}

const tiers: Tier[] = [
  { level: 1, title: 'Bronze Tier', minDeposit: 100, monthlyYieldRate: 0.01 }, // 1%
  { level: 2, title: 'Silver Tier', minDeposit: 500, monthlyYieldRate: 0.015 }, // 1.5%
  { level: 3, title: 'Gold Tier', minDeposit: 1000, monthlyYieldRate: 0.02 }, // 2%
  { level: 4, title: 'Platinum Tier', minDeposit: 5000, monthlyYieldRate: 0.025 }, // 2.5%
];

const YieldCalculator: FC<YieldCalculatorProps> = ({ userId, handleCalculateYield, setShowMessage, setActiveModal }) => {
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [calculatedYield, setCalculatedYield] = useState<{
    tier: Tier | null;
    monthlyReward: number;
    annualReward: number;
    fiveYearProjection: number;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const calculateReward = () => {
    setLocalError(null);
    if (typeof depositAmount !== 'number' || depositAmount <= 0) {
      setLocalError('Please enter a valid deposit amount.');
      setShowMessage('⚠️ Please enter a valid deposit amount.');
      return null;
    }
    if (depositAmount < tiers[0].minDeposit) {
      setLocalError(`Minimum deposit is $${tiers[0].minDeposit}.`);
      setShowMessage(`⚠️ Minimum deposit is $${tiers[0].minDeposit}.`);
      return null;
    }

    const tier = tiers.slice().reverse().find(t => depositAmount >= t.minDeposit) || null;

    if (!tier) {
      setLocalError('No tier found for this deposit amount.');
      setShowMessage('⚠️ No tier found for this deposit amount.');
      return null;
    }

    const monthlyReward = depositAmount * tier.monthlyYieldRate;
    const annualReward = monthlyReward * 12;

    // Simple compounding for 5 years
    let projection = depositAmount;
    for (let i = 0; i < 60; i++) { // 60 months = 5 years
      projection += projection * tier.monthlyYieldRate;
    }

    setCalculatedYield({
      tier,
      monthlyReward: parseFloat(monthlyReward.toFixed(2)),
      annualReward: parseFloat(annualReward.toFixed(2)),
      fiveYearProjection: parseFloat(projection.toFixed(2)),
    });
    setShowMessage(`✅ Yield calculated for ${tier.title}!`);
    return { tier, monthlyReward: monthlyReward.toFixed(2) }; // Return for parent handler
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to calculate rewards!');
      setActiveModal('auth');
      return;
    }
    calculateReward(); // Perform local calculation
    // The handleCalculateYield prop from parent (Vault.tsx) is for logging/triggering payment modal
    await handleCalculateYield(e); // Call parent's handler
  };

  return (
    <SwytchCard gradient="from-green-700/20 to-teal-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Calculator className="w-7 h-7 text-primary" /> Yield Calculator
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Estimate your potential JEWELS earnings based on your deposit.
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-1">
            Deposit Amount (USD)
          </label>
          <input
            id="deposit-amount"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(parseFloat(e.target.value) || '')}
            placeholder={`Min $${tiers[0].minDeposit}`}
            className="input"
            min={tiers[0].minDeposit}
            required
            aria-label="Deposit amount"
            disabled={!userId}
          />
        </div>
        <motion.button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={!userId || typeof depositAmount !== 'number' || depositAmount < tiers[0].minDeposit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-5 h-5" /> Calculate Yield
        </motion.button>
      </form>

      <AnimatePresence>
        {localError && (
          <motion.p
            className="text-rose-400 text-sm text-center mt-4 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {localError}
          </motion.p>
        )}
        {calculatedYield && (
          <motion.div
            className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" /> Your Projection
            </h3>
            <p className="text-gray-300">Tier: <span className="font-semibold text-primary">{calculatedYield.tier?.title || 'N/A'}</span></p>
            <p className="text-gray-300">Monthly Reward: <span className="font-semibold text-white">${calculatedYield.monthlyReward}</span></p>
            <p className="text-gray-300">Annual Reward: <span className="font-semibold text-white">${calculatedYield.annualReward}</span></p>
            <p className="text-gray-300">Projection in 5 Years: <span className="font-bold text-yellow-400">${calculatedYield.fiveYearProjection}</span></p>
            <p className="text-xs text-gray-400 mt-2">
              *Projections are estimates and do not guarantee future returns. Subject to terms and conditions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SwytchCard>
  );
};

export default YieldCalculator;