// src/pages/Vault.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Wallet, Info, Star, SlidersHorizontal } from 'lucide-react';
import { useAccount, useGasPrice, useBalance, useChainId, useBlockNumber } from 'wagmi';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import VaultWalletInfo from '../components/vault/VaultWalletInfo';
import VaultMembershipPackages from '../components/vault/VaultMembershipPackages';
import VaultRules from '../components/vault/VaultRules';
import YieldCalculator from '../components/vault/YieldCalculator';
import { PlayerData } from '../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const Vault: FC = () => {
  // Get all data from our new contexts
  const { 
    userId, 
    setIsPETMember, 
    dataLoading, 
    authLoading, 
    initialAuthCheckComplete 
  } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // isPending from PageProps is now dataLoading from usePlayer
  const isPending = dataLoading;

  const [, setPlayerData] = useState<PlayerData | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'membership' | 'tools'>('info'); // Removed 'swaps'

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: gasPrice } = useGasPrice();
  // FIX: Added symbol and decimals to the balance query
  const { data: usdtBalance } = useBalance({ 
    address, 
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    query: {
      select: (data) => ({
        formatted: data.formatted,
        value: data.value,
        symbol: data.symbol,
        decimals: data.decimals,
      }),
    }
  });
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setIsPETMember(data.isPETMember || false);
        } else if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please sign in.');
            setActiveModal('auth');
        }
      });
      return () => unsubscribe();
    } else if (initialAuthCheckComplete) {
      setShowMessage('⚠️ Please sign in to access the vault!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);
  
  const renderTabContent = () => {
    switch (activeTab) {
        case 'info':
            return (
                <motion.div key="info" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    {/* FIX: Props are correctly passed now */}
                    <VaultWalletInfo 
                      isConnected={isConnected} 
                      address={address} 
                      chainId={chainId} 
                      ensName={null} 
                      blockNumber={currentBlockNumber || null} 
                      gasPrice={gasPrice} 
                      usdtBalance={usdtBalance} 
                    />
                </motion.div>
            );
        case 'membership':
            return (
                <motion.div key="membership" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    {/* FIX: Removed all props. Component is self-sufficient. */}
                    <VaultMembershipPackages />
                </motion.div>
            );
        case 'tools':
             return (
                <motion.div key="tools" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                    <div>
                        <h3 className="text-3xl font-bold font-poppins mb-4 text-foreground">Yield Calculator</h3>
                        {/* FIX: Removed all props. Component is self-sufficient. */}
                        <YieldCalculator />
                    </div>
                     <div>
                        <h3 className="text-3xl font-bold font-poppins mb-4 text-foreground">Vault Rules</h3>
                        <VaultRules />
                    </div>
                </motion.div>
            );
        default: return null;
    }
  }

  if (authLoading || isPending) {
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-poppins bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.section variants={sectionVariants} className="text-center">
            <Wallet className="mx-auto w-16 h-16 text-primary mb-4" />
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Energy Vault
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Your command center for wallet info, currency swaps, and membership.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-10 p-2 bg-black/20 border border-border rounded-lg">
                {(['info', 'membership', 'tools'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative w-full text-center px-4 py-3 font-poppins font-semibold text-base sm:text-lg capitalize rounded-md transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {activeTab === tab && (
                            <motion.div layoutId="vault-tab-indicator" className="absolute inset-0 bg-primary/10 rounded-md z-0" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           {tab === 'info' && <Info size={20} />}
                           {tab === 'membership' && <Star size={20} />}
                           {tab === 'tools' && <SlidersHorizontal size={20} />}
                           {tab}
                        </span>
                    </button>
                ))}
            </div>
            <div className="min-h-[400px]">
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

export default Vault;

