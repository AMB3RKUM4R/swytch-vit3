// src/components/vault/YieldCalculator.tsx
import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// This component is now self-sufficient and requires no props.

interface Tier {
  level: number;
  title: string;
  minDeposit: number;
  monthlyYieldRate: number; // e.g., 0.01 for 1%
}

const tiers: Tier[] = [
  { level: 1, title: 'Bronze Tier (1%)', minDeposit: 100, monthlyYieldRate: 0.01 },
  { level: 2, title: 'Silver Tier (1.5%)', minDeposit: 500, monthlyYieldRate: 0.015 },
  { level: 3, title: 'Gold Tier (2%)', minDeposit: 1000, monthlyYieldRate: 0.02 },
  { level: 4, title: 'Platinum Tier (2.5%)', minDeposit: 5000, monthlyYieldRate: 0.025 },
];

interface YieldResult {
  tier: Tier | null;
  monthlyReward: number;
  annualReward: number;
  fiveYearProjection: number;
}

const YieldCalculator: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // FIX: State initialization for input should be consistent (string)
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [calculatedYield, setCalculatedYield] = useState<YieldResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const parsedDepositAmount = parseFloat(depositAmountInput);

  const calculateReward = useCallback(() => {
    setLocalError(null);

    // 1. Basic validation
    if (isNaN(parsedDepositAmount) || parsedDepositAmount <= 0) {
      setLocalError('Please enter a valid deposit amount.');
      return;
    }
    if (parsedDepositAmount < tiers[0].minDeposit) {
      setLocalError(`Minimum deposit is $${tiers[0].minDeposit}.`);
      return;
    }

    // 2. Determine the highest qualifying tier (tiers must be sorted ascending by minDeposit)
    const tier = tiers.slice().reverse().find(t => parsedDepositAmount >= t.minDeposit) || null;

    if (!tier) {
      setLocalError('Calculation failed: No tier found.');
      return;
    }

    // 3. Simple Calculation
    const monthlyReward = parsedDepositAmount * tier.monthlyYieldRate;
    const annualReward = monthlyReward * 12;

    // 4. Compounding Projection (5 years = 60 months)
    let projection = parsedDepositAmount;
    for (let i = 0; i < 60; i++) {
      projection += projection * tier.monthlyYieldRate;
    }

    setCalculatedYield({
      tier,
      monthlyReward: parseFloat(monthlyReward.toFixed(2)),
      annualReward: parseFloat(annualReward.toFixed(2)),
      fiveYearProjection: parseFloat(projection.toFixed(2)),
    });
    setShowMessage(`✅ Yield calculated for ${tier.title}!`);
  }, [parsedDepositAmount, setShowMessage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to calculate rewards!');
      setActiveModal('auth');
      return;
    }
    calculateReward();
  };

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Calculator className="w-7 h-7 text-primary" /> Yield Calculator
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Estimate your potential JOULES earnings based on your deposit.
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-muted-foreground mb-1 font-inter">
            Deposit Amount (USD)
          </label>
          <input
            id="deposit-amount"
            type="number"
            // FIX: Use depositAmountInput string state for input value
            value={depositAmountInput}
            // FIX: Update state with the raw string/number
            onChange={(e) => setDepositAmountInput(e.target.value)} 
            placeholder={`Min $${tiers[0].minDeposit}`}
            className="input w-full"
            min={tiers[0].minDeposit}
            aria-label="Deposit amount"
          />
        </div>
        <motion.button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          // Disable calculation button if input is invalid or less than minimum
          disabled={isNaN(parsedDepositAmount) || parsedDepositAmount < tiers[0].minDeposit} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-5 h-5" /> Calculate Yield
        </motion.button>
      </form>

      <AnimatePresence>
        {localError && (
          <motion.p
            className="text-destructive text-sm text-center mt-4 font-inter flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AlertTriangle className="w-4 h-4" /> {localError}
          </motion.p>
        )}
        {calculatedYield && (
          <motion.div
            className="mt-6 p-4 bg-black/20 rounded-lg border border-border space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-poppins">
              <TrendingUp className="w-6 h-6 text-green-400" /> Your Projection
            </h3>
            <p className="text-muted-foreground font-inter">Tier: <span className="font-semibold text-primary">{calculatedYield.tier?.title || 'N/A'}</span></p>
            <p className="text-muted-foreground font-inter">Monthly Reward: <span className="font-semibold text-foreground">${calculatedYield.monthlyReward.toLocaleString()}</span></p>
            <p className="text-muted-foreground font-inter">Annual Reward: <span className="font-semibold text-foreground">${calculatedYield.annualReward.toLocaleString()}</span></p>
            <p className="text-muted-foreground font-inter">Projection in 5 Years (Compounded): <span className="font-bold text-yellow-400">${calculatedYield.fiveYearProjection.toLocaleString()}</span></p>
            <p className="text-xs text-muted-foreground/70 mt-2 font-inter">
              *Projections are estimates and do not guarantee future returns. Subject to terms and conditions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SwytchCard>
  );
};

export default YieldCalculator;