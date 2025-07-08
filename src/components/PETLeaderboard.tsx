import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  jewels: number;
  level: string;
  avatar: string;
}

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'AstraRebel', jewels: 15000, level: 'Mythic PET', avatar: '/avatar1.jpg' },
  { rank: 2, name: 'QuantumSage', jewels: 12000, level: 'Elder', avatar: '/avatar2.jpg' },
  { rank: 3, name: 'NovaGuardian', jewels: 9000, level: 'Alchemist', avatar: '/avatar3.jpg' },
  { rank: 4, name: 'CipherOracle', jewels: 7000, level: 'Archon', avatar: '/avatar4.jpg' },
  { rank: 5, name: 'LunarSeeker', jewels: 5000, level: 'Sage', avatar: '/avatar5.jpg' },
];

const PETLeaderboard: React.FC = () => {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }}} className="relative space-y-6">
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Trophy className="w-8 h-8 text-rose-400 animate-pulse" /> PET Leaderboard
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Celebrate the top PETs driving Swytch’s growth.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-4">
          {leaderboard.map((pet) => (
            <motion.div
              key={pet.rank}
              className="flex items-center gap-4 bg-gray-900/80 p-4 rounded-lg border border-rose-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <img src={pet.avatar} alt={pet.name} className="w-12 h-12 rounded-full border border-rose-500/20" />
              <div className="flex-1">
                <p className="text-white font-bold font-poppins">#{pet.rank} {pet.name}</p>
                <p className="text-sm text-gray-400 font-inter">{pet.level}</p>
              </div>
              <p className="text-rose-400 font-semibold font-poppins">{pet.jewels} JEWELS</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PETLeaderboard;