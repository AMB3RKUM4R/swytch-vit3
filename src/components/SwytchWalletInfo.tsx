import { motion } from 'framer-motion';

interface SwytchWalletInfoProps {
  address: string | undefined;
  isConnected: boolean;
  chain: { name: string } | undefined;
  xpBalance: number;
  loginStreak: number;
}

const SwytchWalletInfo: React.FC<SwytchWalletInfoProps> = ({ address, isConnected, chain, xpBalance, loginStreak }) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="text-sm text-rose-300 italic text-center max-w-xl mx-auto font-inter"
    >
      <p>
        🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
        🔗 Network: {chain?.name || 'Unknown'} | 
        💼 Status: {isConnected ? 'Active' : 'Inactive'} | 
        🧠 XP: {xpBalance} | 
        🔥 Streak: {loginStreak} days
      </p>
    </motion.div>
  );
};

export default SwytchWalletInfo;