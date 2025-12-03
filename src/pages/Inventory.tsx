import { FC, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, User, ArrowRight } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent'; 
import UserInventoryDisplay from '../components/Inventory/UserInventoryDisplay'; 
import ListForSaleModal from '../components/Inventory/ListForSaleModal'; 
import { InventoryItem, ItemDefinition } from '../lib/types'; 
import { useModal } from '../components/context/ModalContext'; 
import { usePlayer } from '../components/context/PlayerContext'; 
import { useWebGL } from '../components/context/WebglContext'; 
import SwytchCard from '../components/SwytchCard'; 
import MembershipStatusOverview from '../components/home/MembershipStatusOverview'; 
import GameLoginButton from '../components/Inventory/GameLoginButton'; 
import GameDownloadButton from '../components/Inventory/GameDownloadButton'; 

// --- CONFIGURATION ---
const CUSTOMIZE_STAGE_ID = "CustomizeScene"; // This ID must match the key in BUILD_MAP in UnityStage.tsx

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const Inventory: FC = () => {
  const { setActiveModal, setShowMessage } = useModal();
  const { userId, playerData } = usePlayer();
  const { setActiveGameId } = useWebGL();

  const [selectedItem, setSelectedItem] = useState<{instance: InventoryItem, definition: ItemDefinition, instanceId: string} | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);


  const handleListForSale = (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => {
    if (!userId || !playerData) {
        setShowMessage('⚠️ Please synchronize your signature to list items for sale.');
        setActiveModal('auth');
        return;
    }
    setSelectedItem({ instance, definition, instanceId });
    setShowListForSaleModal(true);
  };

  const onListingSuccess = (instanceId: string) => {
    setShowMessage(`✅ Item ${instanceId} listed for sale!`);
    setShowListForSaleModal(false);
    setSelectedItem(null);
  };
  
  const handleLaunchCustomization = useCallback(() => {
    if (!userId) {
        setShowMessage('⚠️ Please synchronize your signature to modify your Hunter Archetype.');
        setActiveModal('auth');
        return;
    }
    // Launch the 3D WebGL Customization Stage
    setActiveGameId(CUSTOMIZE_STAGE_ID);
    setShowMessage("Launching 3D Sentinel Terminal for Identity Genesis...");
  }, [userId, setActiveModal, setShowMessage, setActiveGameId]);


  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="min-h-screen text-foreground max-w-7xl mx-auto py-24 px-4"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div className="text-center mb-12" variants={sectionVariants}>
          <Package className="mx-auto w-16 h-16 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-2">
            Cosmic Inventory
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            Manage your character, status, and galactic treasures.
          </p>
        </motion.div>
        
        {/* --- 2-COLUMN LAYOUT --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={sectionVariants}
        >
          {/* --- LEFT COLUMN (1/3 width) --- */}
          <div className="md:col-span-1 flex flex-col gap-8">
            
            {/* 3D Launch Button */}
            <SwytchCard variant="holographic" className="p-6 text-center">
                <h2 className="text-2xl font-semibold font-poppins mb-4 text-primary">Hunter Archetype</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Launch the 3D Sentinel Terminal to preview and equip gear.
                </p>
                <motion.button
                    onClick={handleLaunchCustomization}
                    className="btn-primary w-full flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <User className="w-5 h-5 mr-2" /> View 3D Archetype <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
            </SwytchCard>
            
            {/* Game Launcher buttons card */}
            <motion.div
              variants={sectionVariants}
              className="bg-card p-6 rounded-lg border border-border"
            >
              <h2 className="text-2xl font-semibold font-poppins mb-4 text-primary">System Access</h2>
              <div className="grid grid-cols-1 gap-4">
                <GameLoginButton /> 
                <GameDownloadButton />
              </div>
            </motion.div>

            <MembershipStatusOverview />
          </div>

          {/* --- RIGHT COLUMN (2/3 width) --- */}
          <div className="md:col-span-2">
            <UserInventoryDisplay
              playerData={playerData}
              userId={userId}
              onListForSale={handleListForSale}
            />
          </div>
        </motion.div>
        
        <AnimatePresence>
          {showListForSaleModal && selectedItem && (
            <ListForSaleModal
              itemDefinition={selectedItem.definition}
              instanceId={selectedItem.instanceId}
              onClose={() => setShowListForSaleModal(false)}
              onSuccess={onListingSuccess} 
              itemInstance={selectedItem.instance}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Inventory;