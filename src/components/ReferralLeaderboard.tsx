import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  address: string;
  referrals: number;
  rewards: string;
}

const leaderboard: LeaderboardEntry[] = [
  { address: '0x1a...f9B2', referrals: 42, rewards: '500 JEWELS' },
  { address: '0x5b...cD4E', referrals: 35, rewards: '350 JEWELS' },
  { address: '0x9c...eF67', referrals: 28, rewards: '200 JEWELS' },
  { address: '0x3d...aB89', referrals: 15, rewards: '100 JEWELS' },
];

const ReferralLeaderboard: React.FC = () => {
  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Trophy className="w-8 h-8 text-rose-400 animate-pulse" /> Referral Leaderboard
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Invite friends to the Swytch Petaverse and earn JEWELS for every referral!
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        {leaderboard.map((entry, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-900/60 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-bold text-lg">{index + 1}.</span>
              <p className="text-white font-mono">{entry.address}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm font-inter">{entry.referrals} Referrals</p>
              <p className="text-rose-400 font-semibold font-poppins">{entry.rewards}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ReferralLeaderboard;