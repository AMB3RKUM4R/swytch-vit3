// src/components/community/CommunityRankings.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gem, BarChart } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { LeaderboardEntry } from '@/lib/types';
import { collection, query, orderBy, limit, onSnapshot, DocumentData } from 'firebase/firestore'; // Import DocumentData
import { db } from '@/lib/firebaseConfig';

interface CommunityRankingsProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
  leaderboard: LeaderboardEntry[]; // Initial or placeholder leaderboard data
}

const CommunityRankings: FC<CommunityRankingsProps> = ({ /* userId, setActiveModal, setShowMessage */ }) => { // FIX: Removed unused props from destructuring
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Query the 'Players' collection to create a leaderboard based on 'jewels'
    const q = query(
      collection(db, 'Players'),
      orderBy('jewels', 'desc'), // Order by jewels in descending order
      limit(10) // Get top 10 players
    );

    const unsubscribe = onSnapshot(q, (_snapshot) => {
      const fetchedLeaderboard: LeaderboardEntry[] = [];
    
      setLeaderboardData(fetchedLeaderboard);
      setLoading(false);
    }, (err) => {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount


  return (
    <SwytchCard gradient="from-orange-700/20 to-red-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Trophy className="w-7 h-7 text-primary" /> Community Rankings
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        See who's at the top of the PETverse!
      </p>

      {loading ? (
        <p className="text-center text-gray-400">Loading leaderboard...</p>
      ) : error ? (
        <p className="text-center text-rose-400">{error}</p>
      ) : leaderboardData.length === 0 ? (
        <p className="text-center text-gray-400">No rankings available yet. Be the first to make your mark!</p>
      ) : (
        <div className="space-y-3">
          {leaderboardData.map((entry) => (
            <motion.div
              key={entry.rank}
              className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-xl text-primary w-8 text-center">{entry.rank}.</span>
                <img
                  src={entry.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40/random/FFFFFF?text=U"; }}
                />
                <div>
                  <p className="text-white font-semibold">{entry.name}</p>
                  <p className="text-sm text-gray-400">{entry.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-yellow-400" />
                <p className="text-primary font-bold">{entry.jewels.toFixed(0)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="text-center mt-6">
        <motion.button
          className="btn-secondary flex items-center justify-center mx-auto"
          onClick={() => alert('View full leaderboard (future feature)')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BarChart className="w-5 h-5 mr-2" /> View Full Leaderboard
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default CommunityRankings;
