import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, User as UserIcon, Loader2, Crown } from 'lucide-react';
import { PlayerData } from '@/lib/types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { usePlayer } from '@/components/context/PlayerContext';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  level: number;
  value: number; // Represents either Gold or Joules depending on view
  avatar: string | null;
  tier: string;
}

const CommunityRankings: FC = () => {
  const { playerData } = usePlayer();
  const [metric, setMetric] = useState<'gold' | 'joules'>('joules');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Dynamic Query based on selected Metric
    const q = query(
      collection(db, 'Players'),
      orderBy(metric, 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: LeaderboardEntry[] = [];
      let rank = 1;
      
      snapshot.forEach(doc => {
        const data = doc.data() as PlayerData;
        fetched.push({
          id: doc.id,
          rank: rank++,
          name: data.username || `OP-${doc.id.slice(0, 4)}`,
          level: data.level || 1,
          value: metric === 'gold' ? (data.gold || 0) : (data.joules || 0),
          avatar: data.profilePictureUrl || null,
          tier: data.isPETMember ? 'ELITE' : 'ROOKIE'
        });
      });
      
      setLeaderboardData(fetched);
      setLoading(false);
    }, (err) => {
      console.error('Leaderboard Error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [metric]);

  return (
    <div className="h-full flex flex-col font-mono bg-black/50">
      
      {/* TABS */}
      <div className="flex border-b border-gray-800">
          <button 
            onClick={() => setMetric('gold')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                metric === 'gold' 
                ? 'bg-[#FFD700]/10 text-[#FFD700] border-b-2 border-[#FFD700]' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
              <Trophy className="w-3 h-3" /> Gold
          </button>
          <button 
            onClick={() => setMetric('joules')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                metric === 'joules' 
                ? 'bg-[#39FF14]/10 text-[#39FF14] border-b-2 border-[#39FF14]' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
              <Zap className="w-3 h-3" /> Joules
          </button>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 p-0">
        {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className={`w-6 h-6 animate-spin ${metric === 'gold' ? 'text-yellow-500' : 'text-[#39FF14]'}`} />
            </div>
        ) : leaderboardData.length === 0 ? (
            <p className="text-center text-gray-500 font-mono text-xs py-8">NO SIGNAL DETECTED</p>
        ) : (
            <div className="space-y-0">
              {leaderboardData.map((entry) => {
                const isMe = entry.name === playerData?.username;
                
                return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-3 border-b border-gray-800/50 hover:bg-white/5 transition-colors ${
                          isMe ? (metric === 'gold' ? 'bg-yellow-900/10' : 'bg-green-900/10') : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 flex items-center justify-center font-bold text-[10px] rounded-sm shadow-sm
                            ${entry.rank === 1 ? 'bg-yellow-500 text-black shadow-yellow-500/50' : 
                              entry.rank === 2 ? 'bg-gray-300 text-black' : 
                              entry.rank === 3 ? 'bg-orange-600 text-white' : 'bg-gray-900 text-gray-500 border border-gray-800'}
                        `}>
                            {entry.rank <= 3 && <Crown className="w-3 h-3 absolute -mt-6" fill={entry.rank === 1 ? "gold" : "silver"} />}
                            {entry.rank}
                        </div>

                        {/* Avatar & Info */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-black border border-gray-700 overflow-hidden">
                                {entry.avatar ? (
                                    <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-gray-500 m-1.5" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold leading-none mb-1 ${isMe ? 'text-white' : 'text-gray-300'}`}>
                                    {entry.name}
                                </span>
                                <span className="text-[9px] text-gray-600 uppercase">
                                    LVL {entry.level} // {entry.tier}
                                </span>
                            </div>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-right">
                        <span className={`text-sm font-black ${metric === 'gold' ? 'text-yellow-500' : 'text-[#39FF14]'}`}>
                            {entry.value.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                );
              })}
            </div>
        )}
      </div>

      <div className="p-3 bg-black border-t border-gray-800 text-center">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest animate-pulse">
              LIVE DATA STREAM ACTIVE
          </p>
      </div>
    </div>
  );
};

export default CommunityRankings;