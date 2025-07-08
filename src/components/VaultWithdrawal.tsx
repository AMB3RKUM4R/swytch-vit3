import { FC } from 'react';
import { motion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';

interface VaultWithdrawalProps {
  isConnected: boolean;
  isMember: boolean;
  isPending: boolean;
  withdrawalAmount: string;
  setWithdrawalAmount: React.Dispatch<React.SetStateAction<string>>;
  handleWithdrawal: () => Promise<void>;
  handlePayPalPayment: () => Promise<void>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VaultWithdrawal: FC<VaultWithdrawalProps> = ({
  isConnected,
  isMember,
  isPending,
  withdrawalAmount,
  setWithdrawalAmount,
  handleWithdrawal,
  handlePayPalPayment,
}) => {
  const { setShowMessage } = useModal();

  const onWithdraw = async () => {
    if (!isConnected) {
      setShowMessage('⚠️ Please connect your wallet.');
      return;
    }
    try {
      await handleWithdrawal();
    } catch (err) {
      setShowMessage(`⚠️ Withdrawal failed: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  const onPayPal = async () => {
    if (!isMember) {
      setShowMessage('⚠️ Select a membership first.');
      return;
    }
    try {
      await handlePayPalPayment();
    } catch (err) {
      setShowMessage(`⚠️ PayPal payment failed: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  return (
    <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-xs mb-1 block text-gray-400 font-inter">Withdraw (min $10)</label>
        <input
          type="number"
          value={withdrawalAmount}
          onChange={(e) => setWithdrawalAmount(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 bg-gray-900 border-neon-green/20 text-white text-sm font-inter focus:ring-2 focus:ring-neon-green"
          aria-label="Withdrawal amount"
        />
        <motion.button
          onClick={onWithdraw}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded-xl text-sm transition font-poppins"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isPending || !isMember}
          aria-label="Withdraw USDT"
        >
          {isPending ? 'Processing...' : 'Withdraw USDT'}
        </motion.button>
      </div>
      <div>
        <label className="text-xs mb-1 block text-gray-400 font-inter">PayPal Payment</label>
        <p className="text-gray-300 text-sm font-inter">PayPal payments are processed via email confirmation.</p>
        <motion.button
          onClick={onPayPal}
          className="mt-2 bg-purple-500 hover:bg-purple-600 text-white w-full py-2 rounded-xl text-sm transition flex items-center justify-center gap-1 font-poppins"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isPending || !isMember}
          aria-label="Pay with PayPal"
        >
          {isPending ? 'Processing...' : 'Pay with PayPal'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VaultWithdrawal;