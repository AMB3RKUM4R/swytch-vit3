import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';


interface BenefitsHeroProps {
  userId: string | null;
  jewelsBalance: number;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

const BenefitsHero: FC<BenefitsHeroProps> = memo(({ userId, jewelsBalance }) => {
  const { isConnected } = useAccount();
  const { setActiveModal, setShowMessage } = useModal();

  const handleJoin = () => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to join the Petaverse!');
      return;
    }
    setShowMessage('ℹ️ Connecting wallet...');
    setActiveModal('payment');
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
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-cyan-900/60 rounded-2xl" />
      <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
        <motion.div
          className="absolute top-6 left-6 w-3 h-3 bg-rose-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-6 right-6 w-4 h-4 bg-cyan-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
        />
      </motion.div>
      <div className="relative space-y-6 p-8 text-center">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins"
          animate={{ y: [0, -8, 0], transition: { duration: 3, repeat: Infinity } }}
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
                if (!isConnected) {
                  openConnectModal();
                  handleJoin();
                } else {
                  handleJoin();
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