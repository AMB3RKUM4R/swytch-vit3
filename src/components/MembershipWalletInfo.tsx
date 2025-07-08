import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Trophy } from 'lucide-react';

// Define props to match PageProps from App.tsx
interface MembershipWalletInfoProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const MembershipWalletInfo: FC<MembershipWalletInfoProps> = ({ userId, jewelsBalance, isPETMember, setShowMessage, setActiveModal }) => {
  const handleConnect = () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to connect wallet!');
      setActiveModal('auth');
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="text-center text-sm text-gray-300 font-inter bg-gray-900/50 border border-rose-400/20 p-4 rounded-lg backdrop-blur-md bg-gradient-to-r from-rose-400/10 to-cyan-500/10 bg-noise"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <Wallet className="w-5 h-5 text-rose-400 animate-pulse" aria-hidden="true" />
          <p>
            Wallet: {userId ? `${userId.slice(0, 6)}...${userId.slice(-4)}` : 'Not connected'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-rose-400 animate-pulse" aria-hidden="true" />
          <p>Status: {isPETMember ? 'PET Member' : 'Non-Member'}</p>
        </div>
        <p>JEWELS Balance: {jewelsBalance.toFixed(2)}</p>
        {!userId && (
          <motion.button
            className="px-4 py-2 rounded-full bg-rose-400 text-white font-poppins hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-rose-400"
            onClick={handleConnect}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Connect wallet"
          >
            Connect Wallet
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default MembershipWalletInfo;