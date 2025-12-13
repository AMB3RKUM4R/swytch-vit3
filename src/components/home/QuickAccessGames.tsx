import { FC } from 'react';
import { motion } from 'framer-motion';
import GameGrid from '../GameGrid';

interface QuickAccessGamesProps {
    onGameLaunch: (gameId: string) => void;
}

const QuickAccessGames: FC<QuickAccessGamesProps> = ({ onGameLaunch }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 font-mono"
        >
            <div className="border-l-2 border-[#39FF14] pl-4">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-1">
                    Simulation Feed
                </h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">// SELECT GATE TO ENTER</p>
            </div>
            
            <GameGrid onGameLaunch={onGameLaunch} />

            <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-widest">
                    Upcoming Modules
                </h3>
                <div className="flex flex-wrap gap-4">
                    <div className="px-6 py-3 bg-black border border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:border-[#39FF14] hover:text-[#39FF14] transition-colors cursor-pointer">
                        Mana Miner V2
                    </div>
                    <div className="px-6 py-3 bg-black border border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:border-[#39FF14] hover:text-[#39FF14] transition-colors cursor-pointer">
                        Season 2 [PREVIEW]
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default QuickAccessGames;