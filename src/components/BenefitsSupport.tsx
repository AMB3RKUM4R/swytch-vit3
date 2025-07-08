import { FC, memo, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface BenefitsSupportProps {
  userId: string | null;
  logUpiIntent: (amount: number) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const BenefitsSupport: FC<BenefitsSupportProps> = memo(({ userId, logUpiIntent }) => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleUPIPayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to contribute!');
      return;
    }
    const amountInput = e.currentTarget.querySelector('input[name="amount"]') as HTMLInputElement;
    const amount = parseFloat(amountInput?.value || '0');
    if (isNaN(amount) || amount <= 0) {
      setShowMessage('⚠️ Please enter a valid amount.');
      setActiveModal('error');
      return;
    }
    try {
      await logUpiIntent(amount);
      setShowMessage(`ℹ️ Initiating payment for ₹${amount}.`);
      setActiveModal('payment');
    } catch (err) {
      console.error('UPI payment error:', err);
      setShowMessage('⚠️ Failed to initiate payment. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <motion.h3
          variants={sectionVariants}
          className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins"
        >
          <Gift className="w-6 h-6 text-cyan-400 animate-pulse" /> Support the Petaverse
        </motion.h3>
        <motion.p variants={sectionVariants} className="text-gray-300 max-w-xl mx-auto font-inter">
          Contribute to the Swytch PET ecosystem and earn exclusive rewards!
        </motion.p>
        <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-md mx-auto p-6">
          <motion.form variants={sectionVariants} onSubmit={handleUPIPayment}>
            <label htmlFor="amount" className="sr-only">Contribution Amount</label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount in INR"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-cyan-500/20 focus:ring-2 focus:ring-cyan-500 font-inter"
              min="1"
              aria-label="Enter contribution amount in INR"
            />
            <motion.button
              type="submit"
              className="mt-4 w-full p-3 rounded-lg bg-rose-600 text-white hover:bg-cyan-500 font-semibold font-poppins"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Contribute via UPI"
            >
              Contribute via UPI
            </motion.button>
          </motion.form>
        </SwytchCard>
      </div>
    </motion.section>
  );
});

export default BenefitsSupport;