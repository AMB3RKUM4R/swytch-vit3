import { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi'; // useAccount is used, correct
import { useModal } from '@/context/ModalContext'; // useModal is used, correct

// MembershipCTAProps interface (will be moved to lib/types.ts later)
interface MembershipCTAProps {
  isPETMember: boolean;
  isPending: boolean;
  authLoading: boolean;
  userId: string | null;
  payMembership: () => Promise<void>;
}

const scaleUp: Variants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } };

const MembershipCTA: React.FC<MembershipCTAProps> = memo(({ isPETMember, isPending, authLoading, userId, payMembership }) => {
  const { setShowMessage } = useModal();
  const { isConnected } = useAccount(); // Get isConnected from useAccount

  const handlePay = async () => {
    // Re-check conditions here, although disabled prop handles primary cases.
    if (!userId) { // Ensure user is logged in
      setShowMessage('⚠️ Please sign in first!');
      return;
    }
    if (!isConnected) { // Ensure wallet is connected
      setShowMessage('⚠️ Please connect your wallet!');
      return;
    }
    if (isPETMember) { // Already a member
      setShowMessage('ℹ️ You are already a PET Member!');
      return;
    }
    if (isPending || authLoading) { // Payment/auth is in progress
        setShowMessage('ℹ️ Processing in progress, please wait.');
        return;
    }

    try {
      await payMembership(); // Call the prop function
    } catch (err) {
      setShowMessage('⚠️ Payment failed. Please try again.');
    }
  };

  const isDisabled = isPETMember || isPending || authLoading || !userId || !isConnected;

  return (
    <motion.div variants={scaleUp} className="text-center">
      <h3 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 mb-6 font-poppins">
        <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" /> {/* Changed neon-green to cyan-400 for consistency */}
        Join the PETverse
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 font-inter">
        Become a Swytch PET for just $10 USDT (₹830) to access exclusive gameplay, earn JEWELS, and power your decentralized financial journey.
      </p>
      <motion.button
        className={`px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
        onClick={isDisabled ? undefined : handlePay} // Only set onClick if not disabled
        disabled={isDisabled}
        // Simplify whileHover and whileTap logic based on isDisabled
        whileHover={isDisabled ? {} : { scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }} // Simplified boxShadow color to match example
        whileTap={isDisabled ? {} : { scale: 0.95 }}
        aria-label={isPETMember ? 'Already a PET' : (isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT')}
      >
        {isPETMember ? 'PET Member' : (isPending || authLoading ? 'Processing...' : 'Buy Swytch PET for $10 USDT')}
      </motion.button>
    </motion.div>
  );
});

export default MembershipCTA;