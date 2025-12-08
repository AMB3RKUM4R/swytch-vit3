import { FC, useMemo } from 'react';
import { useWebGL } from '@/components/context/WebglContext'; 
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import GameTile, { FeedItem } from '@/components/GameTile';

// ────────────────────────────────────────────────────────────────
// MASTER CONTENT DATABASE
// ────────────────────────────────────────────────────────────────

// 1. GAMES (15)
const gamesList = [
  { id: "mana_miner", name: "Mana Miner", level: 1, type: "Extraction", imageUrl: "/game_covers/mana_miner.webp" },
  { id: "gatekeeper", name: "Gatekeeper", level: 5, type: "Defense", imageUrl: "/game_covers/gatekeeper.webp" },
  { id: "shadow_fix", name: "Shadow Fix", level: 10, type: "Puzzle", imageUrl: "/game_covers/shadow_fix.webp" },
  { id: "crypt_crawler", name: "Crypt Crawler", level: 15, type: "RPG", imageUrl: "/game_covers/crypt_crawler.webp" },
  { id: "tech_assault", name: "Tech Assault", level: 20, type: "Shooter", imageUrl: "/game_covers/tech_assault.webp" },
  { id: "rift_defense", name: "Rift Defense", level: 25, type: "Tower Defense", imageUrl: "/game_covers/rift_defense.webp" },
  { id: "glitch_hacker", name: "Glitch Hacker", level: 30, type: "Arcade", imageUrl: "/game_covers/glitch_hacker.webp" },
  { id: "void_hunter", name: "Void Hunter", level: 35, type: "Survival", imageUrl: "/game_covers/void_hunter.webp" },
  { id: "chrono_dash", name: "Chrono Dash", level: 40, type: "Racing", imageUrl: "/game_covers/chrono_dash.webp" },
  { id: "star_sentry", name: "Star Sentry", level: 45, type: "Space Sim", imageUrl: "/game_covers/star_sentry.webp" },
  { id: "fractal_maze", name: "Fractal Maze", level: 50, type: "Exploration", imageUrl: "/game_covers/fractal_maze.webp" },
  { id: "omega_strike", name: "Omega Strike", level: 60, type: "Boss Rush", imageUrl: "/game_covers/omega_strike.webp" },
  { id: "pet_arena", name: "PET Arena", level: 75, type: "PVP", imageUrl: "/game_covers/pet_arena.webp" },
  { id: "governance_sim", name: "Governance Sim", level: 90, type: "Strategy", imageUrl: "/game_covers/governance_sim.webp" },
  { id: "new_eden_mine", name: "New Eden Mine", level: 100, type: "Tycoon", imageUrl: "/game_covers/new_eden_mine.webp" },
];

// 2. ITEMS (10)
const itemList = [
  { id: "d-rank-pickaxe", name: "D-Rank Pickaxe", rarity: "D-Rank", type: "WEAPON", price: 500, imageUrl: "/items/weapons/pickaxe_d.png" },
  { id: "s-rank-shield", name: "S-Rank Kinetic Shield", rarity: "S-Rank", type: "ARMOR", price: 10000, imageUrl: "/items/armor/shield_s.png" },
  { id: "core-booster", name: "Core Energy Booster", rarity: "B-Rank", type: "CONSUMABLE", price: 800, imageUrl: "/items/consumables/energy_booster.png" },
  { id: "void-badge", name: "Badge of the Void", rarity: "A-Rank", type: "ARTIFACT", price: 5000, imageUrl: "/items/artifacts/void_badge.png" },
  { id: "plasma-rifle", name: "Plasma Rifle", rarity: "B-Rank", type: "WEAPON", price: 2500, imageUrl: "/items/weapons/plasma_rifle.png" },
  { id: "stealth-cloak", name: "Stealth Cloak", rarity: "A-Rank", type: "ARMOR", price: 4000, imageUrl: "/items/armor/stealth_cloak.png" },
  { id: "health-injector", name: "Health Injector", rarity: "D-Rank", type: "CONSUMABLE", price: 100, imageUrl: "/items/consumables/health_injector.png" },
  { id: "data-key", name: "Encrypted Data Key", rarity: "S-Rank", type: "ARTIFACT", price: 15000, imageUrl: "/items/artifacts/data_key.png" },
  { id: "gravity-hammer", name: "Gravity Hammer", rarity: "C-Rank", type: "WEAPON", price: 1200, imageUrl: "/items/weapons/gravity_hammer.png" },
  { id: "nano-suit", name: "Nano-Weave Suit", rarity: "B-Rank", type: "ARMOR", price: 3000, imageUrl: "/items/armor/nano_suit.png" },
];

