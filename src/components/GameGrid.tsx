// src/components/GameGrid.tsx
import { FC } from 'react';
import GameTile from './GameTile'; 
// NOTE: We do not need the usePlayer hook here if lock status is static
// import { usePlayer } from '@/components/context/PlayerContext'; 

// Define the full game roster with dedicated image URL fields
const games = [
  // Season 1 Pilot (Open Games)
  { id: "mana_miner", name: "Mana Miner", level: 1, locked: false, style: "from-cyan-500 to-blue-600", gameType: "Resource Extraction", imageUrl: "/game_covers/mana_miner_cover.webp" },
  { id: "gatekeeper", name: "Gatekeeper", level: 5, locked: false, style: "from-purple-500 to-pink-600", gameType: "Perimeter Defense", imageUrl: "/game_covers/gatekeeper_cover.webp" },
  { id: "shadow_fix", name: "Shadow Fix", level: 10, locked: false, style: "from-green-500 to-teal-600", gameType: "Soul Extraction", imageUrl: "/game_covers/shadow_fix_cover.webp" },
  { id: "crypt_crawler", name: "Crypt Crawler", level: 15, locked: false, style: "from-stone-500 to-gray-700", gameType: "Dungeon Crawl", imageUrl: "/game_covers/crypt_crawler_cover.webp" },
  { id: "tech_assault", name: "Tech Assault", level: 20, locked: false, style: "from-red-500 to-pink-500", gameType: "Arena Combat", imageUrl: "/game_covers/tech_assault_cover.webp" },
  { id: "rift_defense", name: "Rift Defense", level: 25, locked: false, style: "from-orange-500 to-yellow-600", gameType: "Tower Defense", imageUrl: "/game_covers/rift_defense_cover.webp" },
  { id: "glitch_hacker", name: "Glitch Hacker", level: 30, locked: false, style: "from-indigo-500 to-blue-700", gameType: "Puzzle/Arcade", imageUrl: "/game_covers/glitch_hacker_cover.webp" },
  
  // Coming Soon (Locked)
  { id: "void_hunter", name: "Void Hunter", level: 35, locked: true, style: "from-black to-gray-800", gameType: "Survival", status: "Soon", imageUrl: "/game_covers/void_hunter_cover.webp" }, 
  { id: "chrono_dash", name: "Chrono Dash", level: 40, locked: true, style: "from-yellow-200 to-amber-500", gameType: "Neon Racer", status: "Soon", imageUrl: "/game_covers/chrono_dash_cover.webp" },
  { id: "star_sentry", name: "Star Sentry", level: 45, locked: true, style: "from-sky-500 to-cyan-500", gameType: "Space Shooter", status: "Soon", imageUrl: "/game_covers/star_sentry_cover.webp" },
  { id: "fractal_maze", name: "Fractal Maze", level: 50, locked: true, style: "from-rose-500 to-purple-600", gameType: "Exploration", status: "Soon", imageUrl: "/game_covers/fractal_maze_cover.webp" },
  { id: "omega_strike", name: "Omega Strike", level: 60, locked: true, style: "from-red-800 to-red-900", gameType: "Boss Rush", status: "Soon", imageUrl: "/game_covers/omega_strike_cover.webp" },
  
  // Season 2 / High Level (Locked)
  { id: "pet_arena", name: "PET Arena", level: 75, locked: true, style: "from-lime-500 to-green-600", gameType: "Multiplayer PvP", status: "Soon", imageUrl: "/game_covers/pet_arena_cover.webp" },
  { id: "governance_sim", name: "Governance Sim", level: 90, locked: true, style: "from-blue-800 to-indigo-900", gameType: "Strategy", status: "Soon", imageUrl: "/game_covers/governance_sim_cover.webp" },
  { id: "new_eden_mine", name: "New Eden Mine", level: 100, locked: true, style: "from-teal-300 to-cyan-600", gameType: "Resource T2", status: "Soon", imageUrl: "/game_covers/new_eden_mine_cover.webp" },
];

interface GameGridProps {
    onGameLaunch: (gameId: string) => void;
}

const GameGrid: FC<GameGridProps> = ({ onGameLaunch }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameTile 
            key={game.id} 
            game={game as any}
            onGameLaunch={onGameLaunch} 
        />
      ))}
    </div>
  );
};

export default GameGrid;