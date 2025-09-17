// src/pages/Shop.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import { PageProps, Level } from '@/lib/types';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';

const Shop: FC<PageProps> = ({
  userId,
  playerData,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  updatePlayerFirestore,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'membership'>('store');

  const handlePurchaseLevel = async (level: Level) => {
    // This logic should now live in the Membership page, but we'll keep a placeholder.
    setShowMessage(`ℹ️ Please visit the Membership page to purchase ${level.name}.`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
        case 'store':
            return (
                <motion.div className="text-center py-12">
                    <p className="text-muted-foreground">New items are coming soon!</p>
                    <Link to="/inventory" className="text-[hsl(var(--secondary))] hover:underline mt-2 inline-block">View Your Inventory</Link>
                </motion.div>
            );
        case 'membership':
            return (
                <motion.div>
                    <SwytchLevelsGrid 
                      userId={userId} 
                      currentLevel={playerData?.level || 0} 
                      isPending={isPending} 
                      authLoading={authLoading} 
                      updatePlayerFirestore={updatePlayerFirestore} 
                      handlePurchaseLevel={handlePurchaseLevel} 
                      setActiveModal={setActiveModal} 
                      setShowMessage={setShowMessage} 
                    />
                </motion.div>
            );
        default: return null;
    }
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div className="max-w-7xl mx-auto py-16 px-4">
        <h1 className="text-5xl font-extrabold text-center mb-4">Cosmic Store</h1>
        <p className="text-xl text-muted-foreground text-center mb-12">
          Your hub for acquiring new gear and upgrading your status.
        </p>
        <div className="flex justify-center mb-10">
            {(['store', 'membership'] as const).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-6 py-3 font-semibold capitalize ${activeTab === tab ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    {activeTab === tab && <motion.div layoutId="shop-tab" className="absolute inset-0 bg-primary/10 rounded-md" />}
                    {tab}
                </button>
            ))}
        </div>
        <div className="min-h-[400px] p-8 bg-black/20 rounded-lg">
            <AnimatePresence mode="wait">
                {renderTabContent()}
            </AnimatePresence>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Shop;