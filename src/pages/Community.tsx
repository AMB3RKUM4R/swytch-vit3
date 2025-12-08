import { FC } from 'react';
import CommunityChat from '@/components/community/CommunityChat';
import CommunityRankings from '@/components/community/CommunityRankings';
import { Globe, Users } from 'lucide-react';

const Community: FC = () => {
  return (
    <div className="min-h-screen p-4 flex flex-col gap-6 max-w-4xl mx-auto pb-24">
        
        {/* Header */}
        <div className="text-center mb-4 border-b border-white/10 pb-6">
            <Globe className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
            <h1 className="text-3xl font-russo text-white uppercase">Global Network</h1>
            <p className="text-xs text-primary font-mono">// LIVE DATA STREAM</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chat Column */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                    <Users className="w-4 h-4" /> LIVE FEED
                </div>
                <div className="h-[500px] border border-white/10 bg-black/50 backdrop-blur-sm">
                    <CommunityChat />
                </div>
            </div>

            {/* Leaderboard Column */}
            <div className="space-y-2">
                 <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                    <Users className="w-4 h-4" /> TOP OPERATORS
                </div>
                <CommunityRankings />
            </div>
        </div>
    </div>
  );
};

export default Community;