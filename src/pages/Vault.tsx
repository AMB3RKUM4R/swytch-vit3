// src/pages/Vault.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Wallet, Info, DollarSign, Star, SlidersHorizontal } from 'lucide-react';
import { useAccount, useGasPrice, useBalance, useChainId, useBlockNumber } from 'wagmi';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import VaultWalletInfo from '../components/vault/VaultWalletInfo';
import VaultMembershipPackages from '../components/vault/VaultMembershipPackages';
import VaultRules from '../components/vault/VaultRules';
import YieldCalculator from '../components/vault/YieldCalculator';
import { PageProps, PlayerData } from '../lib/types';

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

export const Vault: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'swaps' | 'membership' | 'tools'>('info');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: gasPrice } = useGasPrice();
  const { data: usdtBalance } = useBalance({ address, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' });
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

  const handleMembershipPayment = useCallback(async (packageName: string) => {
    if (!userId) { setShowMessage('⚠️ Sign in to buy membership!'); setActiveModal('auth'); return; }
    setShowMessage(`ℹ️ Initiating purchase for ${packageName}...`);
    setActiveModal('payment');
  }, [userId, setShowMessage, setActiveModal]);

  const handleCalculateYield = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setShowMessage('Calculating yield... (demo)');
    setTimeout(() => {
      setShowMessage('Estimated APY: 10% (placeholder)');
    }, 1500);
  }, [setShowMessage]);
  
  const renderTabContent = () => {
    switch (activeTab) {
        case 'info':
            return (
                <motion.div key="info" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <VaultWalletInfo isConnected={isConnected} address={address} chainId={chainId} ensName={null} blockNumber={currentBlockNumber || null} gasPrice={gasPrice} usdtBalance={usdtBalance} />
                </motion.div>
            );
        case 'swaps':
            return (
                <motion.div key="swaps" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <p className="text-center text-gray-400">Please use the payment modal to make a crypto deposit or swap.</p>
                </motion.div>
            );
        case 'membership':
            return (
                <motion.div key="membership" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <VaultMembershipPackages isMember={playerData?.isPETMember || false} isPending={isPending} handleMembershipPayment={handleMembershipPayment} setShowMessage={setShowMessage} />
                </motion.div>
            );
        case 'tools':
             return (
                <motion.div key="tools" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                    <div>
                        <h3 className="text-3xl font-bold font-russo mb-4 text-glow-primary">Yield Calculator</h3>
                        <YieldCalculator userId={userId} handleCalculateYield={handleCalculateYield} setShowMessage={setShowMessage} setActiveModal={setActiveModal} />
                    </div>
                     <div>
                        <h3 className="text-3xl font-bold font-russo mb-4 text-glow-primary">Vault Rules</h3>
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
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.section variants={sectionVariants} className="text-center">
            <Wallet className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Energy Vault
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Your command center for wallet info, currency swaps, and membership management.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-10 p-2 bg-black/20 border border-[hsl(var(--primary),0.1)] rounded-lg">
                {(['info', 'swaps', 'membership', 'tools'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative w-full text-center px-4 py-3 font-russo text-base sm:text-lg capitalize rounded-md transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {activeTab === tab && (
                            <motion.div layoutId="vault-tab-indicator" className="absolute inset-0 bg-[hsl(var(--primary),0.2)] rounded-md z-0" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           {tab === 'info' && <Info size={20} />}
                           {tab === 'swaps' && <DollarSign size={20} />}
                           {tab === 'membership' && <Star size={20} />}
                           {tab === 'tools' && <SlidersHorizontal size={20} />}
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

export default Vault;