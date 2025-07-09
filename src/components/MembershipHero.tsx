import { motion, Variants } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from '@/context/ModalContext';

interface MembershipHeroProps {
  isPETMember: boolean;
  isPending: boolean;
  authLoading: boolean;
  userId: string | null;
  payMembership: () => Promise<void>;
}

const fadeUp: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

const MembershipHero: React.FC<MembershipHeroProps> = ({ isPETMember, isPending, authLoading, userId, payMembership }) => {
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
    <motion.div variants={fadeUp} className="text-center">
      <h2 className="text-5xl sm:text-7xl font-extrabold text-purple-500 font-poppins mb-6 flex items-center justify-center gap-4">
        <Rocket className="w-12 h-12 text-neon-green animate-pulse" /> Swytch PET Membership
      </h2>
      <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
        Join the Swytch Energy Trust as a PET to unlock AI-driven yields, exclusive gameplay rewards, and governance in our decentralized ecosystem.
      </p>
      <motion.button
        className={`mt-8 px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isPETMember ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
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

export default MembershipHero;