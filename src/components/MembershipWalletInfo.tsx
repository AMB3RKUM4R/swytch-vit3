import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Trophy } from 'lucide-react';

// IMPORTANT: Import MembershipWalletInfoProps from lib/types.ts
import { MembershipWalletInfoProps as ImportedMembershipWalletInfoProps } from '../lib/types';


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Use ImportedMembershipWalletInfoProps as the type for the FC
const MembershipWalletInfo: FC<ImportedMembershipWalletInfoProps> = ({ userId, jewelsBalance, isPETMember, setShowMessage, setActiveModal }) => {
  const handleConnect = () => {
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
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
        {!userId && ( // Only show connect button if not logged in
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