import { FC, useMemo } from 'react';
import { motion } from 'framer-motion'; 
import { ChevronDown, Sparkles } from 'lucide-react';
import { useWebGL } from '@/components/context/WebglContext'; 
import { useModal } from '@/components/context/ModalContext'; 
import { usePlayer } from '@/components/context/PlayerContext'; 
import GameTile, { FeedItem } from '@/components/GameTile'; 
import CurrencyHUD from '@/components/CurrencyHUD'; 
import AdDisplayPanel from '@/components/AdDisplayPanel'; 
import { staticShopItems } from '@/lib/staticShopData'; 
import { GAMES_LIST } from '@/lib/gameData'; // Import Master List

// Avatar/Arena lists kept separate as they are different entities
const avatarList = [
    { id: "cyber_samurai", name: "Cyber Samurai", rarity: "Legendary", price: 20000, imageUrl: "/avatars/cyber_samurai.jpg" },
    { id: "neon_assassin", name: "Neon Assassin", rarity: "Epic", price: 12000, imageUrl: "/avatars/neon_assassin.jpg" },
];

const LandingPage: FC = () => {
  const { setActiveGameId } = useWebGL();
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const feedData: FeedItem[] = useMemo(() => {
      const feed: FeedItem[] = [];
      
      const getGame = (g: any) => ({ 
          type: 'game' as const, 
          id: g.id, 
          title: g.name, 
          subtitle: `LVL ${g.level} // ${g.type.toUpperCase()}`, 
          imageUrl: g.imageUrl, // Uses the placeholder images
          data: g 
      });
      
      const getItem = (i: any) => ({ 
          type: 'item' as const, 
          id: i.id, 
          title: i.itemName, 
          subtitle: `${i.rarity} // ${i.itemType}`, 
          imageUrl: i.visuals?.iconName, 
          price: i.price?.usd ? i.price.usd * 100 : (i.price?.joules ? Math.floor(i.price.joules/10) : 100), 
          data: i 
      });

      const getAvatar = (a: any) => ({ type: 'avatar' as const, id: a.id, title: a.name, subtitle: `SKIN // ${a.rarity}`, imageUrl: a.imageUrl, price: a.price, data: a });

      // Use GAMES_LIST instead of the old hardcoded list
      const maxLen = Math.max(GAMES_LIST.length, staticShopItems.length, avatarList.length);
      
      for(let i=0; i<maxLen; i++) {
          if(GAMES_LIST[i]) feed.push(getGame(GAMES_LIST[i]));
          if(staticShopItems[i]) feed.push(getItem(staticShopItems[i]));
          if(i < avatarList.length) feed.push(getAvatar(avatarList[i]));
      }
      return feed;
  }, []);

  const handleLaunch = (id: string) => {
      if (!userId) {
          setShowMessage("⚠️ CONNECT WALLET TO ENTER");
          setActiveModal('auth');
      } else {
          // This will now pass the ID (e.g. "luck", "run") to the Home page logic
          setActiveGameId(id); 
      }
  };

  return (
    <div className="w-full h-full bg-black font-mono">
        <div className="fixed top-20 right-4 z-40 pointer-events-none">
             <div className="pointer-events-auto">
                <CurrencyHUD className="bg-black/80 backdrop-blur-md p-2 rounded-sm border border-gray-800" />
             </div>
        </div>

        <div className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
            
            {/* HERO SECTION */}
            <div className="relative w-full h-[60vh] shrink-0 snap-start bg-black overflow-hidden border-b border-gray-800">
                <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 text-center pb-24">
                    <Sparkles className="w-16 h-16 text-[#39FF14] mx-auto mb-6 animate-pulse" />
                    <h1 className="text-6xl font-black italic text-white uppercase tracking-tighter text-glow-primary mb-2">
                        FEED LIVE
                    </h1>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.5em]">SYSTEM ONLINE // V18.0</p>
                </div>
                <motion.div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#39FF14]"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ChevronDown className="w-8 h-8" />
                </motion.div>
            </div>

            {/* FEED ITEMS */}
            {feedData.map((item, index) => (
                <div key={`${item.type}-${item.id}-${index}`} className="snap-start w-full h-full flex items-center justify-center bg-black relative border-b border-gray-900">
                    <div className="w-full h-full md:w-full md:h-full relative">
                        <GameTile 
                            game={item} 
                            onGameLaunch={handleLaunch} 
                        />
                    </div>

                    {index > 0 && index % 5 === 0 && (
                        <div className="absolute bottom-0 left-0 w-full z-50 bg-black/95 border-t border-[#39FF14]/30 backdrop-blur-md p-2">
                            <AdDisplayPanel zoneType="native" />
                        </div>
                    )}
                </div>
            ))}
            
            <div className="snap-start w-full h-[20vh] flex items-center justify-center text-gray-700 text-xs font-mono uppercase tracking-widest">
                // END OF FEED //
            </div>
        </div>
    </div>
  );
};

export default LandingPage;