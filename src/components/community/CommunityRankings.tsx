// src/components/community/CommunityRankings.tsx
import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gem, BarChart, User as UserIcon, Loader2 } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { PlayerData } from '@/lib/types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { usePlayer } from '@/components/context/PlayerContext';

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  joules: number;
  avatar: string | null;
}

const CommunityRankings: FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playerData } = usePlayer();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(
      collection(db, 'Players'),
      orderBy('joules', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLeaderboard: LeaderboardEntry[] = [];
      let rank = 1;
      snapshot.forEach(doc => {
        const data = doc.data() as PlayerData;
        fetchedLeaderboard.push({
          rank: rank++,
          name: data.username || `Hunter-${doc.id.slice(0, 4)}`,
          level: data.level,
          joules: data.joules,
          avatar: data.profilePictureUrl || null,
        });
      });
      setLeaderboardData(fetchedLeaderboard);
      setLoading(false);
    }, (err) => {
      console.error('Failed to fetch leaderboard:', err);
      // NOTE: This will require a Firestore index on 'joules' field.
      setError('Failed to load leaderboard. Check console for index creation link.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SwytchCard  className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Trophy className="w-7 h-7 text-primary" /> Top Hunters
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-center text-rose-400">{error}</p>
      ) : leaderboardData.length === 0 ? (
        <p className="text-center text-gray-400">No rankings available yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {leaderboardData.map((entry) => (
            <motion.div
              key={entry.rank}
              className={`bg-gray-800/50 p-3 rounded-lg border flex items-center justify-between
                ${entry.name === playerData?.username ? 'border-primary' : 'border-gray-700'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-xl text-primary w-8 text-center">{entry.rank}.</span>
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center border border-primary/20">
                  {entry.avatar ? (
                    <img 
                      src={entry.avatar} 
                      alt={entry.name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = `https://placehold.co/40x40/7e22ce/FFFFFF?text=${entry.name[0] || 'U'}`)}
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{entry.name}</p>
                  <p className="text-sm text-gray-400">Level {entry.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-yellow-400" />
                <p className="text-primary font-bold">{entry.joules.toFixed(0)}</p>
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