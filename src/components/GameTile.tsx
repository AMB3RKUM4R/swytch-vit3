// src/components/GameTile.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Lock, Play } from 'lucide-react';
// FIX 1: Corrected import path for SwytchCard
import SwytchCard from './SwytchCard'; 

// Define Game Data Structure (must be identical to the array structure in GameGrid.tsx)
interface Game {
    id: string; 
    name: string; 
    level: number;
    locked: boolean;
    style: string; // Tailwind gradient classes
    gameType: string;
    // FIX 2: Added missing 'status' field definition (TS2339)
    status?: string; 
}

interface GameTileProps {
    game: Game;
    onGameLaunch: (gameId: string) => void;
}

const GameTile: FC<GameTileProps> = ({ game, onGameLaunch }) => {
    
    // Determine lock status based on level/status field
    const isLocked = game.locked || game.status === 'Soon'; 
    const isSeason2 = game.level >= 75 || game.status === 'Soon'; // Use game.status as well
    // FIX 3: Check game.status safely before using it
    const lockText = isSeason2 ? 'SEASON 2: MULTIPLAYER RIFT' : `LOCKED (Level ${game.level}+)`; 

    return (
        <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 212, 255, 0.5)' }}
            whileTap={{ scale: 0.98 }}
        >
            <SwytchCard variant="holographic" className="p-4 text-center relative overflow-hidden h-full flex flex-col justify-between">
                
                {isLocked && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 p-4">
                        <Lock className={`w-10 h-10 mb-2 ${isSeason2 ? 'text-purple-400' : 'text-red-500'}`} />
                        <p className="text-sm font-poppins text-red-400 font-bold">{isSeason2 ? 'CALIBRATION MODE' : lockText}</p>
                        {isSeason2 && <p className="text-xs text-purple-300 mt-1">RIFT IS UNSTABLE</p>}
                    </div>
                )}
                
                {/* Game Cover Area */}
                <div className={`bg-gradient-to-br ${game.style} rounded-lg w-full aspect-square mb-3 flex items-center justify-center`}>
                    <Gamepad2 className="w-12 h-12 text-white/70" />
                </div>
                
                <h3 className="text-xl font-russo text-foreground mb-1">{game.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{game.gameType}</p>
                
                {!isLocked && (
                     <button 
                        className="btn-primary w-full text-sm"
                        onClick={() => onGameLaunch(game.id)}
                     >
                        <Play className="w-4 h-4 mr-2" /> Launch Gate
                     </button>
                )}
            </SwytchCard>
        </motion.div>
    );
};

export default GameTile;