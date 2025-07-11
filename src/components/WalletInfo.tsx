import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { WalletInfoProps } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const WalletInfo: FC<WalletInfoProps> = memo(({ isPETMember, jewelsBalance, address, chain, xpBalance, loginStreak }) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="text-sm text-rose-300 italic text-center max-w-xl mx-auto font-mono"
    >
      <p>
        🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
        🔗 Network: {chain?.name || 'Unknown'} | 
        💼 Status: {isPETMember ? 'PET Member' : 'Non-Member'} | 
        💎 JEWELS: {jewelsBalance.toFixed(2)} | 
        🧠 XP: {xpBalance} | 
        🔥 Streak: {loginStreak} days
      </p>
    </motion.div>
  );
});

export default WalletInfo;