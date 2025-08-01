import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, Package, Info, Store } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { PageProps, PlayerData, InventoryItem } from '../lib/types';

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

const Inventory: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  updatePlayerFirestore,
  initialAuthCheckComplete,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerInventoryItems, setPlayerInventoryItems] = useState<Record<string, InventoryItem>>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setPlayerInventoryItems(data.inventory?.items || {});
        } else {
          setPlayerData(null);
          setPlayerInventoryItems({});
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch inventory data:', err);
        setShowMessage('⚠️ Failed to load inventory. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setPlayerInventoryItems({});
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to view your inventory!');
        setActiveModal('auth');
      }
    }
  }, [userId, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  const handleListForSale = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowListForSaleModal(true);
  };

  const handleCloseListForSaleModal = () => {
    setShowListForSaleModal(false);
    setSelectedItem(null);
  };

  const onListingSuccess = (updatedItem: InventoryItem) => {
    setShowMessage(`✅ ${updatedItem.name} listed for sale! (Requires backend verification)`);
    handleCloseListForSaleModal();
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
        <StarfieldBackground />
        <motion.div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="/art24.jpg"
                  alt="PETverse Inventory"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Package className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Cosmic Inventory
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Manage your galactic treasures, list NFTs for sale, and showcase your collection in the PETverse.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('📦 Explore your cosmic inventory!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Manage Inventory"
                >
                  Manage Now <Package className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">View and manage your in-game items and NFTs in the PETverse!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Inventory Highlights */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Inventory Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starforged Blade',
                  image: '/art122.jpg',
                  description: 'A legendary NFT weapon for epic battles.',
                  tooltip: 'This blade boosts combat stats across PETverse games.',
                },
                {
                  name: 'Nebula Shield',
                  image: '/art12345.jpg',
                  description: 'A radiant shield for cosmic defense.',
                  tooltip: 'Enhances defense and protects in battles.',
                },
                {
                  name: 'Astral Gem',
                  image: '/art123.jpg',
                  description: 'A rare gem with mysterious powers.',
                  tooltip: 'Unlocks special abilities and boosts rewards.',
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
                        onClick={() => handleListForSale({ name: item.name, price: 100 } as unknown as InventoryItem)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        List for Sale
                      </motion.button>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Inventory Display */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Package className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Your Inventory
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <UserInventoryDisplay
                inventory={playerInventoryItems}
                onListForSale={handleListForSale}
                userId={userId}
                updatePlayerFirestore={updatePlayerFirestore}
                setShowMessage={setShowMessage}
                setActiveModal={setActiveModal}
                playerData={playerData}
              />
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Organize and list your NFTs for sale on the PETverse marketplace.
            </p>
          </motion.section>

          {/* Inventory Showcase */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Inventory Showcase
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="/art19.jpg"
                  alt="Inventory Showcase"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Display your most prized possessions and attract buyers across the galaxy.
            </p>
          </motion.section>

          {/* Marketplace Connection CTA */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-accent">
              <Store className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Marketplace Connection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              List your items on the PETverse marketplace and connect with traders galaxy-wide.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Trade on Marketplace"
                >
                  Trade Now <Store className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Visit the PETverse marketplace to buy and sell NFTs!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          <AnimatePresence>
            {showListForSaleModal && selectedItem && (
              <motion.div
                className="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ListForSaleModal
                  item={selectedItem}
                  userId={userId}
                  onClose={handleCloseListForSaleModal}
                  onSuccess={onListingSuccess}
                  setShowMessage={setShowMessage}
                  setActiveModal={setActiveModal}
                  updatePlayerFirestore={updatePlayerFirestore}
                  playerInventoryItems={playerInventoryItems}
                  playerEquipped={playerData?.inventory?.equipped || null}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Inventory;