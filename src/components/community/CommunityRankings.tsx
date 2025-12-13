import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gem, User as UserIcon, Loader2 } from 'lucide-react';
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
          name: data.username || `OP-${doc.id.slice(0, 4)}`,
          level: data.level,
          joules: data.joules,
          avatar: data.profilePictureUrl || null,
        });
      });
      setLeaderboardData(fetchedLeaderboard);
      setLoading(false);
    }, (err) => {
      console.error('Failed to fetch leaderboard:', err);
      setError('DATA STREAM INTERRUPTED');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SwytchCard className="p-6 border-gray-800">
      <h2 className="text-xl font-black italic text-white uppercase mb-6 text-center flex items-center justify-center gap-2 tracking-tighter">
        <Trophy className="w-6 h-6 text-[#39FF14]" /> Top Operators
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 font-mono text-xs">{error}</p>
      ) : leaderboardData.length === 0 ? (
        <p className="text-center text-gray-500 font-mono text-xs">NO DATA AVAILABLE</p>
      ) : (
        <div className="space-y-2 font-mono">
          {leaderboardData.map((entry) => (
            <motion.div
              key={entry.rank}
              className={`p-3 rounded-sm border flex items-center justify-between transition-colors
                ${entry.name === playerData?.username 
                    ? 'border-[#39FF14] bg-[#39FF14]/5' 
                    : 'border-gray-800 bg-black hover:border-gray-600'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <span className={`font-bold text-lg w-6 text-center ${entry.rank <= 3 ? 'text-[#39FF14]' : 'text-gray-500'}`}>
                    {entry.rank}
                </span>
                <div className="w-8 h-8 rounded-sm bg-black border border-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {entry.avatar ? (
                    <img 
                      src={entry.avatar} 
                      alt={entry.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-xs uppercase tracking-wide">{entry.name}</p>
                  <p className="text-[10px] text-gray-500">LVL {entry.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#050505] px-2 py-1 border border-gray-800 rounded-sm">
                <Gem className="w-3 h-3 text-[#39FF14]" />
                <p className="text-[#39FF14] font-bold text-xs">{entry.joules.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="text-center mt-6">
        <button
          className="px-6 py-2 border border-[#39FF14] text-[#39FF14] text-[10px] font-bold uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors"
          onClick={() => alert('View full leaderboard (future feature)')}
        >
          VIEW_FULL_LOGS
        </button>
      </div>
    </SwytchCard>
  );
};

export default CommunityRankings;