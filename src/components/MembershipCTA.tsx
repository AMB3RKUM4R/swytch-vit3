import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from '@/context/ModalContext';

interface MembershipCTAProps {
  isPETMember: boolean;
  isPending: boolean;
  authLoading: boolean;
  userId: string | null;
  payMembership: () => Promise<void>;
}

const scaleUp: Variants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } };

const MembershipCTA: React.FC<MembershipCTAProps> = ({ isPETMember, isPending, authLoading, userId, payMembership }) => {
  const { setShowMessage } = useModal();
  const { isConnected } = useAccount();

  const handlePay = async () => {
    if (!isConnected) {
      setShowMessage('⚠️ Please connect your wallet!');
      return;
    }
    try {
      await payMembership();
    } catch (err) {
      setShowMessage('⚠️ Payment failed. Please try again.');
    }
  };

  return (
    <motion.div variants={scaleUp} className="text-center">
      <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 mb-6 font-poppins">
        <Sparkles className="w-10 h-10 text-neon-green animate-pulse" /> Join the PETverse
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 font-inter">
        Become a Swytch PET for just $10 USDT (₹830) to access exclusive gameplay, earn JEWELS, and power your decentralized financial journey.
      </p>
      <motion.button
        className={`px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isPETMember ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
        onClick={isPETMember ? undefined : handlePay}
        disabled={isPETMember || isPending || authLoading || !userId}
        whileHover={{ scale: isPETMember || isPending || authLoading || !userId ? 1 : 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
        whileTap={{ scale: isPETMember || isPending || authLoading || !userId ? 1 : 0.95 }}
        aria-label={isPETMember ? 'Already a PET' : isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT'}
      >
        {isPETMember ? 'PET Member' : isPending ? 'Processing...' : 'Buy Swytch PET for $10 USDT'}
      </motion.button>
    </motion.div>
  );
};

export default MembershipCTA;