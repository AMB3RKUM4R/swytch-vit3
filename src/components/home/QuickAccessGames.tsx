// src/components/home/QuickAccessGames.tsx
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
            className="space-y-6"
        >
            <h3 className="text-3xl font-russo text-foreground mb-4 text-glow-primary">
                Active Gates (Simulations)
            </h3>
            
            {/* Game Discovery Grid (passes the launch handler) */}
            <GameGrid onGameLaunch={onGameLaunch} />

            {/* Featured Section */}
            <h3 className="text-2xl font-poppins font-semibold text-muted-foreground mt-12">
                New Releases & Calibration Modes
            </h3>
            <div className="flex flex-wrap gap-4">
                <div className="w-40 h-24 bg-card rounded-md border border-primary/20 flex items-center justify-center text-sm text-muted-foreground">
                    Mana Miner V2
                </div>
                <div className="w-40 h-24 bg-card rounded-md border border-primary/20 flex items-center justify-center text-sm text-muted-foreground">
                    Season 2 Preview
                </div>
            </div>
        </motion.div>
    );
};

export default QuickAccessGames;