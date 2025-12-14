import { FC } from 'react';
import CommunityChat from '@/components/community/CommunityChat';
import CommunityRankings from '@/components/community/CommunityRankings';
import { Globe, Users, Radio } from 'lucide-react';

const Community: FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-[1600px] mx-auto flex flex-col gap-6 bg-black">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                    <Globe className="w-8 h-8 text-[#39FF14] animate-pulse-slow" /> Global Uplink
                </h1>
                <p className="text-xs text-gray-500 font-mono mt-1">// SECURE FREQUENCY ESTABLISHED</p>
            </div>
            <div className="flex items-center gap-2 text-[#39FF14] text-xs font-bold bg-[#39FF14]/10 px-3 py-1 rounded-full border border-[#39FF14]/20">
                <Radio className="w-3 h-3 animate-ping" /> LIVE
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
            
            {/* Chat Column (Wider) */}
            <div className="lg:col-span-8 flex flex-col border border-gray-800 bg-[#050505] rounded-sm overflow-hidden">
                <div className="bg-gray-900/50 p-2 border-b border-gray-800 flex items-center gap-2">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Public_Frequency</span>
                </div>
                <div className="flex-grow overflow-hidden">
                    <CommunityChat />
                </div>
            </div>

            {/* Leaderboard Column (Narrower) */}
            <div className="lg:col-span-4 flex flex-col border border-gray-800 bg-[#050505] rounded-sm overflow-hidden">
                 <div className="bg-gray-900/50 p-2 border-b border-gray-800 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Elite_Operators</span>
                </div>
                <div className="flex-grow overflow-hidden">
                    <CommunityRankings />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Community;