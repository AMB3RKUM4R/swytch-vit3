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
            className="space-y-8"
        >
            <div className="border-l-4 border-primary pl-4">
                <h3 className="text-2xl font-russo text-white uppercase tracking-wider mb-1">
                    Active Simulations
                </h3>
                <p className="text-xs font-mono text-gray-500">// SELECT GATE TO ENTER</p>
            </div>
            
            <GameGrid onGameLaunch={onGameLaunch} />

            <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-lg font-bold font-russo text-gray-500 uppercase mb-4">
                    New Releases & Calibration Modes
                </h3>
                <div className="flex flex-wrap gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 text-xs text-gray-400 font-mono uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                        Mana Miner V2
                    </div>
                    <div className="px-6 py-3 bg-white/5 border border-white/10 text-xs text-gray-400 font-mono uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                        Season 2 Preview
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default QuickAccessGames;