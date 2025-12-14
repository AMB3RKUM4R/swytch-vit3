import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ShieldAlert, Users, Database, Activity, Search, Ban } from 'lucide-react'; 
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

interface UserSummary {
  id: string;
  username: string;
  email: string;
  gold: number;
  joules: number;
  isPETMember: boolean;
}

const AdminPage: FC = () => {
  const { authLoading, isAdmin, userId } = usePlayer();
  const { setShowMessage } = useModal();

  const [activeTab, setActiveTab] = useState<'management' | 'stats' | 'content'>('management'); 
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalGold: 0, totalJoules: 0 });

  // FETCH DATA
  useEffect(() => {
    if (!isAdmin()) return;

    const fetchData = async () => {
        setLoadingUsers(true);
        try {
            // Fetch last 50 users
            const q = query(collection(db, 'Players'), orderBy('lastLogin', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            
            const fetchedUsers: UserSummary[] = [];
            let g = 0; 
            let j = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                g += data.gold || 0;
                j += data.joules || 0;
                fetchedUsers.push({
                    id: doc.id,
                    username: data.username || 'Unknown',
                    email: data.email || 'No Email',
                    gold: data.gold || 0,
                    joules: data.joules || 0,
                    isPETMember: data.isPETMember || false
                });
            });

            setUsers(fetchedUsers);
            setStats({ totalUsers: snapshot.size, totalGold: g, totalJoules: j });
        } catch (error) {
            console.error("Admin Fetch Error", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    fetchData();
  }, [isAdmin]);

  if (authLoading) return null;

  // SECURITY CHECK
  if (!isAdmin()) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
            <div className="border border-red-600 bg-red-900/10 p-12 text-center max-w-lg w-full">
                <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-4xl font-black text-red-600 mb-2 uppercase">Access Denied</h1>
                <p className="text-red-400 font-mono text-xs tracking-widest mb-8">// CLEARANCE LEVEL: 0</p>
                <Link to="/" className="inline-block border border-red-600 text-red-600 hover:bg-red-600 hover:text-black px-8 py-3 text-xs font-bold uppercase transition-colors">
                    RETURN TO HUB
                </Link>
            </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-black text-white font-mono p-6 pb-24 selection:bg-[#39FF14] selection:text-black pt-24">
        
        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-12 border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 text-[#39FF14] animate-spin-slow" />
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">System Command</h1>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">// ROOT_ACCESS_GRANTED: {userId?.slice(0,8)}</p>
            </div>
            
            <div className="flex gap-2">
                {(['management', 'stats', 'content'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                            activeTab === tab 
                            ? 'border-[#39FF14] bg-[#39FF14] text-black' 
                            : 'border-gray-800 text-gray-600 hover:border-gray-500 hover:text-white bg-black'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
                
                {/* 1. MANAGEMENT TAB (USER LIST) */}
                {activeTab === 'management' && (
                    <motion.div 
                        key="management" 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                         <div className="flex justify-between items-center bg-[#050505] p-4 border border-gray-800">
                             <div className="relative max-w-sm w-full">
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                 <input type="text" placeholder="SEARCH USER DATABASE..." className="w-full bg-black border border-gray-700 py-2 pl-10 text-xs text-white focus:border-[#39FF14] outline-none" />
                             </div>
                             <div className="text-xs text-gray-500">SHOWING RECENT 50</div>
                         </div>

                         <div className="border border-gray-800 bg-[#050505] overflow-hidden">
                             <table className="w-full text-left text-xs">
                                 <thead className="bg-gray-900 text-gray-400 font-bold uppercase tracking-wider">
                                     <tr>
                                         <th className="p-4">User</th>
                                         <th className="p-4">Status</th>
                                         <th className="p-4">Assets</th>
                                         <th className="p-4 text-right">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-800">
                                     {users.map(u => (
                                         <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                             <td className="p-4">
                                                 <div className="font-bold text-white">{u.username}</div>
                                                 <div className="text-gray-600">{u.id}</div>
                                             </td>
                                             <td className="p-4">
                                                 {u.isPETMember ? (
                                                     <span className="bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded border border-[#39FF14]/30">ELITE</span>
                                                 ) : (
                                                     <span className="text-gray-500">STD</span>
                                                 )}
                                             </td>
                                             <td className="p-4 font-mono">
                                                 <div className="text-yellow-500">{u.gold.toLocaleString()} G</div>
                                                 <div className="text-[#39FF14]">{u.joules.toLocaleString()} J</div>
                                             </td>
                                             <td className="p-4 text-right">
                                                 <button onClick={() => setShowMessage("⚠️ BAN FUNCTION DISABLED")} className="text-red-500 hover:text-white border border-red-900 hover:bg-red-600 p-2 rounded transition-colors">
                                                     <Ban className="w-4 h-4" />
                                                 </button>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                             {loadingUsers && <div className="p-8 text-center text-[#39FF14] animate-pulse">DOWNLOADING USER DATA...</div>}
                         </div>
                    </motion.div>
                )}
                
                {/* 2. STATS TAB */}
                {activeTab === 'stats' && (
                    <motion.div 
                        key="stats" 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                       <div className="p-6 bg-[#050505] border border-gray-800 hover:border-[#39FF14] transition-colors group">
                           <Users className="w-8 h-8 text-white mb-4 group-hover:text-[#39FF14]" />
                           <h3 className="text-4xl font-black text-white">{stats.totalUsers}</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Total Operators</p>
                       </div>
                       <div className="p-6 bg-[#050505] border border-gray-800 hover:border-yellow-500 transition-colors group">
                           <Database className="w-8 h-8 text-yellow-500 mb-4" />
                           <h3 className="text-4xl font-black text-yellow-500">{stats.totalGold.toLocaleString()}</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Circulating Gold</p>
                       </div>
                       <div className="p-6 bg-[#050505] border border-gray-800 hover:border-[#39FF14] transition-colors group">
                           <Activity className="w-8 h-8 text-[#39FF14] mb-4" />
                           <h3 className="text-4xl font-black text-[#39FF14]">{(stats.totalJoules/1000).toFixed(1)}k</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Joules Mined</p>
                       </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
  );
};

export default AdminPage;