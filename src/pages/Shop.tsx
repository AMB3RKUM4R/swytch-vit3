import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart, Star, Wallet } from 'lucide-react';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import RecentPurchases from '@/components/RecentPurchases';
import { PageProps, Purchase } from '@/lib/types';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';

const Shop: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  updatePlayerFirestore,
  currentLevel,
  isPending,
  authLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'wallet' | 'membership'>('store');
  const [recentPurchasesData] = useState<Purchase[]>([]); // You'll fetch this data here

  // You will need to implement this logic to call your smart contract
  const handlePurchaseLevel = async (level: { id: string; name: string; cost: number; contentRoute: string; level: number; }) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to purchase levels.');
      setActiveModal('auth');
      return;
    }
    // This function will be updated to call your smart contract
    setShowMessage(`ℹ️ Initiating purchase for ${level.name}...`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
        case 'store':
            return (
                <motion.div key="store" className="space-y-10">
                    <div>
                        <h3 className="text-3xl font-bold font-russo mb-4 text-glow-primary">Featured Items</h3>
                        <div className="text-center py-12 bg-black/20 rounded-lg border border-dashed border-[hsl(var(--primary),0.1)]">
                            <p className="text-muted-foreground font-inter">New items are coming soon!</p>
                            <Link to="/marketplace" className="text-[hsl(var(--secondary))] hover:underline mt-2 inline-block">Visit Player Marketplace</Link>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-3xl font-bold font-russo mb-4 text-glow-primary">Your Recent Purchases</h3>
                        <RecentPurchases recentPurchases={recentPurchasesData} />
                    </div>
                </motion.div>
            );
        case 'wallet':
            return (
                <motion.div key="wallet">
                     <h3 className="text-3xl font-bold font-russo mb-4 text-glow-primary">Currency Exchange</h3>
                    {/* The PaymentModal will be called from here to handle swaps */}
                    <p className="text-center text-gray-400">Please visit the Vault page for payments and swaps.</p>
                </motion.div>
            );
        case 'membership':
            return (
                <motion.div key="membership">
                    <h3 className="text-3xl font-bold font-russo mb-4 text-glow-primary">Upgrade Your Membership</h3>
                    <SwytchLevelsGrid userId={userId} currentLevel={currentLevel} isPending={isPending} authLoading={authLoading} updatePlayerFirestore={updatePlayerFirestore} handlePurchaseLevel={handlePurchaseLevel} setActiveModal={setActiveModal} setShowMessage={setShowMessage} />
                </motion.div>
            );
        default: return null;
    }
  }


  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.section className="text-center">
            <ShoppingCart className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Cosmic Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Your hub for acquiring new gear, managing currencies, and upgrading your status in the PETverse.
            </p>
          </motion.section>

          <motion.section>
            <div className="flex justify-center items-center gap-4 sm:gap-8 mb-10 p-2 bg-black/20 border border-[hsl(var(--primary),0.1)] rounded-lg">
                {(['store', 'wallet', 'membership'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative w-full text-center px-4 py-3 font-russo text-lg capitalize rounded-md transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {activeTab === tab && (
                            <motion.div layoutId="shop-tab-indicator" className="absolute inset-0 bg-[hsl(var(--primary),0.2)] rounded-md z-0" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           {tab === 'store' && <Store size={20} />}
                           {tab === 'wallet' && <Wallet size={20} />}
                           {tab === 'membership' && <Star size={20} />}
                           {tab}
                        </span>
                    </button>
                ))}
            </div>
            <div className="min-h-[400px] p-4 sm:p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                <AnimatePresence mode="wait">
                    {renderTabContent()}
                </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Shop;