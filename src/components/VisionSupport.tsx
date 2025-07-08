import { FC, memo, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { useModal } from '@/context/ModalContext';

interface VisionSupportProps {
  userId: string | null;
  investmentAmount: string;
  setInvestmentAmount: React.Dispatch<React.SetStateAction<string>>;
  logUpiIntent: (amount: number) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VisionSupport: FC<VisionSupportProps> = memo(({ userId, investmentAmount, setInvestmentAmount, logUpiIntent }) => {
  const { setShowMessage } = useModal();

  const handleUPIPayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      return;
    }
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setShowMessage('⚠️ Please enter a valid amount.');
      return;
    }
    await logUpiIntent(amount);
    setInvestmentAmount('');
  };

  return (
    <motion.div variants={containerVariants} className="space-y-8 text-center">
      <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Gift className="text-teal-400 w-6 h-6 animate-pulse" /> Support the PETverse
      </motion.h2>
      <motion.p variants={fadeUp} className="text-gray-300 max-w-xl mx-auto font-inter">
        Contribute via UPI to fuel Swytch’s future.
      </motion.p>
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6 items-center justify-center">
        <motion.div className="relative" whileHover={{ scale: 1.1 }}>
          <img
            src="/qr_donation.png"
            alt="UPI QR Code"
            className="w-32 h-32 rounded-lg border border-rose-500/30"
            onError={(e) => { e.currentTarget.src = '/fallback-qr.png'; }}
          />
          <p className="text-sm text-gray-400 mt-2 font-inter">Send UPI to deamonstillaliv3@icici</p>
        </motion.div>
        <SwytchCard gradient="from-rose-500/10 to-pink-500/10" className="max-w-md w-full">
          <motion.form
            className="space-y-4"
            onSubmit={handleUPIPayment}
          >
            <div className="relative">
              <h4 className="text-rose-400 font-bold text-lg mb-2 font-poppins">Pay via UPI</h4>
              <input
                type="number"
                name="amount"
                placeholder="Amount in INR"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full p-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 font-inter"
                aria-label="Investment Amount in INR"
                min="0"
                step="0.01"
              />
              <motion.button
                type="submit"
                className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold font-poppins"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Log UPI Payment Intent"
              >
                Log UPI Payment Intent
              </motion.button>
            </div>
          </motion.form>
        </SwytchCard>
      </motion.div>
    </motion.div>
  );
});

export default VisionSupport;