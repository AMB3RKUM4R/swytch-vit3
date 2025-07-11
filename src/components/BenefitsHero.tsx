import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
// Removed: import { useModal } from '@/context/ModalContext'; // FIX: No longer needed as props are passed
// Removed: import { auth } from '@/lib/firebaseConfig'; // FIX: No longer needed as userId prop is sufficient

// IMPORTANT: Only import BenefitsHeroProps from lib/types.ts
import { BenefitsHeroProps as ImportedBenefitsHeroProps } from '@/lib/types';


const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

// Use ImportedBenefitsHeroProps as the type for the FC
const BenefitsHero: FC<ImportedBenefitsHeroProps> = memo(({ userId, jewelsBalance, setActiveModal, setShowMessage }) => {
  const { isConnected } = useAccount();
  // Removed: const { setActiveModal, setShowMessage } = useModal(); // FIX: Redundant, props are passed

  const handleJoin = () => {
    // Rely on userId prop for authentication check
    if (!userId) { // Using userId prop directly
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to join the Petaverse!');
      return;
    }
    // If user is logged in, but wallet is not connected, openConnectModal will be handled by ConnectButton.Custom.
    // If user is logged in AND wallet is connected, then proceed to payment modal.
    if (isConnected) {
        setShowMessage('ℹ️ Proceeding to payment options...');
        setActiveModal('payment');
    } else {
        setShowMessage('ℹ️ Connecting wallet...');
        // The ConnectButton.Custom will trigger openConnectModal() when clicked.
        // We just ensure the message is set.
    }
  };

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="relative max-w-6xl mx-auto"
      style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop), url(/fallback-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: `center`, // Removed mousePosition dependency here as it's not a prop in BenefitsHeroProps
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-cyan-900/60 rounded-2xl" />
      <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
        <motion.div
          className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-6 h-6 bg-cyan-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
        />
      </motion.div>
      <div className="relative space-y-6 p-8 text-center">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins"
          animate={{ y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Sparkles className="w-8 h-8 animate-pulse text-cyan-400" /> Why Swytch PET?
        </motion.h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto font-inter">
          Swytch Private Energy Trust (PET) empowers you with financial sovereignty through decentralized tech and gamified rewards.
        </p>
        {userId && (
          <p className="text-gray-300 font-inter">
            Your JEWELS: <span className="font-bold text-cyan-400">{jewelsBalance}</span>
          </p>
        )}
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins"
              onClick={() => {
                if (!isConnected) { // If wallet not connected, open wallet connect modal
                  openConnectModal();
                } else { // If wallet is connected, but user might not be logged in or needs to proceed
                  handleJoin(); // This handles login check and then payment modal opening
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Join the Petaverse"
            >
              {isConnected ? 'Manage Wallet' : 'Join the Petaverse'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
            </motion.button>
          )}
        </ConnectButton.Custom>
      </div>
    </motion.div>
  );
});

export default BenefitsHero;