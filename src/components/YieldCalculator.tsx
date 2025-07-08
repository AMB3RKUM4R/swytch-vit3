import { motion } from 'framer-motion';
import { FileText, Coins } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';

interface YieldForm {
  deposit: string;
  quests: string;
  network: string;
  withdraw: string;
  token: string;
}

interface YieldResult {
  baseYield: number;
  bonusYield: number;
  totalYield: number;
  tier: string;
}

interface YieldCalculatorProps {
  userId: string | null;
  handleCalculateYield: (e: React.FormEvent) => Promise<void>;
}

const YieldCalculator: React.FC<YieldCalculatorProps> = ({ userId, handleCalculateYield }) => {
  const [yieldForm, setYieldForm] = useState<YieldForm>({ deposit: '', quests: '0', network: 'Avalanche', withdraw: '', token: 'USDT' });
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);
  const { setShowMessage } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to calculate yield!');
      return;
    }
    const deposit = parseFloat(yieldForm.deposit);
    const quests = parseInt(yieldForm.quests);
    if (isNaN(deposit) || deposit < 100 || isNaN(quests) || quests < 0 || quests > 10) {
      setShowMessage(
        deposit < 100 ? '⚠️ Please enter a valid deposit amount (minimum $100).' :
        '⚠️ Quests must be between 0 and 10.'
      );
      return;
    }
    try {
      await handleCalculateYield(e);
      setYieldResult({
        baseYield: deposit * (deposit >= 100000 ? 0.033 : deposit >= 50000 ? 0.031 : deposit >= 25000 ? 0.028 : deposit >= 10000 ? 0.025 : deposit >= 5000 ? 0.022 : deposit >= 2500 ? 0.019 : deposit >= 1000 ? 0.016 : deposit >= 500 ? 0.013 : 0.01),
        bonusYield: deposit * (quests * 0.0003),
        totalYield: deposit * (quests * 0.0003) + deposit * (deposit >= 100000 ? 0.033 : deposit >= 50000 ? 0.031 : deposit >= 25000 ? 0.028 : deposit >= 10000 ? 0.025 : deposit >= 5000 ? 0.022 : deposit >= 2500 ? 0.019 : deposit >= 1000 ? 0.016 : deposit >= 500 ? 0.013 : 0.01),
        tier: deposit >= 100000 ? 'Mythic PET' : deposit >= 50000 ? 'Elder' : deposit >= 25000 ? 'Alchemist' : deposit >= 10000 ? 'Archon' : deposit >= 5000 ? 'Sage' : deposit >= 2500 ? 'Guardian' : deposit >= 1000 ? 'Seeker' : deposit >= 500 ? 'Apprentice' : 'Initiate',
      });
      setShowMessage(`✅ Yield calculated for ${yieldForm.deposit} USDT and ${yieldForm.quests} quests!`);
    } catch (err) {
      console.error('Yield calculation error:', err);
      setShowMessage('⚠️ Failed to calculate yield. Please try again.');
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
              placeholder="Enter deposit amount"
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
            <p className="text-gray-300 font-inter">Base Yield: ${yieldResult.baseYield.toFixed(2)}/month</p>
            <p className="text-gray-300 font-inter">Bonus Yield: ${yieldResult.bonusYield.toFixed(2)}/month</p>
            <p className="text-rose-400 font-bold font-inter">Total Yield: ${yieldResult.totalYield.toFixed(2)}/month</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default YieldCalculator;