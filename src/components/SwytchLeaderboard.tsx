import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

interface SwytchLeaderboardEntry {
  name: string;
  level: number;
  jewels: number;
}

const swytchLeaderboard: SwytchLeaderboardEntry[] = [
  { name: 'QuantumPET', level: 9, jewels: 15000 },
  { name: 'StarSeeker', level: 7, jewels: 8000 },
  { name: 'VaultSage', level: 5, jewels: 4000 },
  { name: 'EnergyAlchemist', level: 4, jewels: 2000 },
  { name: 'NewInitiate', level: 1, jewels: 1000 }
];

const SwytchLeaderboard: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
    >
      <SwytchCard gradient="from-pink-500/10 to-rose-500/10">
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center gap-3 font-poppins">
            <Users className="w-8 h-8 text-pink-400 animate-pulse" /> Leaderboard
          </h3>
          <p className="text-gray-300 font-inter">See who’s dominating the PETverse!</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 font-inter">
                  <th className="p-2">Rank</th>
                  <th className="p-2">Player</th>
                  <th className="p-2">Level</th>
                  <th className="p-2">JEWELS</th>
                </tr>
              </thead>
              <tbody>
                {swytchLeaderboard.map((entry, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="p-2 text-white font-inter">{i + 1}</td>
                    <td className="p-2 text-white font-inter">{entry.name}</td>
                    <td className="p-2 text-gray-300 font-inter">{entry.level}</td>
                    <td className="p-2 text-gray-300 font-inter">{entry.jewels.toLocaleString()} JEWELS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
};

export default SwytchLeaderboard;