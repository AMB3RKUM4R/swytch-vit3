import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ShieldAlert, Users, Database, Activity, Search, Ban, Send, Terminal } from 'lucide-react'; 
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
  isBanned?: boolean;
}

const AdminPage: FC = () => {
  const { authLoading, isAdmin, userId } = usePlayer();
  const { setShowMessage } = useModal();

  const [activeTab, setActiveTab] = useState<'management' | 'stats' | 'content'>('management'); 
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalGold: 0, totalJoules: 0 });
  
  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // FETCH DATA
  const fetchData = async () => {
    setLoadingUsers(true);
    try {
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
                isPETMember: data.isPETMember || false,
                isBanned: data.isBanned || false
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

  useEffect(() => {
    if (isAdmin()) fetchData();
  }, [isAdmin]);

  // ACTIONS
  const handleBan = async (targetId: string, currentStatus: boolean) => {
      if(!window.confirm(`Confirm ${currentStatus ? 'UNBAN' : 'BAN'} for user ${targetId}?`)) return;
      
      try {
          await updateDoc(doc(db, 'Players', targetId), { isBanned: !currentStatus });
          setShowMessage(currentStatus ? "✅ USER UNBANNED" : "⛔ USER BANNED");
          fetchData(); // Refresh list
      } catch (e) {
          console.error(e);
          setShowMessage("❌ ACTION FAILED");
      }
  };

  const handleBroadcast = async () => {
      if(!broadcastMsg.trim()) return;
      try {
          await addDoc(collection(db, 'CommunityChat'), {
              userId: 'ADMIN',
              username: 'SYSTEM', // Special name triggers red text
              text: broadcastMsg,
              timestamp: serverTimestamp(),
              profilePictureUrl: null
          });
          setBroadcastMsg('');
          setShowMessage("📢 BROADCAST SENT");
      } catch(e) {
          console.error(e);
          setShowMessage("❌ FAILED TO SEND");
      }
  };

  if (authLoading) return null;

  // SECURITY CHECK
  if (!isAdmin()) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-mono bg-[url('/grid-pattern.png')]">
            <div className="border border-red-600 bg-red-900/10 p-12 text-center max-w-lg w-full backdrop-blur-md">
                <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-4xl font-black text-red-600 mb-2 uppercase tracking-tighter">Access Denied</h1>
                <p className="text-red-400 font-mono text-xs tracking-widest mb-8">// CLEARANCE LEVEL: 0</p>
                <Link to="/" className="btn-destructive w-full">
                    RETURN TO HUB
                </Link>
            </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen p-6 pb-24 pt-24 max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 text-[#39FF14] animate-spin-slow" />
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic text-glow-primary">System Command</h1>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-mono">// ROOT_ACCESS_GRANTED: {userId?.slice(0,8)}</p>
            </div>
            
            <div className="flex gap-2 bg-black/50 p-1 border border-white/10 rounded-sm backdrop-blur-sm">
                {(['management', 'stats', 'content'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            activeTab === tab 
                            ? 'border-[#39FF14] bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' 
                            : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <AnimatePresence mode="wait">
            
            {/* 1. MANAGEMENT TAB (USER LIST) */}
            {activeTab === 'management' && (
                <motion.div 
                    key="management" 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-6"
                >
                        <div className="flex justify-between items-center bg-black/60 p-4 border border-white/10">
                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="text" placeholder="SEARCH DATABASE..." className="input pl-10 bg-black" />
                            </div>
                            <div className="text-xs text-gray-500 font-mono">LIVE_RECORDS: {users.length}</div>
                        </div>

                        <div className="border border-white/10 bg-black/40 overflow-hidden">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-white/5 text-gray-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Operator</th>
                                        <th className="p-4">Rank</th>
                                        <th className="p-4">Holdings</th>
                                        <th className="p-4 text-right">Override</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.id} className={`hover:bg-white/5 transition-colors ${u.isBanned ? 'bg-red-900/10' : ''}`}>
                                            <td className="p-4">
                                                <div className={`font-bold ${u.isBanned ? 'text-red-500 line-through' : 'text-white'}`}>
                                                    {u.username}
                                                </div>
                                                <div className="text-gray-600 text-[10px]">{u.id}</div>
                                            </td>
                                            <td className="p-4">
                                                {u.isPETMember ? (
                                                    <span className="bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 text-[10px] border border-[#39FF14]/30">ELITE</span>
                                                ) : (
                                                    <span className="text-gray-600 text-[10px]">ROOKIE</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-yellow-500">{u.gold.toLocaleString()} G</div>
                                                <div className="text-[#39FF14]">{u.joules.toLocaleString()} J</div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleBan(u.id, u.isBanned || false)}
                                                    className={`p-2 border transition-colors ${
                                                        u.isBanned 
                                                        ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
                                                        : 'border-red-900 text-red-700 hover:bg-red-600 hover:text-white'
                                                    }`}
                                                >
                                                    <Ban className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {loadingUsers && <div className="p-8 text-center text-[#39FF14] animate-pulse font-mono">DOWNLOADING DATA STREAM...</div>}
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
                    <div className="p-8 bg-black/60 border border-white/10 hover:border-[#39FF14] transition-all group cyber-clip">
                        <Users className="w-10 h-10 text-gray-600 mb-4 group-hover:text-[#39FF14] transition-colors" />
                        <h3 className="text-5xl font-black text-white tracking-tighter">{stats.totalUsers}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Active Nodes</p>
                    </div>
                    <div className="p-8 bg-black/60 border border-white/10 hover:border-yellow-500 transition-all group cyber-clip">
                        <Database className="w-10 h-10 text-gray-600 mb-4 group-hover:text-yellow-500 transition-colors" />
                        <h3 className="text-5xl font-black text-white tracking-tighter">{stats.totalGold.toLocaleString()}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Total Economy (G)</p>
                    </div>
                    <div className="p-8 bg-black/60 border border-white/10 hover:border-[#39FF14] transition-all group cyber-clip">
                        <Activity className="w-10 h-10 text-gray-600 mb-4 group-hover:text-[#39FF14] transition-colors" />
                        <h3 className="text-5xl font-black text-white tracking-tighter">{(stats.totalJoules/1000).toFixed(1)}k</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Energy Output (J)</p>
                    </div>
                </motion.div>
            )}

            {/* 3. CONTENT TAB (NEW: SYSTEM BROADCAST) */}
            {activeTab === 'content' && (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="bg-black/60 border border-red-900/50 p-8 cyber-clip relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 bg-red-900/20 border-l border-b border-red-900/50 text-[10px] text-red-500 font-bold uppercase tracking-widest">
                            Emergency_Override
                         </div>
                         
                         <div className="flex items-center gap-3 mb-6">
                             <Terminal className="w-6 h-6 text-red-500" />
                             <h3 className="text-2xl font-black text-white uppercase italic">System Broadcast</h3>
                         </div>
                         
                         <p className="text-gray-500 text-xs font-mono mb-4">
                             SEND A GLOBAL MESSAGE TO ALL CONNECTED CLIENTS VIA COMMUNITY CHAT.
                             <br />
                             <span className="text-red-500">WARNING: THIS ACTION CANNOT BE UNDONE.</span>
                         </p>

                         <div className="space-y-4">
                             <textarea 
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="ENTER SYSTEM MESSAGE..." 
                                className="w-full h-32 bg-black border border-red-900/30 p-4 text-red-100 font-mono text-sm focus:border-red-500 outline-none resize-none uppercase"
                             />
                             <button 
                                onClick={handleBroadcast}
                                disabled={!broadcastMsg}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <Send className="w-4 h-4" /> TRANSMIT TO NETWORK
                             </button>
                         </div>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>
      </div>
  );
};

export default AdminPage;