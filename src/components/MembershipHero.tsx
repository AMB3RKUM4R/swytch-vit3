import { motion, Variants } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useModal } from '@/context/ModalContext'; // Keep useModal for context functions

// IMPORTANT: Import MembershipHeroProps from lib/types.ts
import { MembershipHeroProps as ImportedMembershipHeroProps } from '../lib/types';


const fadeUp: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

const MembershipHero: React.FC<ImportedMembershipHeroProps> = ({ isPETMember, isPending, authLoading, userId, payMembership }) => {
  const { setShowMessage } = useModal();
  const { isConnected } = useAccount();

  const handlePay = async () => {
    if (!userId) { // Ensure user is logged in
      setShowMessage('⚠️ Please sign in first!');
      return;
    }
    if (!isConnected) { // Ensure wallet is connected
      setShowMessage('⚠️ Please connect your wallet!');
      return;
    }
    // No need to check isPETMember, isPending, authLoading here, as 'disabled' prop handles button state.
    
    try {
      await payMembership();
    } catch (err) {
      setShowMessage('⚠️ Payment failed. Please try again.');
    }
  };

  // Determine if the button should be disabled
  const isDisabled = isPETMember || isPending || authLoading || !userId || !isConnected;

  return (
    <motion.div variants={fadeUp} className="text-center">
      <h2 className="text-5xl sm:text-7xl font-extrabold text-purple-500 font-poppins mb-6 flex items-center justify-center gap-4">
        <Rocket className="w-12 h-12 text-cyan-400 animate-pulse" /> {/* FIX: Changed text-neon-green to text-cyan-400 */}
        Swytch PET Membership
      </h2>
      <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
        Join the Swytch Energy Trust as a PET to unlock AI-driven yields, exclusive gameplay rewards, and governance in our decentralized ecosystem.
      </p>
      <motion.button
        className={`mt-8 px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
        onClick={isDisabled ? undefined : handlePay} // Only set onClick if not disabled
        disabled={isDisabled}
        // FIX: Simplify whileHover and whileTap logic
        whileHover={isDisabled ? {} : { scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
        whileTap={isDisabled ? {} : { scale: 0.95 }}
        aria-label={isPETMember ? 'Already a PET' : (isDisabled ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT')}
      >
        {isPETMember ? 'PET Member' : (isPending || authLoading ? 'Processing...' : 'Buy Swytch PET for $10 USDT')}
      </motion.button>
    </motion.div>
  );
};

export default MembershipHero;