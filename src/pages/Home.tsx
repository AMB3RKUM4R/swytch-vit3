import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useWebGL } from '@/components/context/WebglContext'; 
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import GameTile, { FeedItem } from '@/components/GameTile';

// DATA LISTS DUPLICATED FOR CONSISTENCY (Same lists as LandingPage)
const gamesList = [
  { id: "mana_miner", name: "Mana Miner", level: 1, type: "Extraction", videoUrl: "/videos/games/mana_miner.mp4" },
  { id: "gatekeeper", name: "Gatekeeper", level: 5, type: "Defense", videoUrl: "/videos/games/gatekeeper.mp4" },
  { id: "shadow_fix", name: "Shadow Fix", level: 10, type: "Puzzle", videoUrl: "/videos/games/shadow_fix.mp4" },
  { id: "tech_assault", name: "Tech Assault", level: 20, type: "Shooter", videoUrl: "/videos/games/tech_assault.mp4" },
  { id: "rift_defense", name: "Rift Defense", level: 25, type: "Tower Defense", videoUrl: "/videos/games/rift_defense.mp4" },
];
// ... (Include other lists: itemList, avatarList, arenaList here if you want full content in Home too)

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

const Home: FC = () => {
  const { setActiveGameId } = useWebGL();
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const feedData: FeedItem[] = useMemo(() => {
      const feed: FeedItem[] = [];
      const getGame = (g: any) => ({ type: 'game' as const, id: g.id, title: g.name, subtitle: `LVL ${g.level} // ${g.type.toUpperCase()}`, videoUrl: g.videoUrl, data: g });
      
      // Simple merge for Home (expand this if you want items mixed in here too)
      for(let i=0; i<gamesList.length; i++) {
          if(gamesList[i]) feed.push(getGame(gamesList[i]));
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
                    {/* SIZE CONSTRAINT: 450x800 */}
                    <div className="w-full max-w-[450px] h-[800px] max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <GameTile game={item} onGameLaunch={handleLaunch} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Home;