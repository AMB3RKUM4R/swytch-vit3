import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface AdminPayoutProps {
  isConnected: boolean;
  address: string | undefined;
  isPending: boolean;
  handlePayout: () => Promise<void>;
  payoutAddress: `0x${string}` | '';
  setPayoutAddress: React.Dispatch<React.SetStateAction<`0x${string}` | ''>>;
  payoutAmount: string;
  setPayoutAmount: React.Dispatch<React.SetStateAction<string>>;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } },
};

const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '0x1234567890123456789012345678901234567890';

const AdminPayout: FC<AdminPayoutProps> = memo(({ isConnected, address, isPending, handlePayout, payoutAddress, setPayoutAddress, payoutAmount, setPayoutAmount }) => {
  const { setShowMessage } = useModal();

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (/^[0-9a-fA-F]{40}$/.test(value)) {
      value = `0x${value}`;
    }
    setPayoutAddress(value as `0x${string}` | '');
  };

  const onPayout = async () => {
    if (!auth.currentUser) {
      setShowMessage('⚠️ Sign in as admin to initiate payouts!');
      return;
    }
    if (!isConnected || !address || address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      setShowMessage('⚠️ Only admins can initiate payouts.');
      return;
    }
    try {
      await handlePayout();
      setShowMessage('✅ Payout initiated!');
    } catch (err) {
      setShowMessage(`⚠️ Payout failed: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  return (
    <motion.div
      variants={sectionVariants}
      className="relative bg-gray-900/70 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 rounded-3xl"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="relative space-y-6">
        <h3 className="text-3xl font-extrabold text-white text-center font-poppins">Admin Payout</h3>
        <p className="text-lg text-gray-300 text-center font-inter">Send USDT payouts to user wallets for JEWELS or SWYT rewards.</p>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Recipient Address (0x...)"
            value={payoutAddress}
            onChange={handleAddressChange}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-rose-500/20 focus:ring-2 focus:ring-cyan-500 font-inter"
            aria-label="Recipient address"
          />
          <input
            type="number"
            placeholder="Amount in USDT"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-rose-500/20 focus:ring-2 focus:ring-cyan-500 font-inter"
            aria-label="Payout amount"
          />
          <motion.button
            onClick={onPayout}
            className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-cyan-500 transition-all font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Initiate payout"
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Send Payout'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default AdminPayout;