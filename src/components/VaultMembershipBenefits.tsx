import { FC } from 'react';
import { motion } from 'framer-motion';
import { Coins, LineChart, UserCheck } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VaultMembershipBenefits: FC = () => {
  return (
    <motion.div variants={fadeUp}>
      <SwytchCard gradient="from-purple-500/10 to-neon-green/10">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-4 font-poppins">
          <Coins className="text-neon-green animate-pulse" /> Membership Benefits
        </h3>
        <p className="text-gray-300 mb-4 font-inter">
          As a Swytch PET, unlock exclusive gameplay rewards, voting rights, and up to 5% monthly yields in our decentralized ecosystem.
        </p>
        <ul className="space-y-2 text-gray-300 text-sm font-inter">
          <li className="flex items-center gap-2">
            <Coins className="text-neon-green" /> Earn JEWELS through daily quests and Energy Vault interactions.
          </li>
          <li className="flex items-center gap-2">
            <LineChart className="text-neon-green" /> Convert SWYT to USDT for trading or withdrawals.
          </li>
          <li className="flex items-center gap-2">
            <UserCheck className="text-neon-green" /> Access private channels and governance voting.
          </li>
        </ul>
      </SwytchCard>
    </motion.div>
  );
};

export default VaultMembershipBenefits;