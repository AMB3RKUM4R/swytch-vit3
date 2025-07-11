import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useState } from 'react';
import { ReferralLeaderboardEntry, ReferralLeaderboardProps } from '@/lib/types';

const leaderboard: ReferralLeaderboardEntry[] = [
  { address: '0x1a...f9B2', referrals: 42, rewards: '500 JEWELS' },
  { address: '0x5b...cD4E', referrals: 35, rewards: '350 JEWELS' },
  { address: '0x9c...eF67', referrals: 28, rewards: '200 JEWELS' },
  { address: '0x3d...aB89', referrals: 15, rewards: '100 JEWELS' },
];

const ReferralLeaderboard: React.FC<ReferralLeaderboardProps> = ({ leaderboard: propsLeaderboard}) => {
  const displayLeaderboard = propsLeaderboard.length > 0 ? propsLeaderboard : leaderboard;
  const [rankFilter, setRankFilter] = useState<'all' | 'jewels'>('all');

  const filteredRankings = [...displayLeaderboard].sort((a, b) => {
    if (rankFilter === 'jewels') {
      const rewardsA = parseFloat(a.rewards.replace(' JEWELS', ''));
      const rewardsB = parseFloat(b.rewards.replace(' JEWELS', ''));
      return rewardsB - rewardsA;
    }
    return a.referrals - b.referrals; // Default sort by referrals
  });

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
        <div className="flex gap-2 mb-4">
          <motion.button
            className={`px-4 py-2 rounded-md font-semibold font-poppins ${rankFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
            onClick={() => {
              setRankFilter('all');
            }}
            whileHover={{ scale: 1.05 }}
            aria-label="Filter by All"
          >
            All
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-md font-semibold font-poppins ${rankFilter === 'jewels' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
            onClick={() => {
              setRankFilter('jewels');
            }}
            whileHover={{ scale: 1.05 }}
            aria-label="Filter by Top JEWELS"
          >
            Top JEWELS
          </motion.button>
        </div>
        <div className="space-y-4">
          {filteredRankings.map((entry) => (
            <motion.div
              key={entry.address}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-900/60 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: displayLeaderboard.indexOf(entry) * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-rose-400 font-bold text-lg">{displayLeaderboard.indexOf(entry) + 1}.</span>
                <p className="text-white font-mono">{entry.address}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-sm font-inter">{entry.referrals} Referrals</p>
                <p className="text-rose-400 font-semibold font-poppins">{entry.rewards}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReferralLeaderboard;