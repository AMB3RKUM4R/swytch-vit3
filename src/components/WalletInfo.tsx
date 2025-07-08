import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

interface WalletInfoProps {
  isPETMember: boolean;
  goldBalance: number;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ isPETMember, goldBalance }) => {
  const { address, chain } = useAccount();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="text-sm text-rose-300 italic text-center max-w-xl mx-auto font-mono"
    >
      <p>
        🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
        🔗 Network: {chain?.name || 'Unknown'} | 
        💼 Status: {isPETMember ? 'PET Member' : 'Non-Member'} | 
        💎 JEWELS: {goldBalance}
      </p>
    </motion.div>
  );
};

export default WalletInfo;