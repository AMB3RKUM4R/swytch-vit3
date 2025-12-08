import { FC, useMemo } from 'react';
import { motion } from 'framer-motion'; 
import { ChevronDown, Sparkles } from 'lucide-react';
import { useWebGL } from '@/components/context/WebglContext'; 
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import GameTile, { FeedItem } from '@/components/GameTile';

// ────────────────────────────────────────────────────────────────
// CONTENT DATABASE
// ────────────────────────────────────────────────────────────────

// GAMES
const gamesList = [
  { id: "mana_miner", name: "Mana Miner", level: 1, type: "Extraction", videoUrl: "/videos/games/mana_miner.mp4" },
  { id: "gatekeeper", name: "Gatekeeper", level: 5, type: "Defense", videoUrl: "/videos/games/gatekeeper.mp4" },
  { id: "shadow_fix", name: "Shadow Fix", level: 10, type: "Puzzle", videoUrl: "/videos/games/shadow_fix.mp4" },
  { id: "crypt_crawler", name: "Crypt Crawler", level: 15, type: "RPG", videoUrl: "/videos/games/crypt_crawler.mp4" },
  { id: "tech_assault", name: "Tech Assault", level: 20, type: "Shooter", videoUrl: "/videos/games/tech_assault.mp4" },
  { id: "rift_defense", name: "Rift Defense", level: 25, type: "Tower Defense", videoUrl: "/videos/games/rift_defense.mp4" },
  { id: "glitch_hacker", name: "Glitch Hacker", level: 30, type: "Arcade", videoUrl: "/videos/games/glitch_hacker.mp4" },
  { id: "void_hunter", name: "Void Hunter", level: 35, type: "Survival", videoUrl: "/videos/games/void_hunter.mp4" },
  { id: "chrono_dash", name: "Chrono Dash", level: 40, type: "Racing", videoUrl: "/videos/games/chrono_dash.mp4" },
  { id: "star_sentry", name: "Star Sentry", level: 45, type: "Space Sim", videoUrl: "/videos/games/star_sentry.mp4" },
  { id: "fractal_maze", name: "Fractal Maze", level: 50, type: "Exploration", videoUrl: "/videos/games/fractal_maze.mp4" },
  { id: "omega_strike", name: "Omega Strike", level: 60, type: "Boss Rush", videoUrl: "/videos/games/omega_strike.mp4" },
  { id: "pet_arena", name: "PET Arena", level: 75, type: "PVP", videoUrl: "/videos/games/pet_arena.mp4" },
  { id: "governance_sim", name: "Governance Sim", level: 90, type: "Strategy", videoUrl: "/videos/games/governance_sim.mp4" },
  { id: "new_eden_mine", name: "New Eden Mine", level: 100, type: "Tycoon", videoUrl: "/videos/games/new_eden_mine.mp4" },
];

// ITEMS
const itemList = [
  { id: "d-rank-pickaxe", name: "D-Rank Pickaxe", rarity: "D-Rank", type: "WEAPON", price: 500, imageUrl: "/items/weapons/pickaxe_d.jpg" },
  { id: "plasma-rifle", name: "Plasma Rifle", rarity: "B-Rank", type: "WEAPON", price: 2500, imageUrl: "/items/weapons/plasma_rifle.jpg" },
  { id: "gravity-hammer", name: "Gravity Hammer", rarity: "C-Rank", type: "WEAPON", price: 1200, imageUrl: "/items/weapons/gravity_hammer.jpg" },
  { id: "void-blade", name: "Void Blade", rarity: "A-Rank", type: "WEAPON", price: 8000, imageUrl: "/items/weapons/void_blade.jpg" },
  { id: "neural-whip", name: "Neural Whip", rarity: "B-Rank", type: "WEAPON", price: 3000, imageUrl: "/items/weapons/neural_whip.jpg" },
  { id: "quantum-bow", name: "Quantum Bow", rarity: "S-Rank", type: "WEAPON", price: 15000, imageUrl: "/items/weapons/quantum_bow.jpg" },
  { id: "s-rank-shield", name: "S-Rank Kinetic Shield", rarity: "S-Rank", type: "ARMOR", price: 10000, imageUrl: "/items/armor/shield_s.jpg" },
  { id: "stealth-cloak", name: "Stealth Cloak", rarity: "A-Rank", type: "ARMOR", price: 4000, imageUrl: "/items/armor/stealth_cloak.jpg" },
  { id: "nano-suit", name: "Nano-Weave Suit", rarity: "B-Rank", type: "ARMOR", price: 3000, imageUrl: "/items/armor/nano_suit.jpg" },
  { id: "heavy-plate", name: "Titanium Plate", rarity: "C-Rank", type: "ARMOR", price: 1500, imageUrl: "/items/armor/heavy_plate.jpg" },
  { id: "core-booster", name: "Core Energy Booster", rarity: "B-Rank", type: "CONSUMABLE", price: 800, imageUrl: "/items/consumables/core_booster.jpg" },
  { id: "health-injector", name: "Health Injector", rarity: "D-Rank", type: "CONSUMABLE", price: 100, imageUrl: "/items/consumables/health_injector.jpg" },
  { id: "xp-tome", name: "Tome of Knowledge", rarity: "A-Rank", type: "CONSUMABLE", price: 5000, imageUrl: "/items/consumables/xp_tome.jpg" },
  { id: "void-badge", name: "Badge of the Void", rarity: "A-Rank", type: "ARTIFACT", price: 5000, imageUrl: "/items/artifacts/void_badge.jpg" },
  { id: "data-key", name: "Encrypted Data Key", rarity: "S-Rank", type: "ARTIFACT", price: 12000, imageUrl: "/items/artifacts/data_key.jpg" },
];

