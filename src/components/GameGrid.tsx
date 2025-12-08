import { FC } from 'react';
import GameTile from './GameTile'; 
import CurrencyHUD from '@/components/CurrencyHUD'; //

const games = [
  { id: "mana_miner", name: "Mana Miner", level: 1, locked: false, gameType: "Extraction", imageUrl: "/game_covers/mana_miner_cover.webp" },
  { id: "gatekeeper", name: "Gatekeeper", level: 5, locked: false, gameType: "Defense", imageUrl: "/game_covers/gatekeeper_cover.webp" },
  { id: "shadow_fix", name: "Shadow Fix", level: 10, locked: false, gameType: "Extraction", imageUrl: "/game_covers/shadow_fix_cover.webp" },
  { id: "crypt_crawler", name: "Crypt Crawler", level: 15, locked: false, gameType: "Dungeon", imageUrl: "/game_covers/crypt_crawler_cover.webp" },
];

interface GameGridProps {
    onGameLaunch: (gameId: string) => void;
}

const GameGrid: FC<GameGridProps> = ({ onGameLaunch }) => {
  return (
    <div className="flex flex-col gap-6">
        
        {/* --- MODIFIED: Added Header with HUD --- */}
        <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <div>
                <h2 className="text-2xl font-russo text-white uppercase">Active Sectors</h2>
                <p className="text-gray-500 text-sm">Deploy to earn Joules</p>
            </div>
            {/* The HUD sits here, visible above the grid */}
            <CurrencyHUD />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameTile 
                key={game.id} 
                game={{
                    type: 'game',
                    id: game.id,
                    title: game.name,
                    subtitle: `LVL ${game.level} // ${game.gameType.toUpperCase()}`,
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