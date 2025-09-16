import { FC, useState, useEffect, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Link } from 'react-router-dom';
import { Sparkles, Package, Store } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay';
import ListForSaleModal from '../components/Inventory/ListForSaleModal';
import { PageProps, PlayerData, InventoryItem, ItemDefinition } from '../lib/types';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// Placeholder for your smart contract info




const Inventory: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  initialAuthCheckComplete,
  activeModal,
  updatePlayerFirestore,
  logTransaction,
  jewelsBalance,
  goldBalance,
  currentLevel,
  isPETMember,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerInventoryItems, setPlayerInventoryItems] = useState<Record<string, InventoryItem>>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemDefinition, setSelectedItemDefinition] = useState<ItemDefinition | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [itemDefinitions, setItemDefinitions] = useState<Record<string, ItemDefinition>>({});

  const { data: mintHash } = useWriteContract();
  useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => {
    const fetchItemDefinitions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ItemDefinitions"));
        const definitions: Record<string, ItemDefinition> = {};
        querySnapshot.forEach((doc) => {
          definitions[doc.id] = { id: doc.id, ...doc.data() } as ItemDefinition;
        });
        setItemDefinitions(definitions);
      } catch (error) {
        console.error("Error fetching item definitions:", error);
      }
    };
    fetchItemDefinitions();
  }, []);

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

  const handleListForSale = (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => {
    setSelectedItem(instance);
    setSelectedItemDefinition(definition);
    setSelectedInstanceId(instanceId);
    setShowListForSaleModal(true);
  };

  const onListingSuccess = (instanceId: string) => {
    const item = playerInventoryItems[instanceId];
    const definition = itemDefinitions[item.itemId];
    const itemName = definition?.itemName || 'Item';
    setShowMessage(`✅ ${itemName} listed for sale! (Requires backend verification)`);
    handleCloseListForSaleModal();
  };

  const handleCloseListForSaleModal = () => {
    setShowListForSaleModal(false);
    setSelectedItem(null);
    setSelectedItemDefinition(null);
    setSelectedInstanceId(null);
  };
  
  if (authLoading || isPending) {
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
          
          <motion.section className="text-center">
            <Package className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Cosmic Inventory
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter mb-8">
              Manage your galactic treasures, equip powerful gear, and list your NFTs on the marketplace.
            </p>
            <Link to="/marketplace" className="btn-system-glow text-lg font-semibold group">
                Go to Marketplace <Store className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </motion.section>

          <motion.section>
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Your Galactic Treasures
            </h2>
            <div className="p-4 sm:p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                <UserInventoryDisplay
                  playerData={playerData}
                  onListForSale={handleListForSale}
                  userId={userId}
                  setShowMessage={setShowMessage}
                />
            </div>
          </motion.section>
        </div>

        <AnimatePresence>
          {showListForSaleModal && selectedItem && selectedItemDefinition && selectedInstanceId && (
            <ListForSaleModal
              item={selectedItem}
              definition={selectedItemDefinition}
              instanceId={selectedInstanceId}
              userId={userId}
              onClose={handleCloseListForSaleModal}
              onSuccess={onListingSuccess}
              setShowMessage={setShowMessage}
              activeModal={activeModal}
              setActiveModal={setActiveModal}
              logTransaction={logTransaction}
              isPETMember={isPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
              jewelsBalance={jewelsBalance}
              goldBalance={goldBalance}
              currentLevel={currentLevel}
              isPending={isPending}
              authLoading={authLoading}
              initialAuthCheckComplete={initialAuthCheckComplete}
              playerData={playerData} setIsPETMember={function (_value: SetStateAction<boolean>): void {
                throw new Error('Function not implemented.');
              } }            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Inventory;