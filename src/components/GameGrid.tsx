import { FC } from 'react';
import GameTile from './GameTile'; 
import CurrencyHUD from '@/components/CurrencyHUD'; 
import { GAMES_LIST } from '@/lib/gameData'; // Import Master List

interface GameGridProps {
    onGameLaunch: (gameId: string) => void;
}

const GameGrid: FC<GameGridProps> = ({ onGameLaunch }) => {
  return (
    <div className="flex flex-col gap-6 font-mono">
        
        {/* Header with HUD */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-4">
            <div>
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Active Sectors</h2>
                <p className="text-[#39FF14] text-xs tracking-widest uppercase mt-1">// DEPLOY TO EARN JOULES</p>
            </div>
            <CurrencyHUD />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GAMES_LIST.map((game) => (
            <GameTile 
                key={game.id} 
                game={{
                    type: 'game',
                    id: game.id,
                    title: game.name,
                    subtitle: `LVL ${game.level} // ${game.type.toUpperCase()}`,
                    imageUrl: game.imageUrl,
                    data: game
                }}
                onGameLaunch={onGameLaunch} 
            />
          ))}
        </div>
    </div>
  );
};

export default GameGrid;