// AVATARS
const avatarList = [
    { id: "cyber_samurai", name: "Cyber Samurai", rarity: "Legendary", price: 20000, imageUrl: "/avatars/cyber_samurai.jpg" },
    { id: "neon_assassin", name: "Neon Assassin", rarity: "Epic", price: 12000, imageUrl: "/avatars/neon_assassin.jpg" },
    { id: "quantum_knight", name: "Quantum Knight", rarity: "Rare", price: 8000, imageUrl: "/avatars/quantum_knight.jpg" },
    { id: "void_walker", name: "Void Walker", rarity: "Epic", price: 11000, imageUrl: "/avatars/void_walker.jpg" },
    { id: "solar_vanguard", name: "Solar Vanguard", rarity: "Legendary", price: 25000, imageUrl: "/avatars/solar_vanguard.jpg" },
];

// ARENAS
const arenaList = [
    { id: "arena_void_pit", name: "The Void Pit", type: "Deathmatch", level: 10, videoUrl: "/videos/arenas/void_pit.mp4" },
    { id: "arena_neon_city", name: "Neon City Outskirts", type: "Team Control", level: 20, videoUrl: "/videos/arenas/neon_city.mp4" },
    { id: "arena_cyber_col", name: "Cyber Colosseum", type: "1v1 Duel", level: 50, videoUrl: "/videos/arenas/cyber_colosseum.mp4" },
];

const HeroSection: FC = () => (
    <div className="relative w-full h-[50vh] md:h-[60vh] shrink-0 snap-start bg-black overflow-hidden border-b border-white/10">
        <video 
            src="/videos/hero/main_cinematic.mp4" 
            autoPlay loop muted playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 text-center pb-16">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-black font-russo text-white uppercase tracking-tighter text-glow-primary">
                FEED LIVE
            </h1>
        </div>
        <motion.div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
        >
            <ChevronDown className="w-8 h-8" />
        </motion.div>
    </div>
);

const LandingPage: FC = () => {
  const { setActiveGameId } = useWebGL();
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const feedData: FeedItem[] = useMemo(() => {
      const feed: FeedItem[] = [];
      const getGame = (g: any) => ({ type: 'game' as const, id: g.id, title: g.name, subtitle: `LVL ${g.level} // ${g.type.toUpperCase()}`, videoUrl: g.videoUrl, data: g });
      const getItem = (i: any) => ({ type: 'item' as const, id: i.id, title: i.name, subtitle: `${i.rarity} // ${i.type}`, imageUrl: i.imageUrl, price: i.price, data: i });
      const getAvatar = (a: any) => ({ type: 'avatar' as const, id: a.id, title: a.name, subtitle: `SKIN // ${a.rarity}`, imageUrl: a.imageUrl, price: a.price, data: a });
      const getArena = (a: any) => ({ type: 'arena' as const, id: a.id, title: a.name, subtitle: `ARENA // ${a.type}`, videoUrl: a.videoUrl, data: a });

      const maxLen = Math.max(gamesList.length, itemList.length);
      for(let i=0; i<maxLen; i++) {
          if(gamesList[i]) feed.push(getGame(gamesList[i]));
          if(itemList[i]) feed.push(getItem(itemList[i]));
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
        <div className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
            <HeroSection />
            {feedData.map((item, index) => (
                <div key={`${item.type}-${item.id}-${index}`} className="snap-start w-full h-full flex items-center justify-center bg-black py-4">
                    {/* SIZE CONSTRAINT: 450x800 CONTAINER */}
                    <div className="w-full max-w-[450px] h-[800px] max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <GameTile 
                            game={item} 
                            onGameLaunch={handleLaunch} 
                        />
                    </div>
                </div>
            ))}
            <div className="snap-start w-full h-[20vh] flex items-center justify-center text-white/20 text-xs font-mono">
                // END OF FEED //
            </div>
        </div>
    </div>
  );
};

export default LandingPage;