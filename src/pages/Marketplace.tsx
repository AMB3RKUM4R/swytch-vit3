import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, Store, ShoppingCart, Info, Users } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import MarketplaceGrid from '../components/marketplace/MarketplaceGrid';
import BuyItemModal from '../components/marketplace/BuyItemModal';
import { PageProps, MarketItem } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.4 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const Marketplace: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [listedItems, setListedItems] = useState<MarketItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showBuyItemModal, setShowBuyItemModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'MarketItems'), where('isListedForSale', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MarketItem[] = [];
      snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        items.push(docSnap.data() as MarketItem);
      });
      setListedItems(items);
    }, (err) => {
      console.error('Failed to fetch marketplace items:', err);
      setShowMessage('⚠️ Failed to load marketplace items. Please check your connection.');
      setActiveModal('error');
    });
    return () => unsubscribe();
  }, [setShowMessage, setActiveModal]);

  const handleBuyItem = (item: MarketItem) => {
    if (!userId && initialAuthCheckComplete) {
      setShowMessage('⚠️ Please sign in to buy items!');
      setActiveModal('auth');
      return;
    }
    setSelectedItem(item);
    setShowBuyItemModal(true);
  };

  const handleCloseBuyItemModal = () => {
    setShowBuyItemModal(false);
    setSelectedItem(null);
  };

  const onPurchaseSuccess = (purchasedItem: MarketItem) => {
    setShowMessage(`✅ You bought ${purchasedItem.name}! (Requires backend verification)`);
    handleCloseBuyItemModal();
  };

  if (authLoading || isPending) {
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 3D Starfield Background */}
        <StarfieldBackground />

        <motion.div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Galactic+Marketplace"
                  alt="PETverse Marketplace"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Store className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Galactic Marketplace
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Trade rare NFTs and cosmic treasures in the PETverse’s decentralized marketplace. Secure your loot among the stars.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('🛒 Start trading in the galactic market!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Explore Marketplace"
                >
                  Explore Now <ShoppingCart className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Buy and sell unique items using JEWELS or crypto in our secure marketplace!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Market Highlights */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Featured Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'Cosmic Blade',
                  image: 'https://via.placeholder.com/300x200?text=Cosmic+Blade',
                  description: 'A legendary NFT weapon forged in the stars.',
                  tooltip: 'This rare blade boosts your combat stats in the PETverse.',
                },
                {
                  name: 'Stellar Armor',
                  image: 'https://via.placeholder.com/300x200?text=Stellar+Armor',
                  description: 'Protect yourself with this radiant NFT armor.',
                  tooltip: 'Enhances defense across all PETverse games.',
                },
                {
                  name: 'Astral Gem',
                  image: 'https://via.placeholder.com/300x200?text=Astral+Gem',
                  description: 'A rare gem with mysterious powers.',
                  tooltip: 'Unlocks special abilities and boosts rewards.',
                },
                {
                  name: 'Nebula Orb',
                  image: 'https://via.placeholder.com/300x200?text=Nebula+Orb',
                  description: 'Harness cosmic energy with this orb.',
                  tooltip: 'Grants unique gameplay perks and trade value.',
                },
              ].map((item, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      <motion.button
                        className="btn-accent mt-4 text-sm"
                        onClick={() => handleBuyItem({ name: item.name, price: 100, isListedForSale: true } as unknown as MarketItem)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Buy Now
                      </motion.button>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Marketplace Grid */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <ShoppingCart className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              All Listings
            </h2>
            <MarketplaceGrid
              items={listedItems}
              onBuyItem={handleBuyItem}
              userId={userId}
              setShowMessage={setShowMessage}
              setActiveModal={setActiveModal}
            />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Browse and acquire unique NFTs from players across the galaxy. All transactions are secured by blockchain.
            </p>
          </motion.section>

          {/* Community Trading Hub CTA */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-accent">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Join the Trading Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Connect with traders, share strategies, and dominate the PETverse marketplace.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join Trading Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Join our Discord or X community to trade tips and items!</p>
              </DialogContent>
            </Dialog>
          </motion.section>
        </motion.div>

        <AnimatePresence>
          {showBuyItemModal && selectedItem && (
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BuyItemModal
  item={selectedItem}
  userId={userId}
  onClose={handleCloseBuyItemModal}
  onSuccess={onPurchaseSuccess}
  setShowMessage={setShowMessage}
  setActiveModal={setActiveModal}
/>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Marketplace;