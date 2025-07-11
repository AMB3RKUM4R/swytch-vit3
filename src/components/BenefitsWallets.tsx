import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react'; // Import Lucide Wallet icon

// IMPORTANT: Import WalletOption and BenefitsWalletsProps from lib/types.ts
import { WalletOption, BenefitsWalletsProps as ImportedBenefitsWalletsProps } from '@/lib/types';
import SwytchCard from './SwytchCard';


// Wallet interface is now imported from lib/types.ts and renamed to WalletOption
const wallets: WalletOption[] = [ // Use WalletOption type
  { name: 'MetaMask', icon: Wallet },
  { name: 'WalletConnect', icon: Wallet },
  { name: 'Trust Wallet', icon: Wallet },
];

const tokens: string[] = ['JEWELS', 'SWYT', 'USDT', 'ETH']; // This array remains local, or could be moved to a constants file.

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Use ImportedBenefitsWalletsProps as the type for the FC
const BenefitsWallets: FC<ImportedBenefitsWalletsProps> = memo(({ userId, setActiveModal, setShowMessage }) => {
  // Removed const { setActiveModal, setShowMessage } = useModal(); as they are now passed as props

  const handleWalletConnect = (walletName: string) => { // Renamed 'wallet' parameter to 'walletName' to avoid conflict with local 'wallets' array
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) {
      setActiveModal('auth');
      setShowMessage(`⚠️ Sign in to connect ${walletName}!`);
      return;
    }
    setShowMessage(`ℹ️ Connecting ${walletName}...`);
    setActiveModal('payment'); // Trigger payment modal as intended
  };

  const handleTokenAction = (token: string) => {
    // Rely on userId prop for authentication check
    if (!userId) {
      setActiveModal('auth');
      setShowMessage(`⚠️ Sign in to use ${token}!`);
      return;
    }
    setShowMessage(`ℹ️ Depositing ${token}...`);
    setActiveModal('payment'); // Trigger payment modal
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Wallet className="w-6 h-6 text-cyan-400 animate-pulse" /> Supported Wallets & Tokens
        </h3>
        <p className="text-gray-300 max-w-xl mx-auto font-inter">Connect with WAGMI and use tokens across EVM chains.</p>
        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {wallets.map((wallet) => ( // Use the renamed 'wallet' variable
            <SwytchCard
              key={wallet.name}
              gradient="from-rose-500/20 to-cyan-500/20"
              onClick={() => handleWalletConnect(wallet.name)}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white font-poppins">
                {/* Dynamically render icon component */}
                <wallet.icon className="w-6 h-6 text-cyan-400 animate-pulse" />
                {wallet.name}
              </div>
            </SwytchCard>
          ))}
        </motion.div>
        <h4 className="text-lg font-semibold text-rose-400 font-poppins">Supported Tokens</h4>
        <motion.div variants={sectionVariants} className="flex flex-wrap justify-center gap-4">
          {tokens.map((token) => (
            <motion.span
              key={token}
              className="bg-rose-800/50 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-full text-sm font-poppins"
              whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
              onClick={() => handleTokenAction(token)}
            >
              {token}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

export default BenefitsWallets;