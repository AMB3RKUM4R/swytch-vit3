import { motion, Variants } from 'framer-motion';
import { Target } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

const fadeUp: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

const MembershipGameplay: React.FC = () => {
  return (
    <motion.div variants={fadeUp}>
      <SwytchCard gradient="from-neon-green/10 to-purple-500/10">
        <h3 className="text-3xl font-bold text-white flex items-center gap-3 mb-6 font-poppins">
          <Target className="w-8 h-8 text-neon-green animate-pulse" /> Gameplay Rewards
        </h3>
        <p className="text-lg text-gray-300 mb-6 font-inter">
          Earn JEWELS through daily quests, Energy Vault interactions, and referrals. Convert JEWELS to SWYT, our stablecoin, to fuel your decentralized financial journey or swap for USDT.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-neon-green/20">
            <p className="text-white font-semibold font-poppins">Daily Quests</p>
            <p className="text-sm text-gray-400 font-inter">Complete tasks like viewing transactions or sharing referrals to earn JEWELS and XP.</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-neon-green/20">
            <p className="text-white font-semibold font-poppins">Energy Vault</p>
            <p className="text-sm text-gray-400 font-inter">Click the vault daily to collect JEWELS, powering your PET progression.</p>
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
};

export default MembershipGameplay;