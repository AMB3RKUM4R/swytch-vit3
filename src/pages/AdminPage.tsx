import { FC, useState } from 'react'; // Removed useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ShieldAlert, Users, Database, Activity } from 'lucide-react'; 
// Removed unused icons: UserPlus, CheckCircle, Loader2, Feather, DollarSign, ListChecks
import { usePlayer } from '../components/context/PlayerContext';
import { useModal } from '../components/context/ModalContext';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent'; 

// Removed unused hooks: useAccount, useReadContract...

const AdminPage: FC = () => {
  const { authLoading, userId, isAdmin } = usePlayer(); // Removed dataLoading, idToken
  const { setShowMessage, setActiveModal } = useModal();

  const [activeTab, setActiveTab] = useState<'management' | 'stats' | 'content'>('management'); 

  if (authLoading) return null;

  // REAL ADMIN CHECK
  if (!isAdmin()) {
    return (
      <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="border border-red-600 bg-red-900/10 p-12 text-center max-w-lg w-full">
                <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-4xl font-black text-red-600 mb-2 uppercase">Access Denied</h1>
                <p className="text-red-400 font-mono text-xs tracking-widest mb-8">// CLEARANCE LEVEL: 0</p>
                <Link to="/home" className="inline-block border border-red-600 text-red-600 hover:bg-red-600 hover:text-black px-8 py-3 text-xs font-bold uppercase transition-colors">
                    RETURN TO HUB
                </Link>
            </div>
        </div>
      </SwytchErrorBoundary>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <div className="min-h-screen bg-black text-white font-mono p-6 pb-24 selection:bg-[#39FF14] selection:text-black">
        
        {/* HEADER */}
        <div className="max-w-6xl mx-auto mb-12 border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 text-[#39FF14]" />
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">System Command</h1>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">// ROOT_ACCESS_GRANTED: {userId?.slice(0,8)}</p>
            </div>
            
            <div className="flex gap-2">
                {(['management', 'content', 'stats'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                            activeTab === tab 
                            ? 'border-[#39FF14] bg-[#39FF14] text-black' 
                            : 'border-gray-800 text-gray-600 hover:border-gray-500 hover:text-white bg-black'
                        }`}
                    >
                        {tab === 'management' && 'USERS & FINANCE'}
                        {tab === 'content' && 'CONTENT OPS'}
                        {tab === 'stats' && 'SYSTEM LOGS'}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                
                {/* 1. MANAGEMENT TAB */}
                {activeTab === 'management' && (
                    <motion.div 
                        key="management" 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                         <div className="p-6 border border-gray-800 text-gray-500 text-sm text-center">
                             // PAYOUT MODULES WOULD RENDER HERE
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
                       <div className="p-6 bg-[#050505] border border-gray-800 hover:border-[#39FF14] transition-colors">
                           <Users className="w-8 h-8 text-white mb-4" />
                           <h3 className="text-3xl font-black text-white">1,204</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Users</p>
                       </div>
                       <div className="p-6 bg-[#050505] border border-gray-800 hover:border-[#39FF14] transition-colors">
                           <Database className="w-8 h-8 text-[#39FF14] mb-4" />
                           <h3 className="text-3xl font-black text-[#39FF14]">14.2k</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">DB Reads (24h)</p>
                       </div>
                       <div className="p-6 bg-[#050505] border border-gray-800 hover:border-[#39FF14] transition-colors">
                           <Activity className="w-8 h-8 text-white mb-4" />
                           <h3 className="text-3xl font-black text-white">100%</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">System Health</p>
                       </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </SwytchErrorBoundary>
  );
};

export default AdminPage;