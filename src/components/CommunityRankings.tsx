import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useState } from 'react';

// IMPORTANT: Import LeaderboardEntry and CommunityRankingsProps from lib/types.ts
import { LeaderboardEntry, CommunityRankingsProps as ImportedCommunityRankingsProps } from '../lib/types';


// LeaderboardEntry interface is now imported from lib/types.ts
// leaderboard data is local mock data; in production, this would be fetched from Firestore.
const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'AstraRebel', jewels: 15000, level: 'Mythic PET', avatar: '/avatar1.jpg' },
  { rank: 2, name: 'QuantumSage', jewels: 12000, level: 'Elder', avatar: '/avatar2.jpg' },
  { rank: 3, name: 'NovaGuardian', jewels: 9000, level: 'Alchemist', avatar: '/avatar3.jpg' },
  { rank: 4, name: 'CipherOracle', jewels: 7000, level: 'Archon', avatar: '/avatar4.jpg' },
  { rank: 5, name: 'LunarSeeker', jewels: 5000, level: 'Sage', avatar: '/avatar5.jpg' },
];

const CommunityRankings: React.FC<ImportedCommunityRankingsProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const [rankFilter, setRankFilter] = useState<'all' | 'jewels' | 'level'>('all');
  // Removed const { setActiveModal, setShowMessage } = useModal(); as they are now passed as props

  const filteredRankings = [...leaderboard].sort((a, b) => {
    if (rankFilter === 'jewels') return b.jewels - a.jewels;
    if (rankFilter === 'level') {
      const levels = ['Mythic PET', 'Elder', 'Alchemist', 'Archon', 'Sage'];
      return levels.indexOf(a.level) - levels.indexOf(b.level);
    }
    return a.rank - b.rank;
  });

  const handleRankingClick = (name: string) => {
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to interact with rankings!');
      return;
    }
    setShowMessage(`ℹ️ Viewing ${name}'s profile! Deposit to compete!`);
    setActiveModal('payment'); // Trigger payment modal as intended
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-6 relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'ur[](https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Trophy className="w-8 h-8 text-cyan-400 animate-pulse" /> Community Rankings
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        See top PETs shaping the Petaverse.
      </p>
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <div className="flex gap-2 mb-4">
          <motion.button
            className={`px-4 py-2 rounded-md font-semibold font-poppins ${rankFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
            onClick={() => setRankFilter('all')}
            whileHover={{ scale: 1.05 }}
            aria-label="Filter by All"
          >
            All
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-md font-semibold font-poppins ${rankFilter === 'jewels' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
            onClick={() => setRankFilter('jewels')}
            whileHover={{ scale: 1.05 }}
            aria-label="Filter by Top JEWELS"
          >
            Top JEWELS
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-md font-semibold font-poppins ${rankFilter === 'level' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-200'}`}
            onClick={() => setRankFilter('level')}
            whileHover={{ scale: 1.05 }}
            aria-label="Filter by Top Levels"
          >
            Top Levels
          </motion.button>
        </div>
        <div className="space-y-4">
          {filteredRankings.map((pet) => (
            <motion.div
              key={pet.rank} // Using rank as key assuming it's unique for mock data
              className="flex items-center gap-4 bg-gray-800/80 p-4 rounded-lg border border-cyan-500/20"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleRankingClick(pet.name)}
            >
              <img src={pet.avatar} alt={pet.name} className="w-12 h-12 rounded-full border border-cyan-500/20" onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }} />
              <div className="flex-1">
                <p className="text-white font-bold font-poppins">#{pet.rank} {pet.name}</p>
                <p className="text-sm text-gray-400 font-inter">{pet.level}</p>
              </div>
              <p className="text-cyan-400 font-semibold font-poppins">{pet.jewels} JEWELS</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommunityRankings;