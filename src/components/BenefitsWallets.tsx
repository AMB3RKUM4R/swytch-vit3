import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Coins } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface Wallet {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const wallets: Wallet[] = [
  { name: 'MetaMask', icon: Wallet },
  { name: 'WalletConnect', icon: Wallet },
  { name: 'Trust Wallet', icon: Wallet },
];

const tokens: string[] = ['JEWELS', 'SWYT', 'USDT', 'ETH'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const BenefitsWallets: FC = memo(() => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleWalletConnect = (wallet: string) => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage(`⚠️ Sign in to connect ${wallet}!`);
      return;
    }
    setShowMessage(`ℹ️ Connecting ${wallet}...`);
    setActiveModal('payment'); // Prompt deposit post-connection
  };

  const handleTokenAction = (token: string) => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage(`⚠️ Sign in to use ${token}!`);
      return;
    }
    setShowMessage(`ℹ️ Depositing ${token}...`);
    setActiveModal('payment');
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
          {wallets.map((wallet) => (
            <SwytchCard
              key={wallet.name}
              gradient="from-rose-500/20 to-cyan-500/20"
              onClick={() => handleWalletConnect(wallet.name)}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white font-poppins">
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