// 3. AVATARS (5)
const avatarList = [
    { id: "cyber_samurai", name: "Cyber Samurai", rarity: "Legendary", price: 20000, imageUrl: "/avatars/cyber_samurai.webp" },
    { id: "neon_assassin", name: "Neon Assassin", rarity: "Epic", price: 12000, imageUrl: "/avatars/neon_assassin.webp" },
    { id: "quantum_knight", name: "Quantum Knight", rarity: "Rare", price: 8000, imageUrl: "/avatars/quantum_knight.webp" },
    { id: "void_walker", name: "Void Walker", rarity: "Epic", price: 11000, imageUrl: "/avatars/void_walker.webp" },
    { id: "solar_vanguard", name: "Solar Vanguard", rarity: "Legendary", price: 25000, imageUrl: "/avatars/solar_vanguard.webp" },
];

// 4. ARENAS (3)
const arenaList = [
    { id: "arena_void_pit", name: "The Void Pit", type: "Deathmatch", level: 10, imageUrl: "/arenas/void_pit.webp" },
    { id: "arena_neon_city", name: "Neon City Outskirts", type: "Team Control", level: 20, imageUrl: "/arenas/neon_city.webp" },
    { id: "arena_cyber_col", name: "Cyber Colosseum", type: "1v1 Duel", level: 50, imageUrl: "/arenas/cyber_colosseum.webp" },
];

const LandingPage: FC = () => {
  const { setActiveGameId } = useWebGL();
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // MERGE & SHUFFLE CONTENT ALGORITHM
  const feedData: FeedItem[] = useMemo(() => {
      const feed: FeedItem[] = [];

      // Helper generators
      const getGame = (g: any) => ({ type: 'game' as const, id: g.id, title: g.name, subtitle: `LVL ${g.level} // ${g.type.toUpperCase()}`, imageUrl: g.imageUrl, data: g });
      const getItem = (i: any) => ({ type: 'item' as const, id: i.id, title: i.name, subtitle: `${i.rarity} // ${i.type}`, imageUrl: i.imageUrl, price: i.price, data: i });
      const getAvatar = (a: any) => ({ type: 'avatar' as const, id: a.id, title: a.name, subtitle: `${a.rarity.toUpperCase()} // SKIN`, imageUrl: a.imageUrl, price: a.price, data: a });
      const getArena = (a: any) => ({ type: 'arena' as const, id: a.id, title: a.name, subtitle: `LVL ${a.level} // ${a.type.toUpperCase()}`, imageUrl: a.imageUrl, data: a });

      // We want a mix. Let's loop through the max length and inject variety.
      // Pattern: Game -> Item -> Game -> Avatar/Arena -> Repeat
      
      const maxLen = Math.max(gamesList.length, itemList.length);
      
      for(let i=0; i<maxLen; i++) {
          // 1. Add Game
          if(gamesList[i]) feed.push(getGame(gamesList[i]));
          
          // 2. Add Item
          if(itemList[i]) feed.push(getItem(itemList[i]));

          // 3. Inject Special (Avatar or Arena) every 2nd or 3rd cycle
          if(i < avatarList.length) feed.push(getAvatar(avatarList[i]));
          if(i < arenaList.length) feed.push(getArena(arenaList[i]));
      }

      return feed;
  }, []);

  const handleLaunch = (id: string) => {
      if (!userId) {
          setShowMessage("⚠️ CONNECT WALLET TO ENTER");
          setActiveModal('auth');
      } else {
          setActiveGameId(id);
      }
  };

  return (
    <div className="w-full h-full bg-black">
        {/* INFINITE SCROLL CONTAINER (Snap Enabled) */}
        <div className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
            {feedData.map((item, index) => (
                <div key={`${item.type}-${item.id}-${index}`} className="snap-start w-full h-full flex items-center justify-center bg-black">
                    <GameTile 
                        game={item} 
                        onGameLaunch={handleLaunch} 
                    />
                </div>
            ))}
            
            {/* Footer Spacer */}
            <div className="snap-start w-full h-[20vh] flex items-center justify-center text-white/20 text-xs font-mono">
                // END OF TRANSMISSION //
            </div>
        </div>
    </div>
  );
};

export default LandingPage;