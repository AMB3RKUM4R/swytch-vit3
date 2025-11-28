// src/pages/Vault.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Info, Star, SlidersHorizontal, FileText, Brain, Scale } from 'lucide-react';
import { useAccount, useGasPrice, useBalance, useChainId, useBlockNumber } from 'wagmi';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import VaultWalletInfo from '../components/vault/VaultWalletInfo';
import VaultMembershipPackages from '../components/vault/VaultMembershipPackages';
import VaultRules from '../components/vault/VaultRules';
import YieldCalculator from '../components/vault/YieldCalculator';
import VaultMembershipBenefits from '../components/vault/VaultMembershipBenefits';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import SwytchCard from '@/components/SwytchCard';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const Vault: FC = () => {
  const { userId, initialAuthCheckComplete } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const [activeTab, setActiveTab] = useState<'info' | 'membership' | 'tools'>('info');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: gasPrice } = useGasPrice();
  
  const { data: usdtBalance } = useBalance({ 
    address, 
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
    query: { select: (data) => data }
  });
  
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

  // Simplified auth check for vault
  useEffect(() => {
    if (!userId && initialAuthCheckComplete) {
      setShowMessage('⚠️ Please sign in to access the vault!');
      setActiveModal('auth');
    }
  }, [userId, initialAuthCheckComplete, setShowMessage, setActiveModal]);
  
  const usdtBalanceData = usdtBalance 
    ? {
      formatted: usdtBalance.formatted,
      value: usdtBalance.value,
      symbol: usdtBalance.symbol,
      decimals: usdtBalance.decimals,
    }
    : undefined;

  const renderTabContent = () => {
    switch (activeTab) {
        case 'info':
            return (
                <motion.div key="info" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <VaultWalletInfo 
                      isConnected={isConnected} 
                      address={address} 
                      chainId={chainId} 
                      ensName={null}
                      blockNumber={currentBlockNumber || null} 
                      gasPrice={gasPrice} 
                      usdtBalance={usdtBalanceData}
                    />
                </motion.div>
            );
        case 'membership':
            return (
                <motion.div key="membership" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                    <VaultMembershipPackages />
                    <VaultMembershipBenefits />
                </motion.div>
            );
        case 'tools':
             return (
                <motion.div key="tools" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                    <YieldCalculator />
                    <VaultRules />
                </motion.div>
            );
        default: return null;
    }
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
            <Wallet className="mx-auto w-16 h-16 text-primary text-glow-primary mb-4" />
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4 font-russo">
              Energy Vault
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Your command center for wallet info, membership, and financial tools.
            </p>
          </motion.section>

          {/* --- NEW PHILOSOPHY CALLOUT (Restored) --- */}
          <motion.section variants={sectionVariants}>
            <SwytchCard variant="holographic" className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <Brain className="w-10 h-10 text-primary mb-3" />
                  <h3 className="text-xl font-poppins font-semibold text-foreground mb-2">Psychological Shift</h3>
                  <p className="text-sm text-muted-foreground font-inter">You are a **Beneficiary**, not an investor. You are entitled to earn.</p>
                </div>
                <div className="flex flex-col items-center">
                  <Scale className="w-10 h-10 text-primary mb-3" />
                  <h3 className="text-xl font-poppins font-semibold text-foreground mb-2">Ethical & Defensive</h3>
                  <p className="text-sm text-muted-foreground font-inter">We focus on **value creation**, not speculation. This is sustainable and built for the long game.</p>
                </div>
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-primary mb-3" />
                  <h3 className="text-xl font-poppins font-semibold text-foreground mb-2">The PET Omertà</h3>
                  <p className="text-sm text-muted-foreground font-inter">"We honor Energy. We protect Truth. We uphold the Freedom to Earn."</p>
                </div>
              </div>
            </SwytchCard>
          </motion.section>

          {/* --- MAIN VAULT TABS --- */}
          <motion.section variants={sectionVariants}>
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-10 p-2 bg-card border border-border rounded-lg">
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