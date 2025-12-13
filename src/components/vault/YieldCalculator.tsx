import { FC, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

interface Tier {
  level: number;
  title: string;
  minDeposit: number;
  monthlyYieldRate: number;
}

const tiers: Tier[] = [
  { level: 1, title: 'BRONZE (1%)', minDeposit: 100, monthlyYieldRate: 0.01 },
  { level: 2, title: 'SILVER (1.5%)', minDeposit: 500, monthlyYieldRate: 0.015 },
  { level: 3, title: 'GOLD (2%)', minDeposit: 1000, monthlyYieldRate: 0.02 },
  { level: 4, title: 'PLATINUM (2.5%)', minDeposit: 5000, monthlyYieldRate: 0.025 },
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

  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [calculatedYield, setCalculatedYield] = useState<YieldResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const parsedDepositAmount = parseFloat(depositAmountInput);

  const calculateReward = useCallback(() => {
    setLocalError(null);
    if (isNaN(parsedDepositAmount) || parsedDepositAmount <= 0) {
      setLocalError('INVALID AMOUNT');
      return;
    }
    if (parsedDepositAmount < tiers[0].minDeposit) {
      setLocalError(`MIN DEPOSIT: $${tiers[0].minDeposit}`);
      return;
    }

    const tier = tiers.slice().reverse().find(t => parsedDepositAmount >= t.minDeposit) || null;
    if (!tier) { setLocalError('ERROR: NO TIER'); return; }

    const monthlyReward = parsedDepositAmount * tier.monthlyYieldRate;
    const annualReward = monthlyReward * 12;
    let projection = parsedDepositAmount;
    for (let i = 0; i < 60; i++) { projection += projection * tier.monthlyYieldRate; }

    setCalculatedYield({
      tier,
      monthlyReward: parseFloat(monthlyReward.toFixed(2)),
      annualReward: parseFloat(annualReward.toFixed(2)),
      fiveYearProjection: parseFloat(projection.toFixed(2)),
    });
    setShowMessage(`✅ YIELD CALCULATED`);
  }, [parsedDepositAmount, setShowMessage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ LOGIN REQUIRED');
      setActiveModal('auth');
      return;
    }
    calculateReward();
  };

  return (
    <div className="h-full flex flex-col font-mono">
      <form onSubmit={handleFormSubmit} className="space-y-4 mb-4">
        <div>
          <label className="block text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
            Deposit Amount (USD)
          </label>
          <div className="relative">
              <input
                type="number"
                value={depositAmountInput}
                onChange={(e) => setDepositAmountInput(e.target.value)}
                placeholder={`Min $${tiers[0].minDeposit}`}
                className="w-full bg-black border border-gray-800 p-3 text-white text-xs placeholder:text-gray-700 outline-none focus:border-[#39FF14] transition-colors"
                min={tiers[0].minDeposit}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-bold">USD</span>
          </div>
        </div>
        <motion.button
          type="submit"
          className="w-full py-3 bg-[#39FF14] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={isNaN(parsedDepositAmount) || parsedDepositAmount < tiers[0].minDeposit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-4 h-4" /> CALCULATE YIELD
        </motion.button>
      </form>

      <AnimatePresence>
        {localError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-900/10 border border-red-500 text-red-500 text-[10px] uppercase font-bold text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-3 h-3" /> {localError}
          </motion.div>
        )}
        {calculatedYield && (
          <motion.div
            className="mt-auto p-4 bg-black border border-[#39FF14] space-y-3 relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <TrendingUp className="w-16 h-16 text-[#39FF14]" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase border-b border-gray-800 pb-2 mb-2 tracking-widest">
              Projection Result
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 uppercase">
                <div>TIER</div>
                <div className="text-right text-white font-bold">{calculatedYield.tier?.title}</div>
                
                <div>MONTHLY</div>
                <div className="text-right text-[#39FF14] font-bold">${calculatedYield.monthlyReward.toLocaleString()}</div>
                
                <div>ANNUAL</div>
                <div className="text-right text-[#39FF14] font-bold">${calculatedYield.annualReward.toLocaleString()}</div>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase">5YR COMPOUND</p>
                <p className="text-lg font-black text-white font-mono">${calculatedYield.fiveYearProjection.toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YieldCalculator;